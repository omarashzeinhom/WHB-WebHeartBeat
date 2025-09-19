use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebVitals {
    pub lcp: f64,
    pub fid: f64,
    pub cls: f64,
    pub fcp: f64,
    pub ttfb: f64,
}

// Add a default implementation for when vitals are null
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