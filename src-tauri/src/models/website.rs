// models/website.rs
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WebVitals {
    pub lcp: f64,
    pub fid: f64,
    pub cls: f64,
    pub fcp: f64,
    pub ttfb: f64,
}

impl Default for WebVitals {
    fn default() -> Self {
        Self {
            lcp: 0.0,
            fid: 0.0,
            cls: 0.0,
            fcp: 0.0,
            ttfb: 0.0,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Website {
    pub id: i64,
    pub url: String,
    pub name: String,
    pub vitals: Option<WebVitals>,
    pub status: Option<u16>,
    pub last_checked: Option<String>,
    pub industry: String,
    pub project_status: Option<String>, // Add this field
    pub favorite: bool,
    pub screenshot: Option<String>,
    pub is_wordpress: Option<bool>,
    pub description: Option<String>, // Add this field
    pub tags: Option<Vec<String>>,   // Add this field
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WebsiteNotes {
    pub dns_history: Vec<DNSRecord>,
    pub project_access: ProjectAccess,
    pub general_notes: String,
    pub security: SecurityNotes,
    pub report: WebsiteReport,
    pub last_updated: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DNSRecord {
    pub record_type: String, // 'A', 'MX', 'TXT', 'CNAME', 'NS'
    pub value: String,
    pub ttl: Option<u32>,
    pub last_checked: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProjectAccess {
    pub credentials: Vec<Credential>,
    pub access_notes: String,
    pub warning_acknowledged: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Credential {
    pub service: String,
    pub username: String,
    pub password: Option<String>, // Should be encrypted in production
    pub url: String,
    pub notes: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SecurityNotes {
    pub vulnerabilities: Vec<SecurityVulnerability>,
    pub open_ports: Vec<Port>,
    pub exposed_info: String,
    pub security_scan_results: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SecurityVulnerability {
    pub name: String,
    pub severity: String, // 'low', 'medium', 'high', 'critical'
    pub description: String,
    pub status: String, // 'open', 'fixed', 'in-progress'
    pub discovered: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Port {
    pub number: u16,
    pub service: String,
    pub status: String, // 'open', 'closed', 'filtered'
    pub risk: String,   // 'low', 'medium', 'high'
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WebsiteReport {
    pub summary: String,
    pub performance: String,
    pub security: String,
    pub recommendations: String,
    pub generated_date: String,
}

// WPScan related structs (keeping separate from main website vulnerability)
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Vulnerability {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub cve: Option<String>,
    pub references: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Plugin {
    pub name: String,
    pub version: String,
    pub vulnerabilities: Vec<Vulnerability>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub version: String,
    pub vulnerabilities: Vec<Vulnerability>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub id: u32,
    pub login: String,
    pub display_name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]

pub enum Industry {
    General,
    Ecommerce,
    Finance,
    Healthcare,
    Education,
    Technology,
    Media,
    Travel,
    Government,
    Nonprofit,
}
