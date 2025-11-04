// src-tauri/src/controllers/search_controller.rs
use crate::models::website::Website;
use crate::services::storage_service::StorageService;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchFilters {
    pub query: String,
    pub status: String, // "all", "online", "offline", "unknown"
    pub project_status: String,
    pub industry: String,
    pub favorite: Option<bool>,
    pub is_wordpress: Option<bool>,
    pub limit: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub websites: Vec<Website>,
    pub total_matches: usize,
    pub has_more: bool,
}

// In src-tauri/src/controllers/search_controller.rs, update the search_websites function:
#[tauri::command]
pub async fn search_websites(
    filters: SearchFilters,
    storage: State<'_, StorageService>,
) -> Result<SearchResult, String> {
    println!("🎯 Received search request: {:?}", filters);

    let websites = storage.get_websites().map_err(|e| e.to_string())?;
    println!("📊 Total websites in storage: {}", websites.len());

    let results = perform_search(websites, filters);
    println!(
        "🔍 Search completed: {} results found",
        results.websites.len()
    );

    Ok(results)
}

#[tauri::command]
pub async fn quick_search(
    query: String,
    storage: State<'_, StorageService>,
) -> Result<Vec<Website>, String> {
    let websites = storage.get_websites().map_err(|e| e.to_string())?;

    let filters = SearchFilters {
        query,
        status: "all".to_string(),
        project_status: "all".to_string(),
        industry: "all".to_string(),
        favorite: None,
        is_wordpress: None,
        limit: Some(5),
    };

    let results = perform_search(websites, filters);
    Ok(results.websites)
}

#[tauri::command]
pub async fn get_search_suggestions(
    query: String,
    storage: State<'_, StorageService>,
) -> Result<Vec<String>, String> {
    let websites = storage.get_websites().map_err(|e| e.to_string())?;

    let mut suggestions = Vec::new();
    let query_lower = query.to_lowercase();

    // Add website names
    for website in &websites {
        if website.name.to_lowercase().contains(&query_lower) {
            suggestions.push(website.name.clone());
        }
        if website.url.to_lowercase().contains(&query_lower) {
            suggestions.push(website.url.clone());
        }
    }

    // Add industries
    let industries: Vec<String> = websites
        .iter()
        .map(|w| w.industry.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    for industry in industries {
        if industry.to_lowercase().contains(&query_lower) {
            suggestions.push(industry);
        }
    }

    // Deduplicate and limit
    suggestions.sort();
    suggestions.dedup();
    suggestions.truncate(10);

    Ok(suggestions)
}

#[tauri::command]
pub async fn get_search_stats(storage: State<'_, StorageService>) -> Result<SearchStats, String> {
    let websites = storage.get_websites().map_err(|e| e.to_string())?;

    let total_websites = websites.len();
    let online_count = websites.iter().filter(|w| w.status == Some(200)).count();
    let offline_count = websites
        .iter()
        .filter(|w| w.status != Some(200) && w.status.is_some())
        .count();
    let unknown_count = websites.iter().filter(|w| w.status.is_none()).count();
    let wordpress_count = websites
        .iter()
        .filter(|w| w.is_wordpress.unwrap_or(false))
        .count();
    let favorite_count = websites.iter().filter(|w| w.favorite).count();

    // Get unique industries and project statuses
    let industries: Vec<String> = websites
        .iter()
        .map(|w| w.industry.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    let project_statuses: Vec<String> = websites
        .iter()
        .filter_map(|w| w.project_status.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    Ok(SearchStats {
        total_websites,
        online_count,
        offline_count,
        unknown_count,
        wordpress_count,
        favorite_count,
        industries,
        project_statuses,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchStats {
    pub total_websites: usize,
    pub online_count: usize,
    pub offline_count: usize,
    pub unknown_count: usize,
    pub wordpress_count: usize,
    pub favorite_count: usize,
    pub industries: Vec<String>,
    pub project_statuses: Vec<String>,
}

fn perform_search(websites: Vec<Website>, filters: SearchFilters) -> SearchResult {
    let mut results: Vec<Website> = websites
        .into_iter()
        .filter(|website| {
            // Apply text search
            if !filters.query.is_empty() {
                let query = filters.query.to_lowercase();
                let matches = website.name.to_lowercase().contains(&query)
                    || website.url.to_lowercase().contains(&query)
                    || website.industry.to_lowercase().contains(&query)
                    || website
                        .description
                        .as_ref()
                        .map_or(false, |desc| desc.to_lowercase().contains(&query))
                    || website.tags.as_ref().map_or(false, |tags| {
                        tags.iter().any(|tag| tag.to_lowercase().contains(&query))
                    })
                    || website
                        .project_status
                        .as_ref()
                        .map_or(false, |status| status.to_lowercase().contains(&query));

                if !matches {
                    return false;
                }
            }

            // Apply status filter
            match filters.status.as_str() {
                "online" => {
                    if website.status != Some(200) {
                        return false;
                    }
                }
                "offline" => {
                    if website.status == Some(200) || website.status.is_none() {
                        return false;
                    }
                }
                "unknown" => {
                    if website.status.is_some() {
                        return false;
                    }
                }
                _ => {}
            }

            // Apply project status filter
            if filters.project_status != "all" {
                if website.project_status.as_ref() != Some(&filters.project_status) {
                    return false;
                }
            }

            // Apply industry filter
            if filters.industry != "all" {
                if website.industry != filters.industry {
                    return false;
                }
            }

            // Apply favorite filter
            if let Some(favorite) = filters.favorite {
                if website.favorite != favorite {
                    return false;
                }
            }

            // Apply WordPress filter
            if let Some(is_wordpress) = filters.is_wordpress {
                if website.is_wordpress != Some(is_wordpress) {
                    return false;
                }
            }

            true
        })
        .collect();

    // Sort by relevance (favorites first, then by name)
    results.sort_by(|a, b| {
        if a.favorite != b.favorite {
            b.favorite.cmp(&a.favorite) // true comes first
        } else {
            a.name.cmp(&b.name)
        }
    });

    let total_matches = results.len();
    let limit = filters.limit.unwrap_or(usize::MAX);
    let has_more = total_matches > limit;

    if results.len() > limit {
        results.truncate(limit);
    }

    SearchResult {
        websites: results,
        total_matches,
        has_more,
    }
}
