// services/back4app_service.rs
use crate::models::website::Website;

pub struct Back4AppService {
    app_id: String,
    rest_api_key: String,
    client: reqwest::Client,
}

impl Back4AppService {
    pub fn new(app_id: String, rest_api_key: String) -> Self {
        Self {
            app_id,
            rest_api_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn sync_website(&self, _website: Website) -> Result<(), Box<dyn std::error::Error>> {
        // TODO: Implement Back4App sync
        println!("Back4App sync not yet implemented");
        Ok(())
    }
}