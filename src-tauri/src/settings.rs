// src-tauri/src/settings.rs
use serde::{Deserialize, Serialize};
use tauri::command;
use std::fs;
use std::path::PathBuf;
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiKeys {
    pub wappalyzer: Option<String>,
    pub screenshot_api: Option<String>,
    pub google_drive_client_id: Option<String>,
    pub google_drive_client_secret: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CloudSettings {
    pub provider: String,
    pub auto_backup: bool,
    pub backup_frequency: u32,
    pub last_backup: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub api_keys: ApiKeys,
    pub cloud_settings: CloudSettings,
    pub theme: String,
    pub enable_notifications: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            api_keys: ApiKeys {
                wappalyzer: None,
                screenshot_api: None,
                google_drive_client_id: None,
                google_drive_client_secret: None,
            },
            cloud_settings: CloudSettings {
                provider: "google-drive".to_string(),
                auto_backup: false,
                backup_frequency: 24,
                last_backup: None,
            },
            theme: "system".to_string(),
            enable_notifications: true,
        }
    }
}

// Encryption key management
fn get_encryption_key() -> Result<Vec<u8>, String> {
    let key_path = get_key_path()?;
    
    if key_path.exists() {
        let key_data = fs::read(&key_path)
            .map_err(|e| format!("Failed to read encryption key: {}", e))?;
        Ok(key_data)
    } else {
        // Generate new key
        let key = Aes256Gcm::generate_key(&mut OsRng);
        fs::write(&key_path, key.as_slice())
            .map_err(|e| format!("Failed to save encryption key: {}", e))?;
        Ok(key.to_vec())
    }
}

fn get_key_path() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?;
    
    let app_dir = config_dir.join("website-monitor");
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;
    
    Ok(app_dir.join(".encryption_key"))
}

fn get_settings_path() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?;
    
    let app_dir = config_dir.join("website-monitor");
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;
    
    Ok(app_dir.join("settings.enc"))
}

// Encrypt sensitive data
fn encrypt_data(data: &str) -> Result<String, String> {
    let key_bytes = get_encryption_key()?;
    let key = aes_gcm::Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    
    // Generate a random nonce
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    
    let ciphertext = cipher
        .encrypt(&nonce, data.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;
    
    // Combine nonce + ciphertext and encode as base64
    let mut combined = nonce.to_vec();
    combined.extend_from_slice(&ciphertext);
    
    Ok(general_purpose::STANDARD.encode(&combined))
}

// Decrypt sensitive data
fn decrypt_data(encrypted: &str) -> Result<String, String> {
    let key_bytes = get_encryption_key()?;
    let key = aes_gcm::Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    
    let combined = general_purpose::STANDARD
        .decode(encrypted)
        .map_err(|e| format!("Base64 decode failed: {}", e))?;
    
    if combined.len() < 12 {
        return Err("Invalid encrypted data".to_string());
    }
    
    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);
    
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;
    
    String::from_utf8(plaintext)
        .map_err(|e| format!("UTF-8 conversion failed: {}", e))
}

#[command]
pub async fn save_settings(settings: AppSettings) -> Result<(), String> {
    // Encrypt sensitive API keys
    let mut encrypted_settings = settings.clone();
    
    if let Some(ref key) = settings.api_keys.wappalyzer {
        encrypted_settings.api_keys.wappalyzer = Some(encrypt_data(key)?);
    }
    
    if let Some(ref key) = settings.api_keys.screenshot_api {
        encrypted_settings.api_keys.screenshot_api = Some(encrypt_data(key)?);
    }
    
    if let Some(ref key) = settings.api_keys.google_drive_client_id {
        encrypted_settings.api_keys.google_drive_client_id = Some(encrypt_data(key)?);
    }
    
    if let Some(ref key) = settings.api_keys.google_drive_client_secret {
        encrypted_settings.api_keys.google_drive_client_secret = Some(encrypt_data(key)?);
    }
    
    let settings_path = get_settings_path()?;
    let json = serde_json::to_string_pretty(&encrypted_settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(&settings_path, json)
        .map_err(|e| format!("Failed to save settings: {}", e))?;
    
    println!("Settings saved successfully to: {:?}", settings_path);
    Ok(())
}

#[command]
pub async fn load_settings() -> Result<AppSettings, String> {
    let settings_path = get_settings_path()?;
    
    if !settings_path.exists() {
        println!("No settings file found, returning defaults");
        return Ok(AppSettings::default());
    }
    
    let json = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;
    
    let mut settings: AppSettings = serde_json::from_str(&json)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;
    
    // Decrypt sensitive API keys
    if let Some(ref encrypted_key) = settings.api_keys.wappalyzer {
        settings.api_keys.wappalyzer = decrypt_data(encrypted_key).ok();
    }
    
    if let Some(ref encrypted_key) = settings.api_keys.screenshot_api {
        settings.api_keys.screenshot_api = decrypt_data(encrypted_key).ok();
    }
    
    if let Some(ref encrypted_key) = settings.api_keys.google_drive_client_id {
        settings.api_keys.google_drive_client_id = decrypt_data(encrypted_key).ok();
    }
    
    if let Some(ref encrypted_key) = settings.api_keys.google_drive_client_secret {
        settings.api_keys.google_drive_client_secret = decrypt_data(encrypted_key).ok();
    }
    
    println!("Settings loaded successfully");
    Ok(settings)
}

#[command]
pub async fn get_api_key(key_name: String) -> Result<Option<String>, String> {
    let settings = load_settings().await?;
    
    let key = match key_name.as_str() {
        "wappalyzer" => settings.api_keys.wappalyzer,
        "screenshot_api" => settings.api_keys.screenshot_api,
        "google_drive_client_id" => settings.api_keys.google_drive_client_id,
        "google_drive_client_secret" => settings.api_keys.google_drive_client_secret,
        _ => return Err(format!("Unknown API key: {}", key_name)),
    };
    
    Ok(key)
}

#[command]
pub async fn delete_all_settings() -> Result<(), String> {
    let settings_path = get_settings_path()?;
    let key_path = get_key_path()?;
    
    if settings_path.exists() {
        fs::remove_file(&settings_path)
            .map_err(|e| format!("Failed to delete settings: {}", e))?;
    }
    
    if key_path.exists() {
        fs::remove_file(&key_path)
            .map_err(|e| format!("Failed to delete encryption key: {}", e))?;
    }
    
    println!("All settings and encryption keys deleted");
    Ok(())
}

#[command]
pub async fn export_settings_unencrypted() -> Result<String, String> {
    let settings = load_settings().await?;
    
    serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))
}