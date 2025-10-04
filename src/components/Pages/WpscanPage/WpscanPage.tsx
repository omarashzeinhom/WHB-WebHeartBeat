import { useState, useEffect } from "react";
import { Website } from "../../../models/website";
import { TauriService } from "../../../services/TauriService";
import { WpscanResult } from "../../../models/WpscanResult";
import { WpscanResults, WpscanSettings } from "../..";

interface AppError {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

function WpscanPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [wpscanApiKey, setWpscanApiKey] = useState<string>('');
  const [wpscanFilter, setWpscanFilter] = useState<'all' | 'wordpress' | 'other'>('all');
  const [wpscanResults, setWpscanResults] = useState<{ [websiteId: number]: WpscanResult }>({});
  const [isWpscanning, setIsWpscanning] = useState(false);
  const [errors, setErrors] = useState<AppError[]>([]);
  const [scanLimit, setScanLimit] = useState<number>(25);
  const [scansUsed, setScansUsed] = useState<number>(0);
  const [selectedWebsiteIds, setSelectedWebsiteIds] = useState<number[]>([]);

  useEffect(() => {
    loadWebsites();
    loadScanUsage();
  }, []);

  const loadWebsites = async () => {
    try {
      const websitesData = await TauriService.loadWebsites();
      setWebsites(websitesData);
    } catch (error) {
      console.error("Failed to load websites:", error);
      addError("Failed to load websites");
    }
  };

  const loadScanUsage = async () => {
    try {
      // This would come from your backend - for now we'll use localStorage as a simple solution
      const today = new Date().toDateString();
      const storedUsage = localStorage.getItem(`wpscan_usage_${today}`);
      if (storedUsage) {
        setScansUsed(parseInt(storedUsage));
      } else {
        setScansUsed(0);
        localStorage.setItem(`wpscan_usage_${today}`, '0');
      }
    } catch (error) {
      console.error("Failed to load scan usage:", error);
    }
  };

  const addError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const error: AppError = {
      message,
      type,
      timestamp: new Date(),
    };
    setErrors(prev => [...prev, error]);

    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== error));
    }, 5000);
  };

  const getFilteredWebsites = (): Website[] => {
    let filtered = websites;
    
    // Apply WordPress filter
    switch (wpscanFilter) {
      case 'wordpress':
        filtered = filtered.filter(website => website.isWordPress === true);
        break;
      case 'other':
        filtered = filtered.filter(website => website.isWordPress === false);
        break;
      default:
        // 'all' - no filter
        break;
    }

    return filtered;
  };

  const updateScanUsage = (scans: number) => {
    const today = new Date().toDateString();
    const newUsage = scansUsed + scans;
    setScansUsed(newUsage);
    localStorage.setItem(`wpscan_usage_${today}`, newUsage.toString());
  };

  const canScanMore = (numberOfScans: number): boolean => {
    return (scansUsed + numberOfScans) <= scanLimit;
  };

  const handleWebsiteSelection = (websiteId: number) => {
    setSelectedWebsiteIds(prev => {
      if (prev.includes(websiteId)) {
        return prev.filter(id => id !== websiteId);
      } else {
        return [...prev, websiteId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredWebsites = getFilteredWebsites();
    setSelectedWebsiteIds(filteredWebsites.map(website => website.id));
  };

  const handleDeselectAll = () => {
    setSelectedWebsiteIds([]);
  };

  const handleWpscanSelected = async () => {
    if (!wpscanApiKey) {
      addError('Please enter your WPScan API key');
      return;
    }

    if (selectedWebsiteIds.length === 0) {
      addError('Please select at least one website to scan');
      return;
    }

    if (!canScanMore(selectedWebsiteIds.length)) {
      addError(`Daily scan limit exceeded. You can only scan ${scanLimit} websites per day.`);
      return;
    }

    const selectedWebsites = websites.filter(website => 
      selectedWebsiteIds.includes(website.id)
    );

    setIsWpscanning(true);
    try {
      for (const website of selectedWebsites) {
        const result = await TauriService.scanWebsite(website, wpscanApiKey);
        setWpscanResults(prev => ({
          ...prev,
          [website.id]: result
        }));
      }
      updateScanUsage(selectedWebsites.length);
      addError(`Successfully scanned ${selectedWebsites.length} website(s)`, 'info');
    } catch (error) {
      console.error('WPScan error:', error);
      addError('Error scanning websites');
    }
    setIsWpscanning(false);
  };

  const handleWpscanAll = async () => {
    if (!wpscanApiKey) {
      addError('Please enter your WPScan API key');
      return;
    }

    const filteredWebsites = getFilteredWebsites();

    if (filteredWebsites.length === 0) {
      addError('No websites to scan');
      return;
    }

    if (!canScanMore(filteredWebsites.length)) {
      addError(`Daily scan limit exceeded. You can only scan ${scanLimit} websites per day.`);
      return;
    }

    setIsWpscanning(true);
    try {
      for (const website of filteredWebsites) {
        const result = await TauriService.scanWebsite(website, wpscanApiKey);
        setWpscanResults(prev => ({
          ...prev,
          [website.id]: result
        }));
      }
      updateScanUsage(filteredWebsites.length);
      addError(`Successfully scanned ${filteredWebsites.length} website(s)`, 'info');
    } catch (error) {
      console.error('WPScan error:', error);
      addError('Error scanning websites');
    }
    setIsWpscanning(false);
  };

  const getSelectedWebsites = () => {
    return websites.filter(website => selectedWebsiteIds.includes(website.id));
  };

  return (
    <div className="wpscan-page">
      <div className="wpscan-header">
        <h1>WordPress Security Scanner</h1>
        <p>Scan your WordPress websites for security vulnerabilities using WPScan API</p>
        
        {/* Scan Usage Display */}
        <div className="scan-usage">
          <div className="usage-info">
            <span>Daily Scan Usage: </span>
            <strong>{scansUsed} / {scanLimit}</strong>
            <span className="usage-text"> websites scanned today</span>
          </div>
          <div className="usage-bar">
            <div 
              className="usage-progress"
              style={{ 
                width: `${(scansUsed / scanLimit) * 100}%`,
                backgroundColor: scansUsed >= scanLimit ? '#e74c3c' : '#3498db'
              }}
            ></div>
          </div>
          {scansUsed >= scanLimit && (
            <div className="limit-warning">
              ⚠️ Daily scan limit reached. You can scan more websites tomorrow.
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="error-container">
          {errors.map((error, index) => (
            <div key={`${error.timestamp.getTime()}-${index}`} className={`error-message error-${error.type}`}>
              <div className="error-content">
                <span className="error-icon">
                  {error.type === 'error' && '❌'}
                  {error.type === 'warning' && '⚠️'}
                  {error.type === 'info' && 'ℹ️'}
                </span>
                <span className="error-text">{error.message}</span>
                <span className="error-time">
                  {error.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <button
                className="error-close"
                onClick={() => setErrors(prev => prev.filter(e => e !== error))}
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="wpscan-content">
        <WpscanSettings
          onApiKeyChange={setWpscanApiKey}
          onFilterChange={setWpscanFilter}
          onScanSelected={handleWpscanSelected}
          onScanAll={handleWpscanAll}
          websites={getFilteredWebsites()}
          isScanning={isWpscanning}
          selectedWebsiteIds={selectedWebsiteIds}
          onWebsiteSelection={handleWebsiteSelection}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          scanLimit={scanLimit}
          scansUsed={scansUsed}
        />

        <WpscanResults
          results={wpscanResults}
          websites={websites}
        />
      </div>
    </div>
  );
}

export default WpscanPage;