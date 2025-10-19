use crate::models::website::Website;
use once_cell::sync::Lazy;
use rand::Rng;
use reqwest;
use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::Mutex;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct CloudBackupResult {
    pub success: bool,
    pub message: String,
    pub backup_path: Option<String>,
    pub drive_url: Option<String>,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleAuthResult {
    pub success: bool,
    pub message: String,
    pub auth_url: Option<String>,
}

// Thread-safe storage for OAuth state
static OAUTH_STATE: Lazy<Mutex<Option<String>>> = Lazy::new(|| Mutex::new(None));
static GOOGLE_TOKENS: Lazy<Mutex<Option<GoogleTokens>>> = Lazy::new(|| Mutex::new(None));

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GoogleTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_in: i64,
}

#[command]
pub async fn start_google_drive_auth() -> Result<GoogleAuthResult, String> {
    let client_id = "YOUR_CLIENT_ID"; // You'll need to set this up in Google Cloud Console
    let redirect_uri = "http://localhost:8080/auth/callback";
    let scope = "https://www.googleapis.com/auth/drive.file";

    // Generate random state for security
    let state: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(16)
        .map(char::from)
        .collect();

    {
        let mut oauth_state = OAUTH_STATE.lock().unwrap();
        *oauth_state = Some(state.clone());
    }

    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?\
         client_id={}&\
         redirect_uri={}&\
         response_type=code&\
         scope={}&\
         state={}&\
         access_type=offline&\
         prompt=consent",
        client_id, redirect_uri, scope, state
    );

    Ok(GoogleAuthResult {
        success: true,
        message: "Open this URL in your browser to authenticate".to_string(),
        auth_url: Some(auth_url),
    })
}

#[command]
pub async fn complete_google_drive_auth(
    code: String,
    state: String,
) -> Result<CloudBackupResult, String> {
    // Verify state matches
    {
        let oauth_state = OAUTH_STATE.lock().unwrap();
        if oauth_state.as_ref() != Some(&state) {
            return Err("Invalid state parameter".to_string());
        }
    }

    let client_id = "YOUR_CLIENT_ID";
    let client_secret = "YOUR_CLIENT_SECRET"; // Get from Google Cloud Console
    let redirect_uri = "http://localhost:8080/auth/callback";

    let token_url = "https://oauth2.googleapis.com/token";

    let params = [
        ("client_id", client_id),
        ("client_secret", client_secret),
        ("code", &code),
        ("grant_type", "authorization_code"),
        ("redirect_uri", redirect_uri),
    ];

    let client = reqwest::Client::new();
    let response = client
        .post(token_url)
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to get access token: {}", e))?;

    if response.status().is_success() {
        let token_data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse token response: {}", e))?;

        let access_token = token_data["access_token"]
            .as_str()
            .ok_or("No access token in response")?
            .to_string();

        let refresh_token = token_data["refresh_token"].as_str().map(|s| s.to_string());

        let expires_in = token_data["expires_in"].as_i64().unwrap_or(3600);

        let tokens = GoogleTokens {
            access_token,
            refresh_token,
            expires_in,
        };

        {
            let mut google_tokens = GOOGLE_TOKENS.lock().unwrap();
            *google_tokens = Some(tokens);
        }

        Ok(CloudBackupResult {
            success: true,
            message: "Successfully authenticated with Google Drive".to_string(),
            backup_path: None,
            drive_url: None,
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    } else {
        let error_text = response.text().await.unwrap_or_default();
        Err(format!("Authentication failed: {}", error_text))
    }
}

#[command]
pub async fn backup_to_google_drive(websites: Vec<Website>) -> Result<CloudBackupResult, String> {
    let tokens = {
        let google_tokens = GOOGLE_TOKENS.lock().unwrap();
        google_tokens
            .clone()
            .ok_or("Not authenticated with Google Drive. Please authenticate first.")?
    };

    let backup_data = serde_json::to_string_pretty(&websites)
        .map_err(|e| format!("Failed to serialize backup: {}", e))?;

    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("website_backup_{}.json", timestamp);

    // Upload to Google Drive
    let upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

    let metadata = serde_json::json!({
        "name": filename,
        "mimeType": "application/json",
        "parents": ["root"] // Upload to root folder, you can specify folder ID
    });

    let client = reqwest::Client::new();

    // Create multipart form
    let form = reqwest::multipart::Form::new()
        .part(
            "metadata",
            reqwest::multipart::Part::text(metadata.to_string())
                .mime_str("application/json")
                .map_err(|e| format!("Failed to create metadata part: {}", e))?,
        )
        .part(
            "file",
            reqwest::multipart::Part::text(backup_data)
                .mime_str("application/json")
                .map_err(|e| format!("Failed to create file part: {}", e))?
                .file_name(filename.clone()),
        );

    let response = client
        .post(upload_url)
        .header("Authorization", format!("Bearer {}", tokens.access_token))
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Failed to upload to Google Drive: {}", e))?;

    if response.status().is_success() {
        let drive_response: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Drive response: {}", e))?;

        let file_id = drive_response["id"]
            .as_str()
            .ok_or("No file ID in response")?;

        let drive_url = format!("https://drive.google.com/file/d/{}/view", file_id);

        Ok(CloudBackupResult {
            success: true,
            message: format!("Backup uploaded to Google Drive as: {}", filename),
            backup_path: None,
            drive_url: Some(drive_url),
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    } else {
        let error_text = response.text().await.unwrap_or_default();
        Err(format!("Google Drive upload failed: {}", error_text))
    }
}

#[command]
pub async fn is_google_drive_authenticated() -> Result<bool, String> {
    let google_tokens = GOOGLE_TOKENS.lock().unwrap();
    Ok(google_tokens.is_some())
}

#[command]
pub async fn disconnect_google_drive() -> Result<(), String> {
    {
        let mut google_tokens = GOOGLE_TOKENS.lock().unwrap();
        *google_tokens = None;
    }
    {
        let mut oauth_state = OAUTH_STATE.lock().unwrap();
        *oauth_state = None;
    }
    Ok(())
}

// Local backup functions (fallback)
#[command]
pub async fn backup_local(websites: Vec<Website>) -> Result<CloudBackupResult, String> {
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("website_backup_{}.json", timestamp);

    let backup_dir = "backups";
    fs::create_dir_all(backup_dir)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;

    let backup_path = format!("{}/{}", backup_dir, filename);

    let backup_data = serde_json::to_string_pretty(&websites)
        .map_err(|e| format!("Failed to serialize backup: {}", e))?;

    fs::write(&backup_path, backup_data).map_err(|e| format!("Failed to write backup: {}", e))?;

    Ok(CloudBackupResult {
        success: true,
        message: format!("Backup saved locally at: {}", backup_path),
        backup_path: Some(backup_path),
        drive_url: None,
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

#[command]
pub async fn open_backup_folder() -> Result<(), String> {
    let backup_dir = "backups";

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(backup_dir)
            .spawn()
            .map_err(|e| format!("Failed to open backup folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(backup_dir)
            .spawn()
            .map_err(|e| format!("Failed to open backup folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(backup_dir)
            .spawn()
            .map_err(|e| format!("Failed to open backup folder: {}", e))?;
    }

    Ok(())
}
