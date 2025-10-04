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
    match storage.get_websites() {
        Ok(websites) => {
            match serde_json::to_string_pretty(&websites) {
                Ok(json) => Ok(json),
                Err(e) => Err(format!("Failed to serialize websites: {}", e))
            }
        },
        Err(e) => Err(format!("Failed to get websites: {}", e))
    }
}

#[tauri::command]
pub async fn check_website_status(url: String) -> Result<u16, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    match client.get(&url).send().await {
        Ok(response) => Ok(response.status().as_u16()),
        Err(_) => Ok(0), // Return 0 for connection errors
    }
}

#[tauri::command]
pub async fn get_web_vitals(_url: String) -> Result<WebVitals, String> {
    // Return default vitals for now - you can implement actual web vitals collection later
    Ok(WebVitals::default())
}

#[tauri::command]
pub async fn scan_website(website: Website, api_key: String) -> Result<WpscanResult, String> {
    // Validate API key
    if api_key.trim().is_empty() {
        return Err("API key is required".to_string());
    }

    // Validate URL
    if website.url.trim().is_empty() {
        return Err("Website URL is required".to_string());
    }

    println!("Starting WPScan for: {} with API key: {}...", website.url, &api_key[..std::cmp::min(8, api_key.len())]);

    let wpscan_service = WpscanService::new(api_key);

    match wpscan_service.scan_website(&website.url).await {
        Ok(result) => {
            println!("WPScan completed successfully for {}", website.url);
            println!("Found {} vulnerabilities, {} plugins, {} themes", 
                result.vulnerabilities.len(), 
                result.plugins.len(), 
                result.themes.len()
            );
            Ok(result)
        },
        Err(e) => {
            eprintln!("WPScan error for {}: {}", website.url, e);
            
            // Check if it's an API key issue
            let error_msg = e.to_string();
            if error_msg.contains("401") || error_msg.contains("Unauthorized") {
                return Err("Invalid WPScan API key. Please check your API key and try again.".to_string());
            }
            
            if error_msg.contains("429") || error_msg.contains("rate limit") {
                return Err("WPScan API rate limit exceeded. Please wait and try again.".to_string());
            }
            
            if error_msg.contains("timeout") {
                return Err(format!("Request timeout while scanning {}. The website may be slow to respond.", website.url));
            }

            // For other errors, still return a basic result but log the error
            println!("Returning basic scan result due to error: {}", e);
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
    if url.trim().is_empty() {
        return Err("URL is required".to_string());
    }

    println!("Detecting WordPress for: {}", url);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    match client.get(&url).send().await {
        Ok(response) => {
            if let Ok(text) = response.text().await {
                let is_wordpress = text.contains("wp-content")
                    || text.contains("wp-includes")
                    || text.contains("WordPress")
                    || text.contains("wp-json")
                    || text.contains("/wp-admin/")
                    || text.contains("wp-embed.min.js");
                
                println!("WordPress detection for {}: {}", url, is_wordpress);
                Ok(is_wordpress)
            } else {
                println!("Failed to read response text for {}", url);
                Ok(false)
            }
        }
        Err(e) => {
            println!("Error detecting WordPress for {}: {}", url, e);
            Ok(false)
        }
    }
}

#[tauri::command]
pub async fn save_to_cloud(website: Website, provider: String) -> Result<(), String> {
    println!("Saving to {}: {:?}", provider, website);
    // TODO: Implement actual cloud saving logic
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
pub async fn update_website_project_status(
    id: i64,
    project_status: String,
    storage: State<'_, StorageService>,
) -> Result<(), String> {
    let mut websites = storage.get_websites().map_err(|e| e.to_string())?;

    if let Some(website) = websites.iter_mut().find(|w| w.id == id) {
        // Note: You'll need to add project_status field to your Website struct
        // For now, we'll just print it since the field might not exist yet
        println!("Updating project status for website {}: {}", id, project_status);
        
        // Uncomment this line once you add project_status to your Website struct:
        // website.project_status = project_status;
        
        storage
            .save_websites(&websites)
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Website not found".to_string())
    }
}
