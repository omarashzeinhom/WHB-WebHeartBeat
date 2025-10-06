use serde::{Deserialize, Serialize};
use tauri::command;
use std::collections::HashMap;
use std::fs;
use std::io::Write;
use crate::models::website::Website;

#[derive(Debug, Serialize, Deserialize)]
pub struct CloudBackupResult {
    pub success: bool,
    pub message: String,
    pub backup_path: Option<String>,
    pub timestamp: String,
}

#[command]
pub async fn backup_to_google_drive(websites: Vec<Website>) -> Result<CloudBackupResult, String> {
    // For a real implementation, you would use Google Drive API
    // But for now, we'll save locally and user can manually upload
    
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("website_backup_{}.json", timestamp);
    
    // Save to local backups folder
    let backup_dir = "backups";
    if let Err(e) = fs::create_dir_all(backup_dir) {
        return Err(format!("Failed to create backup directory: {}", e));
    }
    
    let backup_path = format!("{}/{}", backup_dir, filename);
    
    let backup_data = serde_json::to_string_pretty(&websites)
        .map_err(|e| format!("Failed to serialize backup: {}", e))?;
    
    let mut file = fs::File::create(&backup_path)
        .map_err(|e| format!("Failed to create backup file: {}", e))?;
    
    file.write_all(backup_data.as_bytes())
        .map_err(|e| format!("Failed to write backup: {}", e))?;
    
    println!("Backup created: {}", backup_path);
    
    Ok(CloudBackupResult {
        success: true,
        message: format!("Backup saved locally at: {}", backup_path),
        backup_path: Some(backup_path),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

#[command]
pub async fn backup_to_dropbox(websites: Vec<Website>) -> Result<CloudBackupResult, String> {
    // Similar local implementation for Dropbox
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("website_backup_{}.json", timestamp);
    
    let backup_dir = "backups";
    if let Err(e) = fs::create_dir_all(backup_dir) {
        return Err(format!("Failed to create backup directory: {}", e));
    }
    
    let backup_path = format!("{}/{}", backup_dir, filename);
    
    let backup_data = serde_json::to_string_pretty(&websites)
        .map_err(|e| format!("Failed to serialize backup: {}", e))?;
    
    let mut file = fs::File::create(&backup_path)
        .map_err(|e| format!("Failed to create backup file: {}", e))?;
    
    file.write_all(backup_data.as_bytes())
        .map_err(|e| format!("Failed to write backup: {}", e))?;
    
    println!("Dropbox-style backup created: {}", backup_path);
    
    Ok(CloudBackupResult {
        success: true,
        message: format!("Backup saved locally. You can manually upload to Dropbox from: {}", backup_path),
        backup_path: Some(backup_path),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

#[command]
pub async fn list_cloud_backups() -> Result<Vec<HashMap<String, String>>, String> {
    let backup_dir = "backups";
    let mut backups = Vec::new();
    
    if let Ok(entries) = fs::read_dir(backup_dir) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    let path = entry.path();
                    if let Some(extension) = path.extension() {
                        if extension == "json" {
                            let mut backup_info = HashMap::new();
                            backup_info.insert(
                                "filename".to_string(),
                                path.file_name().unwrap().to_string_lossy().to_string()
                            );
                            backup_info.insert(
                                "path".to_string(), 
                                path.to_string_lossy().to_string()
                            );
                            backup_info.insert(
                                "size".to_string(),
                                format!("{} bytes", metadata.len())
                            );
                            backup_info.insert(
                                "modified".to_string(),
                                format!("{:?}", metadata.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH))
                            );
                            backups.push(backup_info);
                        }
                    }
                }
            }
        }
    }
    
    // Sort by filename (which includes timestamp)
    backups.sort_by(|a, b| {
        b["filename"].cmp(&a["filename"])
    });
    
    Ok(backups)
}

#[command]
pub async fn restore_from_cloud(backup_path: String) -> Result<Vec<Website>, String> {
    let data = fs::read_to_string(&backup_path)
        .map_err(|e| format!("Failed to read backup file: {}", e))?;
    
    let websites: Vec<Website> = serde_json::from_str(&data)
        .map_err(|e| format!("Failed to parse backup: {}", e))?;
    
    println!("Restored {} websites from backup: {}", websites.len(), backup_path);
    
    Ok(websites)
}

#[command]
pub async fn open_backup_folder() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg("backups")
            .spawn()
            .map_err(|e| format!("Failed to open backup folder: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("backups")
            .spawn()
            .map_err(|e| format!("Failed to open backup folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg("backups")
            .spawn()
            .map_err(|e| format!("Failed to open backup folder: {}", e))?;
    }
    
    Ok(())
}