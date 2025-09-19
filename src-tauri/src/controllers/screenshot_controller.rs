// controllers/screenshot_controller.rs
use headless_chrome::{Browser, protocol::page::ScreenshotFormat};
use base64::encode;
use tauri::{State, Window, Emitter}; // Added Emitter import
use serde::{Deserialize, Serialize};
use crate::services::storage_service::StorageService;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

// Use atomic boolean for thread-safe cancellation
static CANCEL_FLAG: AtomicBool = AtomicBool::new(false);

#[derive(Clone, Serialize, Deserialize)]
pub struct ScreenshotProgress {
    pub total: usize,
    pub completed: usize,
    pub current_website: String,
    pub current_id: i64,
    pub is_complete: bool,
    pub errors: Vec<String>,
}

#[tauri::command]
pub async fn take_screenshot(url: String) -> Result<String, String> {
    // Launch a headless Chrome browser with appropriate settings
    let browser = Browser::default()
        .map_err(|e| format!("Failed to launch browser: {}", e))?;
    
    // Create a new tab and navigate to the URL
    let tab = browser.new_tab()
        .map_err(|e| format!("Failed to create new tab: {}", e))?;
    
    // Navigate to the URL and wait for page to load
    tab.navigate_to(&url)
        .map_err(|e| format!("Failed to navigate to URL: {}", e))?;
    
    // Wait for the page to load completely
    tab.wait_until_navigated()
        .map_err(|e| format!("Failed to wait for navigation: {}", e))?;
    
    // Wait for additional content to load
    tab.wait_for_element("body")
        .map_err(|e| format!("Failed to find body element: {}", e))?;
    
    // Add a small delay to ensure all content is rendered
    tokio::time::sleep(Duration::from_secs(2)).await;
    
    // Take a screenshot - CORRECTED: Fixed parameter order
    let screenshot_data = tab.capture_screenshot(
        ScreenshotFormat::PNG,
        None, // No quality parameter for PNG
        true  // from_surface parameter
    ).map_err(|e| format!("Failed to capture screenshot: {}", e))?;
    
    // Convert to base64
    let base64_screenshot = encode(&screenshot_data);
    let data_url = format!("data:image/png;base64,{}", base64_screenshot);
    
    Ok(data_url)
}

#[tauri::command]
pub async fn take_bulk_screenshots(
    window: Window,
    storage: State<'_, StorageService>,
) -> Result<(), String> {
    // Reset cancel flag
    CANCEL_FLAG.store(false, Ordering::SeqCst);

    // Get all websites from storage
    let websites = storage.get_websites().map_err(|e| e.to_string())?;
    let total_websites = websites.len();

    if total_websites == 0 {
        return Ok(());
    }

    // Initialize progress
    let mut progress = ScreenshotProgress {
        total: total_websites,
        completed: 0,
        current_website: String::new(),
        current_id: 0,
        is_complete: false,
        errors: Vec::new(),
    };

    // Create a single browser instance for better performance
    let browser = Browser::default()
        .map_err(|e| format!("Failed to launch browser: {}", e))?;

    // Process each website
    for (index, website) in websites.iter().enumerate() {
        // Check for cancellation
        if CANCEL_FLAG.load(Ordering::SeqCst) {
            break;
        }

        // Update progress with current website
        progress.current_website = website.name.clone();
        progress.current_id = website.id;
        progress.completed = index;
        
        // Emit progress update to frontend
        if let Err(e) = window.emit("screenshot-progress", &progress) {
            eprintln!("Failed to emit progress: {}", e);
        }

        // Take screenshot for this website
        match take_screenshot_internal(&browser, &website.url).await {
            Ok(screenshot_data) => {
                // Update the website with new screenshot
                let mut updated_website = website.clone();
                updated_website.screenshot = Some(screenshot_data);
                updated_website.last_checked = Some(chrono::Utc::now().to_rfc3339());
                
                // Save the updated website
                if let Err(e) = storage.update_website(&updated_website) {
                    let error_msg = format!("Failed to save screenshot for {}: {}", website.name, e);
                    progress.errors.push(error_msg);
                }
            }
            Err(e) => {
                let error_msg = format!("Failed to screenshot {}: {}", website.name, e);
                progress.errors.push(error_msg);
                eprintln!("Screenshot error for {}: {}", website.name, e);
            }
        }

        // Small delay to prevent overwhelming the system
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    }

    // Final progress update
    progress.completed = total_websites;
    progress.is_complete = true;
    progress.current_website = String::new();

    // Emit completion
    if let Err(e) = window.emit("screenshot-progress", &progress) {
        eprintln!("Failed to emit completion: {}", e);
    }

    Ok(())
}

async fn take_screenshot_internal(browser: &Browser, url: &str) -> Result<String, String> {
    // Create a new tab for each screenshot to avoid conflicts
    let tab = browser.new_tab()
        .map_err(|e| format!("Failed to create new tab: {}", e))?;
    
    // Navigate to the URL
    tab.navigate_to(url)
        .map_err(|e| format!("Failed to navigate to URL: {}", e))?;
    
    // Wait for the page to load
    tab.wait_until_navigated()
        .map_err(|e| format!("Failed to wait for navigation: {}", e))?;
    
    // Wait for body element to ensure page is rendered
    tab.wait_for_element("body")
        .map_err(|e| format!("Failed to find body element: {}", e))?;
    
    // Wait a bit for dynamic content
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    
    // Take screenshot with CORRECTED API
    let screenshot_data = tab.capture_screenshot(
        ScreenshotFormat::PNG,
        None, // No quality parameter for PNG
        false, // No clip region (full page)
    ).map_err(|e| format!("Failed to capture screenshot: {}", e))?;
    
    // Convert to base64
    let base64_screenshot = encode(&screenshot_data);
    let data_url = format!("data:image/png;base64,{}", base64_screenshot);
    
    Ok(data_url)
}

#[tauri::command] 
pub async fn cancel_bulk_screenshots() -> Result<(), String> {
    // Set cancel flag
    CANCEL_FLAG.store(true, Ordering::SeqCst);
    Ok(())
}