// system_controller.rs
use tauri::command;

#[command]
pub fn open_containing_folder(path: String) -> Result<(), String> {
    let path_obj = std::path::Path::new(&path);
    let parent = path_obj.parent()
        .ok_or("Invalid path: no parent directory")?;
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(parent)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(parent)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(parent)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[command]
pub fn open_downloads_folder() -> Result<(), String> {
    if let Some(downloads) = dirs::download_dir() {
        let downloads_path = downloads.to_string_lossy().to_string();
        
        #[cfg(target_os = "windows")]
        {
            std::process::Command::new("explorer")
                .arg(&downloads_path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        
        #[cfg(target_os = "macos")]
        {
            std::process::Command::new("open")
                .arg(&downloads_path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        
        #[cfg(target_os = "linux")]
        {
            std::process::Command::new("xdg-open")
                .arg(&downloads_path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        
        Ok(())
    } else {
        Err("Could not find downloads directory".to_string())
    }
}

#[command]
pub fn get_downloads_path() -> Result<String, String> {
    if let Some(downloads) = dirs::download_dir() {
        Ok(downloads.to_string_lossy().to_string())
    } else {
        Err("Could not find downloads directory".to_string())
    }
}