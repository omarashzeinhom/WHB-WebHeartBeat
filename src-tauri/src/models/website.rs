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
    pub favorite: bool,
    pub screenshot: Option<String>,
    pub is_wordpress: Option<bool>,
}

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

impl Industry {
    pub fn as_str(&self) -> &str {
        match self {
            Industry::General => "general",
            Industry::Ecommerce => "ecommerce",
            Industry::Finance => "finance",
            Industry::Healthcare => "healthcare",
            Industry::Education => "education",
            Industry::Technology => "technology",
            Industry::Media => "media",
            Industry::Travel => "travel",
            Industry::Government => "government",
            Industry::Nonprofit => "nonprofit",
        }
    }
}