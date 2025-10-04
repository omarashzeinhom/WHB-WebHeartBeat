// services/wpscan_service.rs
use reqwest::Client;
use serde::Deserialize;
use std::collections::HashMap;
use crate::models::wpscan::{WpscanResult, Plugin, Theme, User, Vulnerability};

pub struct WpscanService {
    client: Client,
    api_key: String,
}

impl WpscanService {
    pub fn new(api_key: String) -> Self {
        println!("[v0] Creating WpscanService with API key: {}...", &api_key[..std::cmp::min(8, api_key.len())]);
        Self {
            client: Client::new(),
            api_key,
        }
    }

    pub async fn scan_website(&self, url: &str) -> Result<WpscanResult, String> {
        println!("[v0] Starting WordPress scan for: {}", url);
        
        let mut result = WpscanResult {
            url: url.to_string(), // FIX: Changed from Option<String> to String
            wordpress_version: None,
            vulnerabilities: Vec::new(),
            plugins: Vec::new(),
            themes: Vec::new(),
            users: Vec::new(),
            scan_date: chrono::Utc::now().to_rfc3339(),
            is_wordpress: false,
        };

        // Step 1: Detect if it's WordPress
        println!("[v0] Step 1: Detecting if site is WordPress...");
        result.is_wordpress = self.detect_wordpress(url).await.unwrap_or(false);
        
        if !result.is_wordpress {
            println!("[v0] Site is not WordPress, skipping scan");
            return Ok(result);
        }
        
        println!("[v0] Confirmed WordPress site");

        // Step 2: Detect WordPress version
        println!("[v0] Step 2: Detecting WordPress version...");
        result.wordpress_version = self.detect_wordpress_version(url).await.ok();
        println!("[v0] WordPress version: {:?}", result.wordpress_version);

        // Step 3: Enumerate plugins
        println!("[v0] Step 3: Enumerating plugins...");
        result.plugins = self.enumerate_plugins(url).await.unwrap_or_default();
        println!("[v0] Found {} plugins", result.plugins.len());

        // Step 4: Enumerate themes
        println!("[v0] Step 4: Enumerating themes...");
        result.themes = self.enumerate_themes(url).await.unwrap_or_default();
        println!("[v0] Found {} themes", result.themes.len());

        // Step 5: Enumerate users
        println!("[v0] Step 5: Enumerating users...");
        result.users = self.enumerate_users(url).await.unwrap_or_default();
        println!("[v0] Found {} users", result.users.len());

        // Step 6: Check vulnerabilities for WordPress core
        if let Some(ref version) = result.wordpress_version {
            println!("[v0] Step 6: Checking WordPress core vulnerabilities for version {}...", version);
            let vulns = self.check_wordpress_vulnerabilities(version).await.unwrap_or_default();
            println!("[v0] Found {} core vulnerabilities", vulns.len());
            result.vulnerabilities.extend(vulns);
        }

        // Step 7: Check vulnerabilities for each plugin
        println!("[v0] Step 7: Checking plugin vulnerabilities...");
        for plugin in &mut result.plugins {
            println!("[v0] Checking vulnerabilities for plugin: {}", plugin.slug);
            plugin.vulnerabilities = self.check_plugin_vulnerabilities(&plugin.slug).await.unwrap_or_default();
            println!("[v0] Found {} vulnerabilities for {}", plugin.vulnerabilities.len(), plugin.slug);
        }

        // Step 8: Check vulnerabilities for each theme
        println!("[v0] Step 8: Checking theme vulnerabilities...");
        for theme in &mut result.themes {
            println!("[v0] Checking vulnerabilities for theme: {}", theme.slug);
            theme.vulnerabilities = self.check_theme_vulnerabilities(&theme.slug).await.unwrap_or_default();
            println!("[v0] Found {} vulnerabilities for {}", theme.vulnerabilities.len(), theme.slug);
        }

        println!("[v0] Scan complete!");
        Ok(result)
    }

    // ... rest of your existing methods remain the same ...
    async fn detect_wordpress(&self, url: &str) -> Result<bool, String> {
        let response = self.client.get(url)
            .timeout(std::time::Duration::from_secs(10))
            .send()
            .await
            .map_err(|e| e.to_string())?;
        
        let html = response.text().await.map_err(|e| e.to_string())?;
        
        Ok(html.contains("wp-content")
            || html.contains("wp-includes")
            || html.contains("WordPress")
            || html.contains("wp-json"))
    }

    async fn detect_wordpress_version(&self, url: &str) -> Result<String, String> {
        let response = self.client.get(url).send().await.map_err(|e| e.to_string())?;
        let html = response.text().await.map_err(|e| e.to_string())?;

        // Look for generator meta tag
        if let Some(start) = html.find(r#"<meta name="generator" content="WordPress "#) {
            if let Some(version_start) = html[start..].find("WordPress ") {
                let version_text = &html[start + version_start + 10..];
                if let Some(end) = version_text.find('"') {
                    return Ok(version_text[..end].to_string());
                }
            }
        }

        // Try readme.html
        let readme_url = format!("{}/readme.html", url.trim_end_matches('/'));
        if let Ok(response) = self.client.get(&readme_url).send().await {
            if let Ok(text) = response.text().await {
                if let Some(start) = text.find("Version ") {
                    let version_text = &text[start + 8..];
                    if let Some(end) = version_text.find(|c: char| !c.is_numeric() && c != '.') {
                        return Ok(version_text[..end].to_string());
                    }
                }
            }
        }

        Err("Could not detect WordPress version".to_string())
    }

    async fn enumerate_plugins(&self, url: &str) -> Result<Vec<Plugin>, String> {
        let mut plugins = Vec::new();
        let base_url = url.trim_end_matches('/');

        let response = self.client.get(base_url).send().await.map_err(|e| e.to_string())?;
        let html = response.text().await.map_err(|e| e.to_string())?;

        // Find plugin references in HTML
        for line in html.lines() {
            if line.contains("/wp-content/plugins/") {
                if let Some(start) = line.find("/wp-content/plugins/") {
                    let plugin_path = &line[start + 20..];
                    if let Some(end) = plugin_path.find('/') {
                        let slug = plugin_path[..end].to_string();
                        
                        if !plugins.iter().any(|p: &Plugin| p.slug == slug) {
                            let version = self.get_plugin_version(base_url, &slug).await.ok();
                            
                            plugins.push(Plugin {
                                name: slug.replace('-', " ").to_string(),
                                version,
                                slug,
                                vulnerabilities: Vec::new(),
                            });
                        }
                    }
                }
            }
        }

        Ok(plugins)
    }

    async fn get_plugin_version(&self, base_url: &str, slug: &str) -> Result<String, String> {
        let readme_url = format!("{}/wp-content/plugins/{}/readme.txt", base_url, slug);
        
        if let Ok(response) = self.client.get(&readme_url).send().await {
            if let Ok(text) = response.text().await {
                for line in text.lines() {
                    if line.to_lowercase().starts_with("stable tag:") {
                        return Ok(line.split(':').nth(1).unwrap_or("").trim().to_string());
                    }
                }
            }
        }

        Err("Version not found".to_string())
    }

    async fn enumerate_themes(&self, url: &str) -> Result<Vec<Theme>, String> {
        let mut themes = Vec::new();
        let base_url = url.trim_end_matches('/');

        let response = self.client.get(base_url).send().await.map_err(|e| e.to_string())?;
        let html = response.text().await.map_err(|e| e.to_string())?;

        for line in html.lines() {
            if line.contains("/wp-content/themes/") {
                if let Some(start) = line.find("/wp-content/themes/") {
                    let theme_path = &line[start + 19..];
                    if let Some(end) = theme_path.find('/') {
                        let slug = theme_path[..end].to_string();
                        
                        if !themes.iter().any(|t: &Theme| t.slug == slug) {
                            let version = self.get_theme_version(base_url, &slug).await.ok();
                            
                            themes.push(Theme {
                                name: slug.replace('-', " ").to_string(),
                                version,
                                slug,
                                vulnerabilities: Vec::new(),
                            });
                        }
                    }
                }
            }
        }

        Ok(themes)
    }

    async fn get_theme_version(&self, base_url: &str, slug: &str) -> Result<String, String> {
        let style_url = format!("{}/wp-content/themes/{}/style.css", base_url, slug);
        
        if let Ok(response) = self.client.get(&style_url).send().await {
            if let Ok(text) = response.text().await {
                for line in text.lines() {
                    if line.to_lowercase().starts_with("version:") {
                        return Ok(line.split(':').nth(1).unwrap_or("").trim().to_string());
                    }
                }
            }
        }

        Err("Version not found".to_string())
    }

    async fn enumerate_users(&self, url: &str) -> Result<Vec<User>, String> {
        let mut users = Vec::new();
        let base_url = url.trim_end_matches('/');

        let api_url = format!("{}/wp-json/wp/v2/users", base_url);
        
        if let Ok(response) = self.client.get(&api_url).send().await {
            if let Ok(json) = response.json::<Vec<serde_json::Value>>().await {
                for user in json {
                    if let (Some(id), Some(login)) = (user["id"].as_i64(), user["slug"].as_str()) {
                        users.push(User {
                            id: id as u32,
                            login: login.to_string(),
                            display_name: user["name"].as_str().map(|s| s.to_string()),
                        });
                    }
                }
            }
        }

        Ok(users)
    }

    async fn check_wordpress_vulnerabilities(&self, version: &str) -> Result<Vec<Vulnerability>, String> {
        let url = format!("https://wpscan.com/api/v3/wordpresses/{}", version);
        println!("[v0] Calling WPScan API: {}", url);
        
        let response = self.client
            .get(&url)
            .header("Authorization", format!("Token {}", self.api_key))
            .send()
            .await
            .map_err(|e| format!("API request failed: {}", e))?;

        if !response.status().is_success() {
            println!("[v0] API returned status: {}", response.status());
            return Ok(Vec::new());
        }

        let api_response: WpscanApiResponse = response.json().await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(self.parse_vulnerabilities(api_response))
    }

    async fn check_plugin_vulnerabilities(&self, slug: &str) -> Result<Vec<Vulnerability>, String> {
        let url = format!("https://wpscan.com/api/v3/plugins/{}", slug);
        println!("[v0] Calling WPScan API: {}", url);
        
        let response = self.client
            .get(&url)
            .header("Authorization", format!("Token {}", self.api_key))
            .send()
            .await
            .map_err(|e| format!("API request failed: {}", e))?;

        if !response.status().is_success() {
            println!("[v0] API returned status: {}", response.status());
            return Ok(Vec::new());
        }

        let api_response: WpscanApiResponse = response.json().await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(self.parse_vulnerabilities(api_response))
    }

    async fn check_theme_vulnerabilities(&self, slug: &str) -> Result<Vec<Vulnerability>, String> {
        let url = format!("https://wpscan.com/api/v3/themes/{}", slug);
        println!("[v0] Calling WPScan API: {}", url);
        
        let response = self.client
            .get(&url)
            .header("Authorization", format!("Token {}", self.api_key))
            .send()
            .await
            .map_err(|e| format!("API request failed: {}", e))?;

        if !response.status().is_success() {
            println!("[v0] API returned status: {}", response.status());
            return Ok(Vec::new());
        }

        let api_response: WpscanApiResponse = response.json().await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(self.parse_vulnerabilities(api_response))
    }

    fn parse_vulnerabilities(&self, response: WpscanApiResponse) -> Vec<Vulnerability> {
        let mut vulnerabilities = Vec::new();

        for (_, vulns) in response.vulnerabilities {
            for vuln in vulns {
                vulnerabilities.push(Vulnerability {
                    id: vuln.id.unwrap_or_else(|| "unknown".to_string()),
                    title: vuln.title,
                    description: None,
                    vuln_type: vuln.vuln_type,
                    severity: None,
                    fixed_in: vuln.fixed_in,
                    references: vuln.references.url.unwrap_or_default(),
                    cve: None,
                });
            }
        }

        vulnerabilities
    }
}

#[derive(Debug, Deserialize)]
struct WpscanApiResponse {
    #[serde(flatten)]
    vulnerabilities: HashMap<String, Vec<WpscanVulnerability>>,
}

#[derive(Debug, Deserialize)]
struct WpscanVulnerability {
    id: Option<String>,
    title: String,
    vuln_type: Option<String>,
    fixed_in: Option<String>,
    references: WpscanReferences,
}

#[derive(Debug, Deserialize)]
struct WpscanReferences {
    url: Option<Vec<String>>,
}