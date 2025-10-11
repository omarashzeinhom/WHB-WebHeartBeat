use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CloudBackupResult {
    pub success: bool,
    pub message: String,
    pub backup_path: Option<String>,
    pub timestamp: String,
}