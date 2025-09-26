use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WpscanResult {
    pub vulnerabilities: Vec<Vulnerability>,
    pub plugins: Vec<Plugin>,
    pub themes: Vec<Theme>,
    pub users: Vec<User>,
    pub scan_date: String,
    pub is_wordpress: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vulnerability {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub cve: Option<String>,
    pub references: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Plugin {
    pub name: String,
    pub version: String,
    pub vulnerabilities: Vec<Vulnerability>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub version: String,
    pub vulnerabilities: Vec<Vulnerability>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: u32,
    pub login: String,
    pub display_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WpscanApiResponse {
    pub target_url: String,
    pub target_ip: Option<String>,
    pub effective_url: Option<String>,
    pub interesting_entries: Vec<String>,
    pub plugins: Option<serde_json::Value>,
    pub themes: Option<serde_json::Value>,
    pub users: Option<serde_json::Value>,
    pub version: Option<serde_json::Value>,
    pub main_theme: Option<serde_json::Value>,
    pub vulns: Option<serde_json::Value>,
}
