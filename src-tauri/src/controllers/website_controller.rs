// controllers/website_controller.rs
use tauri::State;
use crate::services::storage_service::StorageService;
use crate::models::website::Website;

#[tauri::command]
pub async fn get_websites(storage: State<'_, StorageService>) -> Result<Vec<Website>, String> {
    storage.get_websites()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_websites(websites: Vec<Website>, storage: State<'_, StorageService>) -> Result<(), String> {
    // Ensure all websites have proper defaults for missing fields
    let websites: Vec<Website> = websites.into_iter().map(|mut website| {
        if website.vitals.is_none() {
            website.vitals = Some(Default::default());
        }
        website
    }).collect();
    
    storage.save_websites(&websites)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_websites(storage: State<'_, StorageService>) -> Result<String, String> {
    storage.export_websites()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_website_status(url: String) -> Result<u16, String> {
    // For now, let's use a simple implementation without reqwest
    println!("Checking website status for: {}", url);
    Ok(200) // Placeholder
}

#[tauri::command]
pub async fn get_web_vitals(_url: String) -> Result<serde_json::Value, String> {
    // Placeholder implementation
    Ok(serde_json::json!({
        "lcp": 0,
        "fid": 0,
        "cls": 0,
        "fcp": 0,
        "ttfb": 0
    }))
}

#[tauri::command]
pub async fn save_to_cloud(website: Website, provider: String) -> Result<(), String> {
    println!("Saving to {}: {:?}", provider, website);
    Ok(())
}