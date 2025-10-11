// components/ImportWebsites/ImportWebsites.tsx
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileJson, 
  Check, 
  AlertCircle, 
  Info,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import './ImportStatusPopup.css';
import { Website } from '../../../../models/website';

interface ImportValidationResult {
  valid: boolean;
  website_count: number;
  has_duplicates: boolean;
  missing_urls: number;
  error_message?: string;
}

interface ImportWebsitesProps {
  onImportComplete: (websites: Website[]) => void;
  variant?: 'full' | 'compact';
}

const ImportWebsites: React.FC<ImportWebsitesProps> = ({ 
  onImportComplete,
  variant = 'full'
}) => {
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mergeMode, setMergeMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationResult(null);

    try {
      const text = await file.text();
      const result = await invoke<ImportValidationResult>('validate_import_data', {
        jsonData: text
      });
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        website_count: 0,
        has_duplicates: false,
        missing_urls: 0,
        error_message: `Validation failed: ${error}`
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.valid) return;

    setImporting(true);
    try {
      const text = await selectedFile.text();
      const importedWebsites = await invoke<Website[]>('import_websites', {
        jsonData: text,
        merge: mergeMode
      });
      
      onImportComplete(importedWebsites);
      
      // Reset state
      setSelectedFile(null);
      setValidationResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert(`Import failed: ${error}`);
    } finally {
      setImporting(false);
    }
  };

  const handleCancelImport = () => {
    setSelectedFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`import-websites ${isCompact ? 'import-websites--compact' : ''}`}>
      {!isCompact && (
        <div className="import-websites__header">
          <FileJson size={24} className="import-websites__header-icon" />
          <h2 className="import-websites__title">Import Websites</h2>
        </div>
      )}

      <div className="import-websites__content">
        {!isCompact && (
          <p className="import-websites__description">
            Import websites from a previously exported JSON file.
          </p>
        )}

        {/* Import Mode Selection */}
        <div className="import-websites__mode">
          <label className="import-websites__radio-label">
            <input
              type="radio"
              checked={mergeMode}
              onChange={() => setMergeMode(true)}
              className="import-websites__radio-input"
            />
            <span className="import-websites__radio-text">
              Merge with existing websites {!isCompact && '(recommended)'}
            </span>
          </label>
          <label className="import-websites__radio-label">
            <input
              type="radio"
              checked={!mergeMode}
              onChange={() => setMergeMode(false)}
              className="import-websites__radio-input"
            />
            <span className="import-websites__radio-text import-websites__radio-text--warning">
              Replace all websites {!isCompact && '(⚠️ deletes existing data)'}
            </span>
          </label>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="import-websites__file-input"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="import-websites__select-btn"
        >
          <Upload size={18} />
          Select JSON File
        </button>

        {/* Validation Result */}
        {validationResult && (
          <div className={`import-websites__validation ${
            validationResult.valid 
              ? 'import-websites__validation--valid' 
              : 'import-websites__validation--invalid'
          }`}>
            {validationResult.valid ? (
              <>
                <div className="import-websites__validation-header">
                  <Check size={20} />
                  <strong>File is valid!</strong>
                </div>
                <div className="import-websites__validation-body">
                  <p className="import-websites__validation-item">
                    ✓ Found {validationResult.website_count} websites
                  </p>
                  {validationResult.has_duplicates && (
                    <p className="import-websites__validation-item import-websites__validation-item--warning">
                      <AlertTriangle size={16} />
                      Contains duplicate URLs
                    </p>
                  )}
                  {validationResult.missing_urls > 0 && (
                    <p className="import-websites__validation-item import-websites__validation-item--warning">
                      <AlertTriangle size={16} />
                      {validationResult.missing_urls} websites missing URLs
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="import-websites__validation-header">
                  <AlertCircle size={20} />
                  <strong>Invalid file</strong>
                </div>
                <p className="import-websites__validation-body">
                  {validationResult.error_message}
                </p>
              </>
            )}
          </div>
        )}

        {/* Import Actions */}
        {validationResult?.valid && (
          <div className="import-websites__actions">
            <button
              onClick={handleImport}
              disabled={importing}
              className="import-websites__btn import-websites__btn--primary"
            >
              {importing ? (
                <>
                  <RefreshCw size={18} className="import-websites__spinner" />
                  Importing...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Import {validationResult.website_count} Websites
                </>
              )}
            </button>
            <button
              onClick={handleCancelImport}
              disabled={importing}
              className="import-websites__btn import-websites__btn--secondary"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Info Box */}
        {!isCompact && (
          <div className="import-websites__info">
            <Info size={16} className="import-websites__info-icon" />
            <div className="import-websites__info-content">
              <strong>Import Tips:</strong>
              <ul className="import-websites__info-list">
                <li>Only JSON files exported from this app are supported</li>
                <li>Merge mode will add imported websites to your existing list</li>
                <li>Replace mode will delete all current websites</li>
                <li>Duplicate URLs will be automatically handled</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportWebsites;