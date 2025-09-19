use super::web_vitals::WebVitals;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Website {
    pub id: i64,
    pub url: String,
    pub name: String,
    pub vitals: Option<WebVitals>,
    pub status: Option<u16>,
    #[serde(rename = "lastChecked")]
    pub last_checked: Option<String>,
    pub industry: String,
    pub favorite: bool,
    pub screenshot: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Industry {
    General,
    Ecommerce,
    Finance,
    Healthcare,
    Education,
    Technology,
}

/**
 * impl Industry {
    pub fn as_str(&self) -> &'static str {
        match self {
            Industry::General => "general",
            Industry::Ecommerce => "ecommerce",
            Industry::Finance => "finance",
            Industry::Healthcare => "healthcare",
            Industry::Education => "education",
            Industry::Technology => "technology",
        }
    }
}

 */
// Implement Default for Website to handle missing fields
impl Default for Website {
    fn default() -> Self {
        Self {
            id: 0,
            url: String::new(),
            name: String::new(),
            vitals: None,
            status: None,
            last_checked: None,
            industry: "general".to_string(),
            favorite: false,
            screenshot: None,
        }
    }
}
