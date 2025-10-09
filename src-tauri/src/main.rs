// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod controllers;
mod models;
mod services;

use services::storage_service::StorageService;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let storage = StorageService::new("../websites.json".to_string());
            app.manage(storage);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            controllers::website_controller::get_websites,
            controllers::website_controller::save_websites,
            controllers::website_controller::check_website_status,
            controllers::website_controller::get_web_vitals,
            controllers::website_controller::export_websites,
            controllers::website_controller::save_to_cloud,
            controllers::website_controller::scan_website,
            controllers::website_controller::detect_wordpress,
            controllers::website_controller::update_website_industry,
            controllers::website_controller::update_website_project_status,
            controllers::screenshot_controller::take_screenshot,
            controllers::screenshot_controller::take_bulk_screenshots,
            controllers::screenshot_controller::cancel_bulk_screenshots,
            controllers::cloud_controller::start_google_drive_auth,
            controllers::cloud_controller::complete_google_drive_auth,
            controllers::cloud_controller::backup_to_google_drive,
            controllers::cloud_controller::is_google_drive_authenticated,
            controllers::cloud_controller::disconnect_google_drive,
            controllers::cloud_controller::backup_local,
            controllers::cloud_controller::open_backup_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
