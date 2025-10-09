// services/storage_service.rs
use crate::models::website::Website;
use std::fs::{File, OpenOptions};
use std::io::prelude::*;

#[derive(Debug)]
pub struct StorageService {
    file_path: String,
}

impl StorageService {
    pub fn new(file_path: String) -> Self {
        Self { file_path }
    }

    pub fn get_websites(&self) -> Result<Vec<Website>, std::io::Error> {
        let mut file = File::open(&self.file_path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;

        let websites: Vec<Website> = serde_json::from_str(&contents).unwrap_or_else(|_| Vec::new());

        Ok(websites)
    }

    pub fn save_websites(&self, websites: &[Website]) -> Result<(), std::io::Error> {
        let json = serde_json::to_string_pretty(websites)?;
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .open(&self.file_path)?;

        file.write_all(json.as_bytes())?;
        Ok(())
    }

    pub fn update_website(&self, website: &Website) -> Result<(), Box<dyn std::error::Error>> {
        let mut websites = self.get_websites()?;

        // Find the index of the website to update
        if let Some(index) = websites.iter().position(|w| w.id == website.id) {
            websites[index] = website.clone();
            self.save_websites(&websites)?;
        }

        Ok(())
    }
}
