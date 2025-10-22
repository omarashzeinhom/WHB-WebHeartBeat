// src/pages/DashBoard/ImportSettingsPopup/ImportSettingsPopup.tsx
import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, X, Settings, Globe } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { Website } from '../../../models/website';

interface ImportValidationResult {
  valid: boolean;
  website_count: number;
  has_duplicates: boolean;
  missing_urls: number;
  error_message?: string;
}

interface ImportSettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'websites' | 'full-backup';
  onImportComplete: (data: any) => void;
}

interface BackupFileStructure {
  websites: Website[];
  customStatuses: { value: string; label: string; color: string }[];
  exportDate: string;
  version: string;
}

const ImportSettingsPopup: React.FC<ImportSettingsPopupProps> = ({
  isOpen,
  onClose,
  mode,
  onImportComplete
}) => {
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileStructure, setFileStructure] = useState<'websites-only' | 'full-backup' | 'unknown'>('unknown');
  const [mergeMode, setMergeMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setFileStructure('unknown');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const analyzeFileStructure = (parsed: any): 'websites-only' | 'full-backup' | 'unknown' => {
    // Check if it's a full backup file
    if (parsed.websites && Array.isArray(parsed.websites) && parsed.customStatuses !== undefined) {
      return 'full-backup';
    }
    // Check if it's websites-only (array of websites)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].url !== undefined) {
      return 'websites-only';
    }
    return 'unknown';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationResult(null);
    setFileStructure('unknown');

    try {
      const text = await file.text();
      
      // First, validate it's valid JSON
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        setValidationResult({
          valid: false,
          website_count: 0,
          has_duplicates: false,
          missing_urls: 0,
          error_message: 'File is not valid JSON'
        });
        return;
      }

      // Analyze file structure
      const structure = analyzeFileStructure(parsed);
      setFileStructure(structure);

      // Validate based on import mode
      if (mode === 'full-backup') {
        validateFullBackupFile(parsed, text);
      } else {
        validateWebsitesOnlyFile(parsed, text);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: `Validation failed: ${error}`
      });
    }
  };

  const validateFullBackupFile = (parsed: any, text: string) => {
    // For full backup, expect the backup structure
    if (!parsed.websites || !Array.isArray(parsed.websites)) {
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: 'Backup file must contain websites array'
      });
      return;
    }

    if (parsed.websites.length === 0) {
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: 'Backup file contains no websites'
      });
      return;
    }

    // Validate the websites array
    invoke<ImportValidationResult>('validate_import_data', {
      jsonData: JSON.stringify(parsed.websites)
    }).then(result => {
      setValidationResult(result);
    }).catch(error => {
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: `Validation failed: ${error}`
      });
    });
  };

  const validateWebsitesOnlyFile = (parsed: any, text: string) => {
    // For websites only, expect an array of websites
    if (!Array.isArray(parsed)) {
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: 'File must be an array of websites'
      });
      return;
    }

    if (parsed.length === 0) {
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: 'File contains no websites'
      });
      return;
    }

    // Validate with Rust backend
    invoke<ImportValidationResult>('validate_import_data', {
      jsonData: text
    }).then(result => {
      setValidationResult(result);
    }).catch(error => {
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: `Validation failed: ${error}`
      });
    });
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.valid) return;

    setImporting(true);
    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);

      if (mode === 'full-backup') {
        // For full backup, import everything
        const backupData = parsed as BackupFileStructure;
        
        // Import websites
        const importedWebsites = await invoke<Website[]>('import_websites', {
          jsonData: JSON.stringify(backupData.websites),
          merge: mergeMode
        });

        // Import custom statuses if they exist
        if (backupData.customStatuses && Array.isArray(backupData.customStatuses)) {
          // Update custom statuses in localStorage
          const storage = {
            customStatuses: backupData.customStatuses
          };
          localStorage.setItem('customProjectStatuses', JSON.stringify(storage));
        }

        onImportComplete({
          websites: importedWebsites,
          customStatuses: backupData.customStatuses || []
        });

        alert(`Successfully imported ${importedWebsites.length} websites and ${backupData.customStatuses?.length || 0} custom statuses!`);
      } else {
        // For websites only, just import websites
        const importedWebsites = await invoke<Website[]>('import_websites', {
          jsonData: text,
          merge: mergeMode
        });

        onImportComplete(importedWebsites);
        alert(`Successfully imported ${importedWebsites.length} websites!`);
      }

      handleClose();
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error}`);
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content import-popup">
        <div className="popup-header">
          <h2>
            {mode === 'full-backup' ? 'Import Full Backup' : 'Import Websites Only'}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="import-description">
          {mode === 'full-backup' ? (
            <div className="import-mode-info">
              <Settings size={18} />
              <span>Import websites, custom statuses, and all settings</span>
            </div>
          ) : (
            <div className="import-mode-info">
              <Globe size={18} />
              <span>Import websites only (preserve current settings)</span>
            </div>
          )}
        </div>

        <div className="import-mode">
          <label>
            <input
              type="radio"
              checked={mergeMode}
              onChange={() => setMergeMode(true)}
            />
            Merge with existing {mode === 'full-backup' ? 'settings' : 'websites'}
          </label>
          <label>
            <input
              type="radio"
              checked={!mergeMode}
              onChange={() => setMergeMode(false)}
            />
            Replace all {mode === 'full-backup' ? 'settings' : 'websites'} (⚠️ deletes existing)
          </label>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          className="file-select-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={18} />
          Select JSON File
        </button>

        {selectedFile && (
          <div className="file-info">
            <strong>Selected file:</strong> {selectedFile.name}
            {fileStructure !== 'unknown' && (
              <span className={`file-structure ${fileStructure}`}>
                {fileStructure === 'full-backup' ? '📊 Full Backup' : '🌐 Websites Only'}
              </span>
            )}
          </div>
        )}

        {validationResult && (
          <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
            {validationResult.valid ? (
              <>
                <Check size={20} />
                <div>
                  <strong>File is valid!</strong>
                  <p>Found {validationResult.website_count} websites</p>
                  {mode === 'full-backup' && fileStructure === 'full-backup' && (
                    <p>✅ Includes custom statuses and settings</p>
                  )}
                  {mode === 'full-backup' && fileStructure === 'websites-only' && (
                    <p>⚠️ File contains only websites (no custom statuses)</p>
                  )}
                  {validationResult.has_duplicates && (
                    <p className="warning">⚠️ Contains duplicate URLs</p>
                  )}
                  {validationResult.missing_urls > 0 && (
                    <p className="warning">⚠️ {validationResult.missing_urls} websites missing URLs</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={20} />
                <div>
                  <strong>Invalid file</strong>
                  <p>{validationResult.error_message}</p>
                  {mode === 'full-backup' && fileStructure === 'websites-only' && (
                    <p>This appears to be a websites-only file. Try "Import Websites Only" instead.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {validationResult?.valid && (
          <div className="import-actions">
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn-primary"
            >
              {importing ? 'Importing...' : `Import ${mode === 'full-backup' ? 'Backup' : 'Websites'}`}
            </button>
            <button
              onClick={handleClose}
              disabled={importing}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportSettingsPopup;