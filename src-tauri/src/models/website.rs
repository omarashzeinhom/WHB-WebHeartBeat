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

// Define all notes-related structs first

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DNSRecord {
    pub record_type: String, // 'A', 'MX', 'TXT', 'CNAME', 'NS'
    pub value: String,
    pub ttl: Option<u32>,
    pub last_checked: String,
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
pub struct ProjectAccess {
    pub credentials: Vec<Credential>,
    pub access_notes: String,
    pub warning_acknowledged: bool,
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
pub struct SecurityNotes {
    pub vulnerabilities: Vec<SecurityVulnerability>,
    pub open_ports: Vec<Port>,
    pub exposed_info: String,
    pub security_scan_results: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WebsiteReport {
    pub summary: String,
    pub performance: String,
    pub security: String,
    pub recommendations: String,
    pub generated_date: String,
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

// Now define the Website struct, which uses WebVitals and WebsiteNotes
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Website {
    pub id: i64,
    pub url: String,
    pub name: String,
    pub vitals: Option<WebVitals>,
    pub status: Option<u16>,
    #[serde(rename = "lastChecked")]
    pub last_checked: Option<String>,
    pub industry: String,
    #[serde(rename = "projectStatus")]
    pub project_status: Option<String>,
    pub favorite: bool,
    pub screenshot: Option<String>,
    #[serde(rename = "isWordPress")]
    pub is_wordpress: Option<bool>,
    pub description: Option<String>,
    pub notes: Option<WebsiteNotes>, // Use the WebsiteNotes struct defined above
    pub tags: Option<Vec<String>>,
}

// Implement Default for Website and the notes structs if needed
impl Default for Website {
    fn default() -> Self {
        Self {
            id: 0,
            url: String::new(),
            name: String::new(),
            vitals: Some(WebVitals::default()),
            status: None,
            last_checked: None,
            industry: "general".to_string(),
            project_status: Some("wip".to_string()),
            favorite: false,
            screenshot: None,
            is_wordpress: None,
            description: None,
            notes: Some(WebsiteNotes::default()),
            tags: None,
        }
    }
}

// Implement Default for WebsiteNotes and its nested structs
impl Default for WebsiteNotes {
    fn default() -> Self {
        Self {
            dns_history: Vec::new(),
            project_access: ProjectAccess::default(),
            general_notes: String::new(),
            security: SecurityNotes::default(),
            report: WebsiteReport::default(),
            last_updated: chrono::Utc::now().to_rfc3339(),
        }
    }
}

impl Default for ProjectAccess {
    fn default() -> Self {
        Self {
            credentials: Vec::new(),
            access_notes: String::new(),
            warning_acknowledged: false,
        }
    }
}

impl Default for SecurityNotes {
    fn default() -> Self {
        Self {
            vulnerabilities: Vec::new(),
            open_ports: Vec::new(),
            exposed_info: String::new(),
            security_scan_results: String::new(),
        }
    }
}

impl Default for WebsiteReport {
    fn default() -> Self {
        Self {
            summary: String::new(),
            performance: String::new(),
            security: String::new(),
            recommendations: String::new(),
            generated_date: chrono::Utc::now().to_rfc3339(),
        }
    }
}

// We also have the Industry enum, but it's not used in Website, so we can remove it or leave it?
// Since it's not used, let's remove it to avoid confusion.