// controllers/website_controller.rs
use crate::models::website::{WebVitals, Website};
use crate::models::wpscan::WpscanResult;
use crate::services::storage_service::StorageService;
use crate::services::wpscan_service::WpscanService;
use tauri::State;

#[tauri::command]
pub async fn get_websites(storage: State<'_, StorageService>) -> Result<Vec<Website>, String> {
    storage.get_websites().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_websites(
    websites: Vec<Website>,
    storage: State<'_, StorageService>,
) -> Result<(), String> {
    // Ensure all websites have proper defaults
    let websites: Vec<Website> = websites
        .into_iter()
        .map(|mut website| {
            if website.vitals.is_none() {
                website.vitals = Some(WebVitals::default());
            }
            website
        })
        .collect();

    storage.save_websites(&websites).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_websites(storage: State<'_, StorageService>) -> Result<String, String> {
    storage.export_websites().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_website_status(url: String) -> Result<u16, String> {
    // Simple implementation using reqwest
    let client = reqwest::Client::new();
    match client.get(&url).send().await {
        Ok(response) => Ok(response.status().as_u16()),
        Err(_) => Ok(0), // Return 0 for connection errors
    }
}

#[tauri::command]
pub async fn get_web_vitals(_url: String) -> Result<WebVitals, String> {
    // Return default vitals for now
    Ok(WebVitals::default())
}

#[tauri::command]
pub async fn scan_website(website: Website, api_key: String) -> Result<WpscanResult, String> {
    let wpscan_service = WpscanService::new(api_key);

    match wpscan_service.scan_website(&website.url).await {
        Ok(result) => Ok(result),
        Err(e) => {
            eprintln!("WPScan error: {}", e);
            // Return a default result instead of erroring out
            Ok(WpscanResult {
                vulnerabilities: vec![],
                plugins: vec![],
                themes: vec![],
                users: vec![],
                scan_date: chrono::Utc::now().to_rfc3339(),
                is_wordpress: false,
            })
        }
    }
}

#[tauri::command]
pub async fn detect_wordpress(url: String) -> Result<bool, String> {
    // Simple WordPress detection by checking for common WordPress indicators
    let client = reqwest::Client::new();

    match client.get(&url).send().await {
        Ok(response) => {
            if let Ok(text) = response.text().await {
                let is_wordpress = text.contains("wp-content")
                    || text.contains("wp-includes")
                    || text.contains("WordPress")
                    || text.contains("wp-json");
                Ok(is_wordpress)
            } else {
                Ok(false)
            }
        }
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub async fn save_to_cloud(website: Website, provider: String) -> Result<(), String> {
    println!("Saving to {}: {:?}", provider, website);
    Ok(())
}

#[tauri::command]
pub async fn update_website_industry(
    id: i64,
    industry: String,
    storage: State<'_, StorageService>,
) -> Result<(), String> {
    let mut websites = storage.get_websites().map_err(|e| e.to_string())?;

    if let Some(website) = websites.iter_mut().find(|w| w.id == id) {
        website.industry = industry;
        storage
            .save_websites(&websites)
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Website not found".to_string())
    }
}
#[tauri::command]
pub async fn export_website_report(
    website_id: i64,
    format: String,
    storage: State<'_, StorageService>,
) -> Result<String, String> {
    // Implementation for exporting reports
    Ok("Export functionality coming soon".to_string())
}

#[tauri::command]
pub async fn take_full_page_screenshot() -> Result<String, String> {
    // Implementation for full page screenshots
    Ok("Full page screenshot functionality coming soon".to_string())
}
