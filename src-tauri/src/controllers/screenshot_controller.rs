// controllers/screenshot_controller.rs
use base64::encode;
use headless_chrome::{Browser, protocol::page::ScreenshotFormat};
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::{Emitter, State, Window, command};

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

#[command]
pub async fn take_screenshot(url: String) -> Result<String, String> {
    if CANCEL_FLAG.load(Ordering::SeqCst) {
        return Err("Screenshot cancelled".to_string());
    }

    let browser = Browser::default().map_err(|e| format!("Failed to launch browser: {}", e))?;

    let tab = browser
        .new_tab()
        .map_err(|e| format!("Failed to create new tab: {}", e))?;

    // Set a navigation timeout
    tab.set_default_timeout(Duration::from_secs(30));

    tab.navigate_to(&url)
        .map_err(|e| format!("Failed to navigate to URL: {}", e))?;

    tab.wait_until_navigated()
        .map_err(|e| format!("Failed to wait for navigation: {}", e))?;

    // Wait for the page to be more stable
    tokio::time::sleep(Duration::from_secs(3)).await;

    let screenshot_data = tab
        .capture_screenshot(ScreenshotFormat::PNG, None, true)
        .map_err(|e| format!("Failed to capture screenshot: {}", e))?;

    let base64_screenshot = encode(&screenshot_data);
    let data_url = format!("data:image/png;base64,{}", base64_screenshot);

    Ok(data_url)
}

#[command]
pub async fn take_bulk_screenshots(
    window: Window,
    storage: State<'_, crate::services::storage_service::StorageService>,
) -> Result<(), String> {
    CANCEL_FLAG.store(false, Ordering::SeqCst);

    let websites = storage.get_websites().map_err(|e| e.to_string())?;
    let total_websites = websites.len();

    if total_websites == 0 {
        return Ok(());
    }

    let mut progress = ScreenshotProgress {
        total: total_websites,
        completed: 0,
        current_website: String::new(),
        current_id: 0,
        is_complete: false,
        errors: Vec::new(),
    };

    // Create browser instance once for better performance
    let browser = Browser::default().map_err(|e| format!("Failed to launch browser: {}", e))?;

    for (index, website) in websites.iter().enumerate() {
        if CANCEL_FLAG.load(Ordering::SeqCst) {
            break;
        }

        progress.current_website = website.name.clone();
        progress.current_id = website.id;
        progress.completed = index;

        window
            .emit("screenshot-progress", &progress)
            .map_err(|e| format!("Failed to emit progress: {}", e))?;

        match take_screenshot_internal(&browser, &website.url).await {
            Ok(screenshot_data) => {
                let mut updated_website = website.clone();
                updated_website.screenshot = Some(screenshot_data);
                updated_website.last_checked = Some(chrono::Utc::now().to_rfc3339());

                if let Err(e) = storage.update_website(&updated_website) {
                    progress.errors.push(format!(
                        "Failed to save screenshot for {}: {}",
                        website.name, e
                    ));
                }
            }
            Err(e) => {
                progress
                    .errors
                    .push(format!("Failed to screenshot {}: {}", website.name, e));
            }
        }

        tokio::time::sleep(Duration::from_millis(1000)).await;
    }

    progress.completed = total_websites;
    progress.is_complete = true;
    progress.current_website = String::new();

    window
        .emit("screenshot-progress", &progress)
        .map_err(|e| format!("Failed to emit completion: {}", e))?;

    Ok(())
}

async fn take_screenshot_internal(browser: &Browser, url: &str) -> Result<String, String> {
    let tab = browser
        .new_tab()
        .map_err(|e| format!("Failed to create new tab: {}", e))?;

    tab.set_default_timeout(Duration::from_secs(30));

    tab.navigate_to(url)
        .map_err(|e| format!("Failed to navigate to URL: {}", e))?;

    tab.wait_until_navigated()
        .map_err(|e| format!("Failed to wait for navigation: {}", e))?;

    tokio::time::sleep(Duration::from_secs(3)).await;

    let screenshot_data = tab
        .capture_screenshot(ScreenshotFormat::PNG, None, true)
        .map_err(|e| format!("Failed to capture screenshot: {}", e))?;

    let base64_screenshot = encode(&screenshot_data);
    let data_url = format!("data:image/png;base64,{}", base64_screenshot);

    Ok(data_url)
}

#[command]
pub async fn cancel_bulk_screenshots() -> Result<(), String> {
    CANCEL_FLAG.store(true, Ordering::SeqCst);
    Ok(())
}
