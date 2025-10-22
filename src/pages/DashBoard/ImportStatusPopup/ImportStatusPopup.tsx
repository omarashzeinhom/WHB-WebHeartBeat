
// ImportWebsites.tsx - Fixed import with better validation
import React, { useState, useRef } from 'react';
import { Upload,  Check, AlertCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { Website } from '../../../models/website';

interface ImportValidationResult {
  valid: boolean;
  website_count: number;
  has_duplicates: boolean;
  missing_urls: number;
  error_message?: string;
}

interface ImportWebsitesProps {
  onImportComplete: (websites: Website[]) => void;
}

const ImportWebsites: React.FC<ImportWebsitesProps> = ({ onImportComplete }) => {
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

      // Check if it's an array
      if (!Array.isArray(parsed)) {
        setValidationResult({
          valid: false,
          website_count: 0,
          has_duplicates: false,
          missing_urls: 0,
          error_message: 'JSON must be an array of websites, got an object instead'
        });
        return;
      }

      // If empty array
      if (parsed.length === 0) {
        setValidationResult({
          valid: false,
          website_count: 0,
          has_duplicates: false,
          missing_urls: 0,
          error_message: 'JSON array is empty'
        });
        return;
      }

      console.log('Validating import data:', {
        isArray: Array.isArray(parsed),
        count: parsed.length,
        firstItem: parsed[0]
      });

      // Validate with Rust backend
      const result = await invoke<ImportValidationResult>('validate_import_data', {
        jsonData: text
      });
      
      console.log('Validation result:', result);
      setValidationResult(result);
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

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.valid) return;

    setImporting(true);
    try {
      const text = await selectedFile.text();
      
      console.log('Importing websites with merge mode:', mergeMode);
      
      const importedWebsites = await invoke<Website[]>('import_websites', {
        jsonData: text,
        merge: mergeMode
      });
      
      console.log('Import successful:', importedWebsites.length, 'websites');
      
      onImportComplete(importedWebsites);
      
      // Reset state
      setSelectedFile(null);
      setValidationResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert(`Successfully imported ${importedWebsites.length} websites!`);
    } catch (error) {
      console.error('Import error:', error);
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

  return (
    <div className="import-websites">
      <h2>Import Websites</h2>
      
      <div className="import-mode">
        <label>
          <input
            type="radio"
            checked={mergeMode}
            onChange={() => setMergeMode(true)}
          />
          Merge with existing websites
        </label>
        <label>
          <input
            type="radio"
            checked={!mergeMode}
            onChange={() => setMergeMode(false)}
          />
          Replace all websites (⚠️ deletes existing)
        </label>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <button onClick={() => fileInputRef.current?.click()}>
        <Upload size={18} />
        Select JSON File
      </button>

      {validationResult && (
        <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
          {validationResult.valid ? (
            <>
              <Check size={20} />
              <div>
                <strong>File is valid!</strong>
                <p>Found {validationResult.website_count} websites</p>
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
            {importing ? 'Importing...' : `Import ${validationResult.website_count} Websites`}
          </button>
          <button
            onClick={handleCancelImport}
            disabled={importing}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportWebsites;