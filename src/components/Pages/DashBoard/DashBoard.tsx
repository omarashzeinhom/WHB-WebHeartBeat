import { useState, useEffect } from "react";
import { listen } from '@tauri-apps/api/event';
import { Website, WpscanResult, Industry } from "../../../models/website";
import { TauriService } from "../../../services/TauriService";
import AddWebsiteForm from "../../AddWebsiteForm/AddWebsiteForm";
import ExportStatusPopup from "./ExportStatusPopup/ExportStatusPopup";
import IndustryFilter from "./IndustryFilter/IndustryFilter";
import WebsiteCard from "./WebsiteCard/WebsiteCard";
import WebsiteDetail from "./WebsiteDetail/WebSiteDetail";
import WpscanResults from "./WpscanResults/WpscanResults";
import WpscanSettings from "./WpscanSettings/WpscanSettings";

interface ScreenshotProgress {
  total: number;
  completed: number;
  current_website: string;
  current_id: number;
  is_complete: boolean;
  errors: string[];
}

interface AppError {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

function DashBoard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'wpscan'>('dashboard');
  const [cloudProvider, setCloudProvider] = useState<string | null>(null);
  const [syncFrequency, setSyncFrequency] = useState<number>(0);
  const [screenshotProgress, setScreenshotProgress] = useState<ScreenshotProgress | null>(null);
  const [wpscanApiKey, setWpscanApiKey] = useState<string>('');
  const [wpscanFilter, setWpscanFilter] = useState<'all' | 'wordpress' | 'other'>('all');
  const [wpscanResults, setWpscanResults] = useState<{ [websiteId: number]: WpscanResult }>({});
  const [isWpscanning, setIsWpscanning] = useState(false);
  const [errors, setErrors] = useState<AppError[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | 'all'>('all');
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    exportedWebsites: Website[];
    exportDestination: string;
    exportFormat: 'json' | 'csv' | 'pdf';
    exportTime: Date;
  }>({
    exportedWebsites: [],
    exportDestination: 'Local File',
    exportFormat: 'json',
    exportTime: new Date(),
  });


  useEffect(() => {
    loadWebsites();
    setupProgressListener();
  }, []);

  // Auto-save websites when they change
  useEffect(() => {
    if (websites.length > 0) {
      saveWebsites(websites);
    }
  }, [websites]);

  // Error handling utility
  const addError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const error: AppError = {
      message,
      type,
      timestamp: new Date(),
    };
    setErrors(prev => [...prev, error]);

    // Auto-remove errors after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== error));
    }, 5000);
  };

  const setupProgressListener = async () => {
    try {
      const unlisten = await listen<ScreenshotProgress>('screenshot-progress', (event) => {
        const progress = event.payload;
        setScreenshotProgress(progress);

        if (progress.is_complete) {
          loadWebsites();
          setScreenshotLoading(false);

          setTimeout(() => {
            setScreenshotProgress(null);
          }, 2000);

          if (progress.errors.length > 0) {
            console.warn('Some screenshots failed:', progress.errors);
            addError(`Screenshots completed with ${progress.errors.length} errors`);
          } else {
            console.log('All screenshots completed successfully');
          }
        }
      });

      return () => {
        unlisten();
      };
    } catch (error) {
      console.error("Failed to setup screenshot listener:", error);
    }
  };

  const loadWebsites = async () => {
    try {
      const websitesData = await TauriService.loadWebsites();
      setWebsites(websitesData);
    } catch (error) {
      console.error("Failed to load websites:", error);
      addError("Failed to load websites");
    }
  };

  const saveWebsites = async (websitesToSave: Website[]) => {
    try {
      await TauriService.saveWebsites(websitesToSave);
    } catch (error) {
      console.error("Failed to save websites:", error);
    }
  };

  const addWebsite = (url: string, industry: Industry = 'general') => {
    try {
      const websiteData: Website = {
        id: Date.now(),
        url,
        name: new URL(url).hostname,
        vitals: null,
        status: null,
        lastChecked: null,
        industry: industry,
        favorite: false,
        screenshot: null
      };

      setWebsites([...websites, websiteData]);
    } catch (error) {
      console.error("Invalid URL:", error);
      addError("Invalid URL provided");
    }
  };

  const checkWebsite = async (id: number) => {
    setLoading(true);
    const website = websites.find(w => w.id === id);

    if (!website) {
      setLoading(false);
      return;
    }

    try {
      const updatedWebsite = await TauriService.checkWebsite(website);
      const updatedWebsites = websites.map(w =>
        w.id === id ? updatedWebsite : w
      );
      setWebsites(updatedWebsites);
    } catch (error) {
      console.error("Error checking website:", error);
      addError(`Failed to check website: ${website.name}`);
    }

    setLoading(false);
  };

  const takeScreenshot = async (id: number) => {
    setScreenshotLoading(true);
    setWebsites(websites.map(w =>
      w.id === id ? { ...w, isProcessing: true } : w
    ));

    const website = websites.find(w => w.id === id);

    if (!website) {
      setScreenshotLoading(false);
      return;
    }

    try {
      const updatedWebsite = await TauriService.takeScreenshot(website);
      const updatedWebsites = websites.map(w =>
        w.id === id ? { ...updatedWebsite, isProcessing: false } : w
      );
      setWebsites(updatedWebsites);
    } catch (error) {
      console.error("Error taking screenshot:", error);
      addError(`Failed to take screenshot: ${website.name}`);
      setWebsites(websites.map(w =>
        w.id === id ? { ...w, isProcessing: false } : w
      ));
    }

    setScreenshotLoading(false);
  };

  const handleCloudSync = async () => {
    if (!cloudProvider) return;

    try {
      for (const website of websites) {
        await TauriService.saveToCloud(website, cloudProvider);
      }
      console.log("Cloud sync completed");
    } catch (error) {
      console.error("Cloud sync failed:", error);
      addError("Cloud sync failed");
    }
  };

  const checkAllWebsites = async () => {
    setLoading(true);
    const checkPromises = websites.map(async (website) => {
      try {
        const updatedWebsite = await TauriService.checkWebsite(website);
        setWebsites(prev => prev.map(w =>
          w.id === website.id ? updatedWebsite : w
        ));
      } catch (error) {
        console.error(`Error checking website ${website.name}:`, error);
      }
    });

    await Promise.allSettled(checkPromises);
    setLoading(false);
  };

  const takeAllScreenshots = async () => {
    if (websites.length === 0) return;

    setScreenshotLoading(true);

    try {
      await TauriService.takeBulkScreenshots();
    } catch (error) {
      console.error("Error starting bulk screenshots:", error);
      addError("Failed to start bulk screenshots");
      setScreenshotLoading(false);
      setScreenshotProgress(null);
    }
  };

  const cancelScreenshots = async () => {
    try {
      await TauriService.cancelBulkScreenshots();
      setScreenshotLoading(false);
      setScreenshotProgress(null);
    } catch (error) {
      console.error("Error canceling screenshots:", error);
      addError("Failed to cancel screenshots");
    }
  };

  const removeWebsite = (id: number) => {
    setWebsites(websites.filter(w => w.id !== id));
  };

  const toggleFavorite = (id: number) => {
    setWebsites(websites.map(w =>
      w.id === id ? { ...w, favorite: !w.favorite } : w
    ));
  };


  // Fix the typo in getIndustryFilteredWebsites function
  const getIndustryFilteredWebsites = (): Website[] => {
    if (selectedIndustry === 'all') {
      return websites; // Fix: was 'website' but should be 'websites'
    }
    return websites.filter(website => website.industry === selectedIndustry); // Fix: was 'website' but should be 'websites'
  };

  // WPScan handlers - fixed function name
  const getWpscanFilteredWebsites = (filter: 'all' | 'wordpress' | 'other'): Website[] => {
    return websites.filter(website => {
      switch (filter) {
        case 'wordpress':
          return website.isWordPress === true;
        case 'other':
          return website.isWordPress === false;
        default:
          return true;
      }
    });
  };

  const handleWpscanSelected = async () => {
    if (!wpscanApiKey) {
      addError('Please enter your WPScan API key');
      return;
    }

    const filteredWebsites = getWpscanFilteredWebsites(wpscanFilter);

    if (filteredWebsites.length === 0) {
      addError('No websites match the selected filter');
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

    if (websites.length === 0) {
      addError('No websites to scan');
      return;
    }

    setIsWpscanning(true);
    try {
      for (const website of websites) {
        const result = await TauriService.scanWebsite(website, wpscanApiKey);
        setWpscanResults(prev => ({
          ...prev,
          [website.id]: result
        }));
      }
    } catch (error) {
      console.error('WPScan error:', error);
      addError('Error scanning websites');
    }
    setIsWpscanning(false);
  };
  // Update your handleExport function
  const handleExport = async () => {
    try {
      const data = JSON.stringify(websites, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website_settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show export status popup
      setExportStatus({
        exportedWebsites: websites,
        exportDestination: 'Local File',
        exportFormat: 'json',
        exportTime: new Date(),
      });
      setIsExportPopupOpen(true);

    } catch (error) {
      console.error('Export failed:', error);
      addError('Export failed');
    }
  };

  /**
   * 
   * @param website   // Add cloud export function
    const handleCloudExport = async (provider: string) => {
      try {
        // Your cloud export logic here
        setExportStatus({
          exportedWebsites: websites,
          exportDestination: provider,
          exportFormat: 'json',
          exportTime: new Date(),
        });
        setIsExportPopupOpen(true);
      } catch (error) {
        console.error('Cloud export failed:', error);
        addError(`Failed to export to ${provider}`);
      }
    };
   */
  // Handle website card click to show detail view
  const handleWebsiteClick = (website: Website) => {
    setSelectedWebsite(website);
  };

  // Handle back from detail view
  const handleBackToDashboard = () => {
    setSelectedWebsite(null);
  };


  // In your App component, add the industry change handler
  // Fix the handleIndustryChange function in App.tsx
  const handleIndustryChange = async (id: number, industry: Industry) => {
    // Update frontend state immediately
    setWebsites(prevWebsites =>
      prevWebsites.map(website =>
        website.id === id ? { ...website, industry } : website
      )
    );

    // Also update in backend
    try {
      await TauriService.updateWebsiteIndustry(id, industry);
    } catch (error) {
      console.error('Failed to update industry:', error);
      addError('Failed to update industry');
    }
  };

  // Main render function with proper conditional rendering
  const renderContent = () => {
    // If a website is selected, show the detail view
    if (selectedWebsite) {
      return (
        <WebsiteDetail
          website={selectedWebsite}
          onBack={handleBackToDashboard}
          onCheck={checkWebsite}
          onTakeScreenshot={takeScreenshot}
          onToggleFavorite={toggleFavorite}
          onRemove={removeWebsite}
          loading={loading}
          screenshotLoading={screenshotLoading}
        />
      );
    }

    // Otherwise, show the regular tabbed interface
    return (
      <>
        <nav className="tabs">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeTab === "add" ? "active" : ""}
            onClick={() => setActiveTab("add")}
          >
            Add Website
          </button>
          <button
            className={activeTab === "wpscan" ? "active" : ""}
            onClick={() => setActiveTab("wpscan")}
          >
            Scan Website
          </button>
        </nav>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "add" && renderAddWebsite()}
        {activeTab === "wpscan" && renderWpscan()}

        <div className="cloud-sync-options">
          <h3>Cloud Sync</h3>

          <select
            value={cloudProvider || ''}
            onChange={(e) => setCloudProvider(e.target.value || null)}
          >
            <option value="">None</option>
            <option value="google-drive">Google Drive</option>
            <option value="dropbox">Dropbox</option>
            <option value="one-drive">OneDrive</option>
          </select>

          {cloudProvider && (
            <div>
              <label>Sync Frequency:</label>
              <select
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(Number(e.target.value))}
              >
                <option value={0}>Manual</option>
                <option value={1}>Every hour</option>
                <option value={24}>Daily</option>
                <option value={168}>Weekly</option>
              </select>

              <button className="scan-btn" onClick={handleCloudSync}>
                Sync Now
              </button>
            </div>
          )}
        </div>

        <button className="scan-btn" onClick={handleExport}>Export Settings</button>
      </>
    );
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Website Monitoring</h2>

        <div className="actions">
          <button
            className="scan-btn"
            onClick={checkAllWebsites}
            disabled={loading || websites.length === 0 || screenshotProgress !== null}
          >
            {loading ? "Checking..." : "Check All Websites"}
          </button>
          <button
            className="scan-btn screenshot-btn"
            onClick={takeAllScreenshots}
            disabled={screenshotLoading || websites.length === 0 || loading}
          >
            {screenshotLoading ? "Capturing..." : "Screenshot All"}
          </button>
          {screenshotProgress && !screenshotProgress.is_complete && (
            <button
              className="scan-btn cancel-btn"
              onClick={cancelScreenshots}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Industry Filter */}
      <IndustryFilter
        selectedIndustry={selectedIndustry}
        onIndustryChange={setSelectedIndustry}
      />

      {/* Progress Indicator */}
      {screenshotProgress && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-header">
              <h3>Taking Screenshots...</h3>
              <span className="progress-counter">
                {screenshotProgress.completed} of {screenshotProgress.total} completed
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${(screenshotProgress.completed / screenshotProgress.total) * 100}%`
                }}
              ></div>
            </div>
            {screenshotProgress.current_website && !screenshotProgress.is_complete && (
              <div className="current-item">
                Currently processing: <strong>{screenshotProgress.current_website}</strong>
              </div>
            )}
            {screenshotProgress.is_complete && (
              <div className="completion-message">
                ✅ All screenshots completed!
                {screenshotProgress.errors.length > 0 && (
                  <span className="error-count">
                    ({screenshotProgress.errors.length} errors)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {websites.length === 0 ? (
        <div className="empty-state">
          <p>No websites added yet. Add your first website to monitor.</p>
          <button
            className="scan-btn"
            onClick={() => setActiveTab("add")}
          >
            Add Website
          </button>
        </div>
      ) : (
        <div className="results-grid">
          {getIndustryFilteredWebsites().map(website => (
            <WebsiteCard
              key={website.id}
              website={website}
              onCheck={checkWebsite}
              onRemove={removeWebsite}
              onToggleFavorite={toggleFavorite}
              onTakeScreenshot={takeScreenshot}
              onWebsiteClick={handleWebsiteClick}
              onIndustryChange={handleIndustryChange}
              loading={loading}
              screenshotLoading={screenshotLoading}
              isProcessing={website.isProcessing || false}
            />
          ))}
        </div>
      )}

    </div>
  );

  const renderAddWebsite = () => (
    <div className="add-website">
      <h2>Add New Website</h2>
      <AddWebsiteForm onAdd={addWebsite} loading={loading} />

      <div className="industries-info">
        <h3>Industry Categorization</h3>
        <p>
          Categorize your websites by industry to filter and analyze performance
          metrics specific to different sectors.
        </p>
        <ul>
          <li><strong>E-Commerce:</strong> Focus on conversion metrics and page load times</li>
          <li><strong>Finance:</strong> Emphasize security and compliance indicators</li>
          <li><strong>Healthcare:</strong> Prioritize accessibility and reliability</li>
          <li><strong>Education:</strong> Focus on content delivery and engagement</li>
          <li><strong>Technology:</strong> Monitor advanced performance metrics</li>
        </ul>
      </div>
    </div>
  );

  const renderWpscan = () => (
    <div className="wpscan-section">
      <h2>Website Security Scanner</h2>
      <p>Scan your websites for security vulnerabilities using WPScan API</p>

      <div className="wpscan-content">
        <WpscanSettings
          onApiKeyChange={setWpscanApiKey}
          onFilterChange={setWpscanFilter}
          onScanSelected={handleWpscanSelected}
          onScanAll={handleWpscanAll}
          websites={websites}
          isScanning={isWpscanning}
        />

        <WpscanResults
          results={wpscanResults}
          websites={websites}
        />
      </div>
    </div>
  );

  return (
    <main >
      <div className="main-container">
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
        {renderContent()}
        <ExportStatusPopup
          isOpen={isExportPopupOpen}
          onClose={() => setIsExportPopupOpen(false)}
          exportedWebsites={exportStatus.exportedWebsites}
          exportDestination={exportStatus.exportDestination}
          exportFormat={exportStatus.exportFormat}
          exportTime={exportStatus.exportTime}
          totalWebsites={websites.length}
        />
      </div>

    </main>
  );
}

export default DashBoard;