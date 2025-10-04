use serde::{Deserialize, Serialize};

// In your models/wpscan.rs file, update the WpscanResult struct:
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WpscanResult {
    pub url: String,
    pub wordpress_version: Option<String>,
    pub vulnerabilities: Vec<Vulnerability>,
    pub plugins: Vec<Plugin>,
    pub themes: Vec<Theme>,
    pub users: Vec<User>,
    pub scan_date: String,
    pub is_wordpress: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Plugin {
    pub name: String,
    pub version: Option<String>,
    pub vulnerabilities: Vec<Vulnerability>,
    pub slug: String, // Add this field
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Theme {
    pub name: String,
    pub version: Option<String>,
    pub vulnerabilities: Vec<Vulnerability>,
    pub slug: String, // Add this field
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: u32, // Change from i32 to u32
    pub login: String, // Change from username to login
    pub display_name: Option<String>, // Change from name to display_name
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Vulnerability {
    pub id: String, // Add this field
    pub title: String,
    pub description: Option<String>, // Add this field
    pub vuln_type: Option<String>,
    pub severity: Option<String>,
    pub fixed_in: Option<String>,
    pub references: Vec<String>,
    pub cve: Option<String>, // Add this field
}