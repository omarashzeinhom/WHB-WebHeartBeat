// controllers/website_controller.rs
use crate::models::website::{WebVitals, Website};
use crate::models::wpscan::WpscanResult;
use crate::services::storage_service::StorageService;
use crate::services::wpscan_service::WpscanService;
use serde::{Deserialize, Serialize};
use tauri::State;

// Define the validation result struct
#[derive(Serialize, Deserialize)]
pub struct ImportValidationResult {
    pub valid: bool,
    pub website_count: usize,
    pub has_duplicates: bool,
    pub missing_urls: usize,
    pub error_message: Option<String>,
}

// Helper function to check for duplicate URLs
fn has_duplicate_urls(websites: &[Website]) -> bool {
    let mut seen = std::collections::HashSet::new();
    for website in websites {
        if !seen.insert(website.url.clone()) {
            return true;
        }
    }
    false
}

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
            // Ensure notes has a default if None
            if website.notes.is_none() {
                website.notes = Some(crate::models::website::WebsiteNotes::default());
            }
            website
        })
        .collect();

    storage.save_websites(&websites).map_err(|e| e.to_string())
}


#[derive(Serialize, Deserialize)]
pub struct ExportOptions {
    pub format: String, // "json", "csv", "full-backup"
    pub include_notes: bool,
    pub include_custom_statuses: bool,
}

#[derive(Serialize, Deserialize)]
pub struct FullBackupExport {
    pub websites: Vec<Website>,
    pub custom_statuses: Vec<CustomStatus>,
    pub export_date: String,
    pub version: String,
}

#[derive(Serialize, Deserialize)]
pub struct CustomStatus {
    pub value: String,
    pub label: String,
    pub color: String,
}

#[tauri::command]
pub async fn export_websites(
    storage: State<'_, StorageService>,
    options: ExportOptions,
) -> Result<String, String> {
    match storage.get_websites() {
        Ok(websites) => {
            // Ensure all websites have proper structure before export
            let websites: Vec<Website> = websites
                .into_iter()
                .map(|mut website| {
                    if website.vitals.is_none() {
                        website.vitals = Some(WebVitals::default());
                    }
                    if website.notes.is_none() {
                        website.notes = Some(crate::models::website::WebsiteNotes::default());
                    }
                    website
                })
                .collect();

            match options.format.as_str() {
                "full-backup" => {
                    // Create full backup structure
                    let backup = FullBackupExport {
                        websites,
                        custom_statuses: vec![], // You'll need to get these from your storage
                        export_date: chrono::Utc::now().to_rfc3339(),
                        version: "1.0".to_string(),
                    };
                    serde_json::to_string_pretty(&backup)
                        .map_err(|e| format!("Failed to serialize backup: {}", e))
                }
                "json" => serde_json::to_string_pretty(&websites)
                    .map_err(|e| format!("Failed to serialize websites: {}", e)),
                _ => Err("Unsupported export format".to_string()),
            }
        }
        Err(e) => Err(format!("Failed to get websites: {}", e)),
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
    let wpscan_service = WpscanService::new(api_key);

    match wpscan_service.scan_website(&website.url).await {
        Ok(mut result) => {
            result.url = website.url.clone();
            if result.wordpress_version.is_none() {
                result.wordpress_version = Some("Unknown".to_string());
            }
            println!("WPScan completed successfully for {}", website.url);
            Ok(result)
        }
        Err(e) => {
            eprintln!("WPScan error for {}: {}", website.url, e);
            Ok(WpscanResult {
                url: website.url,
                wordpress_version: Some("Unknown".to_string()),
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
        website.industry = industry.clone();
        storage
            .save_websites(&websites)
            .map_err(|e| e.to_string())?;
        println!("Updated industry for website {} to {}", id, industry);
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
        // Actually update the project_status field
        website.project_status = Some(project_status.clone());

        // Save the updated websites
        storage
            .save_websites(&websites)
            .map_err(|e| e.to_string())?;

        println!(
            "Successfully updated project status for website {} to: {}",
            id, project_status
        );
        Ok(())
    } else {
        Err(format!("Website with id {} not found", id))
    }
}
#[tauri::command]
pub async fn import_websites(
    json_data: String,
    storage: State<'_, StorageService>,
    merge: bool,
) -> Result<ImportResult, String> {
    println!("Importing websites, merge mode: {}", merge);

    // Try to parse as full backup first
    let backup_parsed: Result<FullBackupExport, _> = serde_json::from_str(&json_data);

    if let Ok(backup) = backup_parsed {
        println!(
            "Detected full backup file with {} websites",
            backup.websites.len()
        );
        return import_full_backup(backup, storage, merge).await;
    }

    // Fall back to websites-only import
    let imported_websites: Vec<Website> = match serde_json::from_str(&json_data) {
        Ok(websites) => websites,
        Err(e) => return Err(format!("Failed to parse JSON: {}", e)),
    };

    import_websites_only(imported_websites, storage, merge).await
}

async fn import_full_backup(
    backup: FullBackupExport,
    storage: State<'_, StorageService>,
    merge: bool,
) -> Result<ImportResult, String> {
    let imported_websites = import_websites_only(backup.websites, storage, merge).await?;

    Ok(ImportResult {
        websites: imported_websites.websites,
        custom_statuses: backup.custom_statuses,
        imported_count: imported_websites.imported_count,
        skipped_count: imported_websites.skipped_count,
    })
}

async fn import_websites_only(
    imported_websites: Vec<Website>,
    storage: State<'_, StorageService>,
    merge: bool,
) -> Result<ImportResult, String> {
    // Validate the imported websites
    if imported_websites.is_empty() {
        return Err("No websites found in import file".to_string());
    }

    // Ensure all websites have proper defaults
    let imported_websites: Vec<Website> = imported_websites
        .into_iter()
        .map(|mut website| {
            if website.vitals.is_none() {
                website.vitals = Some(WebVitals::default());
            }

            if website.project_status.is_none() {
                website.project_status = Some("wip".to_string());
            }

            if website.notes.is_none() {
                website.notes = Some(crate::models::website::WebsiteNotes::default());
            }

            if website.industry.is_empty() {
                website.industry = "general".to_string();
            }

            website
        })
        .collect();

    let mut imported_count = 0;
    let mut skipped_count = 0;

    if merge {
        println!("Merging with existing websites...");
        let mut existing_websites = storage.get_websites().map_err(|e| e.to_string())?;
        let existing_urls: std::collections::HashSet<String> =
            existing_websites.iter().map(|w| w.url.clone()).collect();

        let max_id = existing_websites.iter().map(|w| w.id).max().unwrap_or(0);
        let mut next_id = max_id + 1;

        for mut website in imported_websites {
            if existing_urls.contains(&website.url) {
                println!("Skipping duplicate URL: {}", website.url);
                skipped_count += 1;
                continue;
            }

            website.id = next_id;
            next_id += 1;
            existing_websites.push(website);
            imported_count += 1;
        }

        storage
            .save_websites(&existing_websites)
            .map_err(|e| e.to_string())?;
        Ok(ImportResult {
            websites: existing_websites,
            custom_statuses: vec![],
            imported_count,
            skipped_count,
        })
    } else {
        println!("Replacing all websites with imported data...");
        let imported_websites: Vec<Website> = imported_websites
            .into_iter()
            .enumerate()
            .map(|(index, mut website)| {
                website.id = (index + 1) as i64;
                website
            })
            .collect();

        imported_count = imported_websites.len();
        storage
            .save_websites(&imported_websites)
            .map_err(|e| e.to_string())?;
        Ok(ImportResult {
            websites: imported_websites,
            custom_statuses: vec![],
            imported_count,
            skipped_count,
        })
    }
}

#[derive(Serialize, Deserialize)]
pub struct ImportResult {
    pub websites: Vec<Website>,
    pub custom_statuses: Vec<CustomStatus>,
    pub imported_count: usize,
    pub skipped_count: usize,
}

#[tauri::command]
pub async fn validate_import_data(json_data: String) -> Result<ImportValidationResult, String> {
    println!("Validating import data with notes structure...");

    let value: serde_json::Value = match serde_json::from_str(&json_data) {
        Ok(value) => value,
        Err(e) => {
            return Ok(ImportValidationResult {
                valid: false,
                website_count: 0,
                has_duplicates: false,
                missing_urls: 0,
                error_message: Some(format!("Invalid JSON format: {}", e)),
            });
        }
    };

    let array = match value.as_array() {
        Some(arr) => arr,
        None => {
            return Ok(ImportValidationResult {
                valid: false,
                website_count: 0,
                has_duplicates: false,
                missing_urls: 0,
                error_message: Some("JSON must be an array of websites".to_string()),
            });
        }
    };

    if array.is_empty() {
        return Ok(ImportValidationResult {
            valid: false,
            website_count: 0,
            has_duplicates: false,
            missing_urls: 0,
            error_message: Some("JSON array is empty".to_string()),
        });
    }

    // Try to parse as websites
    let websites: Result<Vec<Website>, _> = serde_json::from_str(&json_data);

    match websites {
        Ok(websites) => {
            let website_count = websites.len();
            let has_duplicates = has_duplicate_urls(&websites);
            let missing_urls = websites.iter().filter(|w| w.url.trim().is_empty()).count();

            // Validate notes structure if present
            let mut notes_validation_errors = Vec::new();

            for (index, website) in websites.iter().enumerate() {
                if let Some(notes) = &website.notes {
                    // Validate notes structure
                    if notes.last_updated.is_empty() {
                        notes_validation_errors.push(format!(
                            "Website {} has notes with empty last_updated",
                            index
                        ));
                    }

                    // Validate DNS records
                    for (dns_index, dns_record) in notes.dns_history.iter().enumerate() {
                        if dns_record.record_type.is_empty() || dns_record.value.is_empty() {
                            notes_validation_errors.push(format!(
                                "Website {} has invalid DNS record at index {}",
                                index, dns_index
                            ));
                        }
                    }

                    // Validate security vulnerabilities
                    for (vuln_index, vulnerability) in
                        notes.security.vulnerabilities.iter().enumerate()
                    {
                        if vulnerability.name.is_empty() || vulnerability.severity.is_empty() {
                            notes_validation_errors.push(format!(
                                "Website {} has invalid vulnerability at index {}",
                                index, vuln_index
                            ));
                        }
                    }
                }
            }

            let valid = notes_validation_errors.is_empty();
            let error_message = if !notes_validation_errors.is_empty() {
                Some(format!(
                    "Notes validation errors: {}",
                    notes_validation_errors.join(", ")
                ))
            } else {
                None
            };

            Ok(ImportValidationResult {
                valid,
                website_count,
                has_duplicates,
                missing_urls,
                error_message,
            })
        }
        Err(e) => Ok(ImportValidationResult {
            valid: false,
            website_count: 0,
            has_duplicates: false,
            missing_urls: 0,
            error_message: Some(format!("Failed to parse websites: {}", e)),
        }),
    }
}
