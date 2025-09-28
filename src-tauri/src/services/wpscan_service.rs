// services/wpscan_service.rs
use reqwest::Client;
use serde_json::Value;
use crate::models::wpscan::{WpscanResult, WpscanApiResponse, Vulnerability, Plugin, Theme, User};

#[derive(Debug)]
pub struct WpscanService {
    client: Client,
    api_key: String,
}

impl WpscanService {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    pub async fn scan_website(&self, url: &str) -> Result<WpscanResult, Box<dyn std::error::Error>> {
        // First, detect if it's WordPress
        let is_wordpress = self.detect_wordpress(url).await?;
        
        if !is_wordpress {
            // If not WordPress, return basic result
            return Ok(WpscanResult {
                vulnerabilities: vec![],
                plugins: vec![],
                themes: vec![],
                users: vec![],
                scan_date: chrono::Utc::now().to_rfc3339(),
                is_wordpress: false,
            });
        }

        // Make actual API call to WPScan
        let api_url = "https://wpscan.com/api/v3/wordpresses";
        
        let response = self.client
            .post(api_url)
            .header("Authorization", format!("Token {}", self.api_key))
            .json(&serde_json::json!({
                "url": url,
                "enumerate": "vp,vt,u,cb,dbe"  // vulnerabilities, plugins, themes, users, config backups, db exports
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(format!("WPScan API error {}: {}", status, text).into());
        }

        let api_response: WpscanApiResponse = response.json().await?;
        
        // Parse the response into our structured format
        let vulnerabilities = self.parse_vulnerabilities(&api_response.vulns)?;
        let plugins = self.parse_plugins(&api_response.plugins)?;
        let themes = self.parse_themes(&api_response.themes)?;
        let users = self.parse_users(&api_response.users)?;

        Ok(WpscanResult {
            vulnerabilities,
            plugins,
            themes,
            users,
            scan_date: chrono::Utc::now().to_rfc3339(),
            is_wordpress: true,
        })
    }

    async fn detect_wordpress(&self, url: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let response = self.client
            .get(url)
            .timeout(std::time::Duration::from_secs(10))
            .send()
            .await?;

        let text = response.text().await?;
        
        // Check for WordPress indicators
        let is_wordpress = text.contains("wp-content")
            || text.contains("wp-includes")
            || text.contains("WordPress")
            || text.contains("wp-json")
            || text.contains("/wp-admin/")
            || text.contains("wp-embed.min.js");

        Ok(is_wordpress)
    }

    fn parse_vulnerabilities(&self, vulns: &Option<Value>) -> Result<Vec<Vulnerability>, Box<dyn std::error::Error>> {
        let mut vulnerabilities = Vec::new();

        if let Some(vulns_obj) = vulns {
            if let Some(vulns_map) = vulns_obj.as_object() {
                for (vuln_id, vuln_data) in vulns_map {
                    if let Some(vuln_obj) = vuln_data.as_object() {
                        let title = vuln_obj.get("title")
                            .and_then(|v| v.as_str())
                            .unwrap_or("Unknown vulnerability")
                            .to_string();

                        let description = vuln_obj.get("description")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();

                        // Parse severity from CVSS score or classification
                        let severity = self.determine_severity(vuln_obj);

                        let cve = vuln_obj.get("cve")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());

                        let references = vuln_obj.get("references")
                            .and_then(|v| v.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .filter_map(|ref_val| ref_val.as_str())
                                    .map(|s| s.to_string())
                                    .collect()
                            })
                            .unwrap_or_default();

                        vulnerabilities.push(Vulnerability {
                            id: vuln_id.clone(),
                            title,
                            description,
                            severity,
                            cve,
                            references,
                        });
                    }
                }
            }
        }

        Ok(vulnerabilities)
    }

    fn parse_plugins(&self, plugins: &Option<Value>) -> Result<Vec<Plugin>, Box<dyn std::error::Error>> {
        let mut plugin_list = Vec::new();

        if let Some(plugins_obj) = plugins {
            if let Some(plugins_map) = plugins_obj.as_object() {
                for (plugin_name, plugin_data) in plugins_map {
                    if let Some(plugin_obj) = plugin_data.as_object() {
                        let version = plugin_obj.get("version")
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown")
                            .to_string();

                        let vulnerabilities = plugin_obj.get("vulnerabilities")
                            .and_then(|v| self.parse_vulnerabilities(&Some(v.clone())).ok())
                            .unwrap_or_default();

                        plugin_list.push(Plugin {
                            name: plugin_name.clone(),
                            version,
                            vulnerabilities,
                        });
                    }
                }
            }
        }

        Ok(plugin_list)
    }

    fn parse_themes(&self, themes: &Option<Value>) -> Result<Vec<Theme>, Box<dyn std::error::Error>> {
        let mut theme_list = Vec::new();

        if let Some(themes_obj) = themes {
            if let Some(themes_map) = themes_obj.as_object() {
                for (theme_name, theme_data) in themes_map {
                    if let Some(theme_obj) = theme_data.as_object() {
                        let version = theme_obj.get("version")
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown")
                            .to_string();

                        let vulnerabilities = theme_obj.get("vulnerabilities")
                            .and_then(|v| self.parse_vulnerabilities(&Some(v.clone())).ok())
                            .unwrap_or_default();

                        theme_list.push(Theme {
                            name: theme_name.clone(),
                            version,
                            vulnerabilities,
                        });
                    }
                }
            }
        }

        Ok(theme_list)
    }

    fn parse_users(&self, users: &Option<Value>) -> Result<Vec<User>, Box<dyn std::error::Error>> {
        let mut user_list = Vec::new();

        if let Some(users_obj) = users {
            if let Some(users_map) = users_obj.as_object() {
                for (user_id_str, user_data) in users_map {
                    if let Some(user_obj) = user_data.as_object() {
                        let id = user_id_str.parse::<u32>().unwrap_or(0);
                        
                        let login = user_obj.get("login")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();

                        let display_name = user_obj.get("display_name")
                            .and_then(|v| v.as_str())
                            .unwrap_or(&login)
                            .to_string();

                        user_list.push(User {
                            id,
                            login,
                            display_name,
                        });
                    }
                }
            }
        }

        Ok(user_list)
    }

    fn determine_severity(&self, vuln_obj: &serde_json::Map<String, Value>) -> String {
        // Check for explicit severity
        if let Some(severity) = vuln_obj.get("severity").and_then(|v| v.as_str()) {
            return severity.to_lowercase();
        }

        // Check CVSS score
        if let Some(cvss) = vuln_obj.get("cvss_score").and_then(|v| v.as_f64()) {
            return match cvss {
                score if score >= 9.0 => "critical".to_string(),
                score if score >= 7.0 => "high".to_string(),
                score if score >= 4.0 => "medium".to_string(),
                _ => "low".to_string(),
            };
        }

        // Default to medium if no severity info
        "medium".to_string()
    }
}