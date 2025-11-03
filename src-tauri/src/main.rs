// src-tauri/src/main.rs
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
            // Website Controllers
            controllers::website_controller::get_websites,
            controllers::website_controller::save_websites,
            controllers::website_controller::check_website_status,
            controllers::website_controller::get_web_vitals,
            controllers::website_controller::export_websites,
            controllers::website_controller::import_websites,
            controllers::website_controller::validate_import_data,
            controllers::website_controller::save_to_cloud,
            controllers::website_controller::scan_website,
            controllers::website_controller::detect_wordpress,
            controllers::website_controller::update_website_industry,
            controllers::website_controller::update_website_project_status,
            // Screenshot Controllers
            controllers::screenshot_controller::take_screenshot,
            controllers::screenshot_controller::take_bulk_screenshots,
            controllers::screenshot_controller::cancel_bulk_screenshots,
            // Cloud Controllers
            controllers::cloud_controller::start_google_drive_auth,
            controllers::cloud_controller::complete_google_drive_auth,
            controllers::cloud_controller::backup_to_google_drive,
            controllers::cloud_controller::is_google_drive_authenticated,
            controllers::cloud_controller::disconnect_google_drive,
            controllers::cloud_controller::backup_local,
            controllers::cloud_controller::open_backup_folder,
            // NEW Cloud Backup Commands
            controllers::cloud_controller::list_cloud_backups,
            controllers::cloud_controller::restore_from_backup,
            controllers::cloud_controller::delete_backup,
            controllers::cloud_controller::get_backup_stats,
            // Settings Controllers
            controllers::settings_controller::save_settings,
            controllers::settings_controller::load_settings,
            controllers::settings_controller::get_api_key,
            controllers::settings_controller::delete_all_settings,
            controllers::settings_controller::export_settings_unencrypted,
            // System Controllers
            controllers::system_controller::open_containing_folder,
            controllers::system_controller::open_downloads_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
