import { Website } from "../../../../models/website";

interface WpscanSettingsProps {
  onApiKeyChange: (apiKey: string) => void;
  onFilterChange: (filter: 'all' | 'wordpress' | 'other') => void;
  onScanSelected: () => void;
  onScanAll: () => void;
  websites: Website[];
  isScanning: boolean;
  selectedWebsiteIds: number[];
  onWebsiteSelection: (websiteId: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  scanLimit: number;
  scansUsed: number;
}

function WpscanSettings({
  onApiKeyChange,
  onFilterChange,
  onScanSelected,
  onScanAll,
  websites,
  isScanning,
  selectedWebsiteIds,
  onWebsiteSelection,
  onSelectAll,
  onDeselectAll,
  scanLimit,
  scansUsed
}: WpscanSettingsProps) {
  const canScanMore = (numberOfScans: number) => (scansUsed + numberOfScans) <= scanLimit;

  return (
    <div className="wpscan-settings">
      <div className="settings-section">
        <h3>WPScan API Configuration</h3>
        <div className="api-key-input">
          <label htmlFor="wpscan-api-key">WPScan API Key:</label>
          <input
            id="wpscan-api-key"
            type="password"
            placeholder="Enter your WPScan API key"
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Website Selection</h3>
        
        <div className="filter-controls">
          <label>Filter Websites:</label>
          <select onChange={(e) => onFilterChange(e.target.value as 'all' | 'wordpress' | 'other')}>
            <option value="all">All Websites</option>
            <option value="wordpress">WordPress Only</option>
            <option value="other">Non-WordPress</option>
          </select>
        </div>

        <div className="selection-controls">
          <button onClick={onSelectAll} className="btn-secondary">
            Select All ({websites.length})
          </button>
          <button onClick={onDeselectAll} className="btn-secondary">
            Deselect All
          </button>
          <span className="selection-count">
            {selectedWebsiteIds.length} of {websites.length} selected
          </span>
        </div>

        <div className="websites-list">
          {websites.map(website => (
            <div key={website.id} className="website-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={selectedWebsiteIds.includes(website.id)}
                  onChange={() => onWebsiteSelection(website.id)}
                  disabled={!canScanMore(1) && !selectedWebsiteIds.includes(website.id)}
                />
                <span className="website-name">{website.name}</span>
                <span className="website-url">({website.url})</span>
                {website.isWordPress && <span className="wordpress-badge">WordPress</span>}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="scan-controls">
        <button
          onClick={onScanSelected}
          disabled={isScanning || selectedWebsiteIds.length === 0 || !canScanMore(selectedWebsiteIds.length)}
          className="btn-primary"
        >
          {isScanning ? 'Scanning...' : `Scan Selected (${selectedWebsiteIds.length})`}
        </button>
        
        <button
          onClick={onScanAll}
          disabled={isScanning || websites.length === 0 || !canScanMore(websites.length)}
          className="btn-secondary"
        >
          {isScanning ? 'Scanning...' : `Scan All Filtered (${websites.length})`}
        </button>
      </div>
    </div>
  );
}

export default WpscanSettings;