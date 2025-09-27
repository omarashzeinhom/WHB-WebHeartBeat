import React, { useState, useEffect } from 'react';
import './WpscanSettings.css';

interface WpscanSettingsProps {
  onApiKeyChange: (apiKey: string) => void;
  onFilterChange: (filter: 'all' | 'wordpress' | 'other') => void;
  onScanSelected: () => void;
  onScanAll: () => void;
  websites: any[];
  isScanning: boolean;
}

const WpscanSettings: React.FC<WpscanSettingsProps> = ({
  onApiKeyChange,
  onFilterChange,
  onScanSelected,
  onScanAll,
  websites,
  isScanning
}) => {
  const [apiKey, setApiKey] = useState('');
  const [filter, setFilter] = useState<'all' | 'wordpress' | 'other'>('all');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('wpscan_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    onApiKeyChange(newApiKey);
    
    // Save to localStorage
    if (newApiKey) {
      localStorage.setItem('wpscan_api_key', newApiKey);
    } else {
      localStorage.removeItem('wpscan_api_key');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value as 'all' | 'wordpress' | 'other';
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const filteredWebsites = websites.filter(website => {
    switch (filter) {
      case 'wordpress':
        return website.isWordPress === true;
      case 'other':
        return website.isWordPress === false;
      default:
        return true;
    }
  });

  return (
    <div className="wpscan-settings">
      <div className="settings-section">
        <h3>WPScan Configuration</h3>
        <div className="api-key-section">
          <label htmlFor="wpscan-api-key">WPScan API Key:</label>
          <div className="api-key-input-container">
            <input
              type={showApiKey ? "text" : "password"}
              id="wpscan-api-key"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your WPScan API key"
              className="api-key-input"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={toggleApiKeyVisibility}
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? "🙈" : "👁️"}
            </button>
          </div>
          <small className="api-key-note">
            Your API key is stored locally and never shared. Get your free API key from{' '}
            <a href="https://wpscan.com/api" target="_blank" rel="noopener noreferrer">
              wpscan.com/api
            </a>
          </small>
        </div>
      </div>

      <div className="filter-section">
        <h3>Website Filter</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="website-filter"
              value="all"
              checked={filter === 'all'}
              onChange={handleFilterChange}
            />
            <span>All Websites ({websites.length})</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="website-filter"
              value="wordpress"
              checked={filter === 'wordpress'}
              onChange={handleFilterChange}
            />
            <span>WordPress Only ({websites.filter(w => w.isWordPress === true).length})</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="website-filter"
              value="other"
              checked={filter === 'other'}
              onChange={handleFilterChange}
            />
            <span>Non-WordPress ({websites.filter(w => w.isWordPress === false).length})</span>
          </label>
        </div>
      </div>

      <div className="scan-actions-section">
        <h3>Scan Actions</h3>
        <div className="scan-buttons">
          <button
            className="scan-btn primary"
            onClick={onScanSelected}
            disabled={isScanning || filteredWebsites.length === 0 || !apiKey}
          >
            {isScanning ? "Scanning..." : `Scan Selected (${filteredWebsites.length})`}
          </button>
          <button
            className="scan-btn secondary"
            onClick={onScanAll}
            disabled={isScanning || websites.length === 0 || !apiKey}
          >
            {isScanning ? "Scanning..." : "Scan All Websites"}
          </button>
        </div>
        {!apiKey && (
          <p className="api-key-warning">
            ⚠️ Please enter your WPScan API key to enable scanning
          </p>
        )}
      </div>
    </div>
  );
};

export default WpscanSettings;


