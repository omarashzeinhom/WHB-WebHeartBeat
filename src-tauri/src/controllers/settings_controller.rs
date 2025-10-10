// src-tauri/src/controllers/settings_controller.rs

use tauri::command;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiKeys {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wappalyzer: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "screenshotApi")]
    pub screenshot_api: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "googleDriveClientId")]
    pub google_drive_client_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "googleDriveClientSecret")]
    pub google_drive_client_secret: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CloudSettings {
    pub provider: String,
    #[serde(rename = "autoBackup")]
    pub auto_backup: bool,
    #[serde(rename = "backupFrequency")]
    pub backup_frequency: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "lastBackup")]
    pub last_backup: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    #[serde(rename = "apiKeys")]
    pub api_keys: ApiKeys,
    #[serde(rename = "cloudSettings")]
    pub cloud_settings: CloudSettings,
    pub theme: String,
    #[serde(rename = "enableNotifications")]
    pub enable_notifications: bool,
}

/// Get the path to the settings file
fn get_settings_path() -> Result<PathBuf, String> {
    // Get the app's config directory
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?;
    
    // Create app-specific directory
    let app_dir = config_dir.join("webhealth-monitor");
    
    // Create directory if it doesn't exist
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app directory: {}", e))?;
    }
    
    Ok(app_dir.join("settings.json"))
}

/// Save application settings
#[command]
pub async fn save_settings(settings: AppSettings) -> Result<(), String> {
    println!("📝 Saving settings...");
    
    let settings_path = get_settings_path()?;
    
    // Serialize settings to JSON with pretty printing
    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    // Write to file
    fs::write(&settings_path, json)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    
    println!("✅ Settings saved successfully to: {:?}", settings_path);
    Ok(())
}

/// Load application settings
#[command]
pub async fn load_settings() -> Result<Option<AppSettings>, String> {
    println!("📖 Loading settings...");
    
    let settings_path = get_settings_path()?;
    
    // Check if settings file exists
    if !settings_path.exists() {
        println!("ℹ️ Settings file doesn't exist yet, returning None");
        return Ok(None);
    }
    
    // Read file contents
    let contents = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;
    
    // Parse JSON
    let settings: AppSettings = serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse settings JSON: {}", e))?;
    
    println!("✅ Settings loaded successfully from: {:?}", settings_path);
    Ok(Some(settings))
}

/// Get a specific API key by name
#[command]
pub async fn get_api_key(key_name: String) -> Result<Option<String>, String> {
    println!("🔑 Getting API key: {}", key_name);
    
    let settings_opt = load_settings().await?;
    
    if let Some(settings) = settings_opt {
        let key = match key_name.as_str() {
            "wappalyzer" => settings.api_keys.wappalyzer,
            "screenshot_api" => settings.api_keys.screenshot_api,
            "google_drive_client_id" => settings.api_keys.google_drive_client_id,
            "google_drive_client_secret" => settings.api_keys.google_drive_client_secret,
            _ => {
                println!("⚠️ Unknown API key name: {}", key_name);
                None
            }
        };
        
        if key.is_some() {
            println!("✅ API key found for: {}", key_name);
        } else {
            println!("ℹ️ No API key found for: {}", key_name);
        }
        
        Ok(key)
    } else {
        println!("ℹ️ No settings found");
        Ok(None)
    }
}

/// Delete all settings
#[command]
pub async fn delete_all_settings() -> Result<(), String> {
    println!("🗑️ Deleting all settings...");
    
    let settings_path = get_settings_path()?;
    
    if settings_path.exists() {
        fs::remove_file(&settings_path)
            .map_err(|e| format!("Failed to delete settings file: {}", e))?;
        println!("✅ Settings deleted successfully");
    } else {
        println!("ℹ️ No settings file to delete");
    }
    
    Ok(())
}

/// Export settings as unencrypted JSON string
#[command]
pub async fn export_settings_unencrypted() -> Result<String, String> {
    println!("📤 Exporting settings...");
    
    let settings_opt = load_settings().await?;
    
    if let Some(settings) = settings_opt {
        let json = serde_json::to_string_pretty(&settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;
        println!("✅ Settings exported successfully");
        Ok(json)
    } else {
        println!("ℹ️ No settings to export");
        Ok("{}".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_save_and_load_settings() {
        let test_settings = AppSettings {
            api_keys: ApiKeys {
                wappalyzer: Some("test_key".to_string()),
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
            theme: "dark".to_string(),
            enable_notifications: true,
        };

        // Save settings
        let save_result = save_settings(test_settings.clone()).await;
        assert!(save_result.is_ok());

        // Load settings
        let load_result = load_settings().await;
        assert!(load_result.is_ok());
        
        let loaded = load_result.unwrap();
        assert!(loaded.is_some());
        
        let loaded_settings = loaded.unwrap();
        assert_eq!(loaded_settings.theme, "dark");
    }
}