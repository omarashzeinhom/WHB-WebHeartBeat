use reqwest;
use crate::models::website::Website;

pub struct Back4AppService {
    application_id: String,
    rest_api_key: String,
}

impl Back4AppService {
    pub fn new(application_id: String, rest_api_key: String) -> Self {
        Self {
            application_id,
            rest_api_key,
        }
    }

    pub async fn save_website(&self, website: Website) -> Result<(), String> {
        // Implementation for saving to Back4App
        Ok(())
    }
}