import { useState, useEffect } from "react";
import "./App.css";
import AddWebsiteForm from "./components/AddWebsiteForm/AddWebsiteForm";
import WebsiteCard from "./components/WebsiteCard/WebsiteCard";
import { TauriService } from "./services/TauriService";
import { Website,/*Industry*/ } from "./models/website";
import { WebsiteController } from "./controllers/websiteController";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import { listen } from '@tauri-apps/api/event';

interface ScreenshotProgress {
  total: number;
  completed: number;
  current_website: string;
  current_id: number;
  is_complete: boolean;
  errors: string[];
}

function App() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  //const [cloudSaving, setCloudSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add'>('dashboard');
  const [cloudProvider, setCloudProvider] = useState<string | null>(null);
  const [syncFrequency, setSyncFrequency] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchResults, setSearchResults] = useState<Website[]>([]);

  // Screenshot progress state
  const [screenshotProgress, setScreenshotProgress] = useState<ScreenshotProgress | null>(null);

  useEffect(() => {
    loadWebsites();
    setupProgressListener();
  }, []);

  const setupProgressListener = async () => {
    // Listen for screenshot progress updates from backend
    const unlisten = await listen<ScreenshotProgress>('screenshot-progress', (event) => {
      const progress = event.payload;
      setScreenshotProgress(progress);

      if (progress.is_complete) {
        // Reload websites to get updated screenshots
        loadWebsites();
        setScreenshotLoading(false);

        // Clear progress after a short delay
        setTimeout(() => {
          setScreenshotProgress(null);
        }, 2000);

        // Show completion message
        if (progress.errors.length > 0) {
          console.warn('Some screenshots failed:', progress.errors);
          alert(`Screenshots completed with ${progress.errors.length} errors. Check console for details.`);
        } else {
          console.log('All screenshots completed successfully');
        }
      }
    });

    // Cleanup listener on component unmount
    return () => {
      unlisten();
    };
  };

  const loadWebsites = async () => {
    try {
      const websitesData = await TauriService.loadWebsites();
      setWebsites(websitesData);
    } catch (error) {
      console.error("Failed to load websites:", error);
    }
  };

  const saveWebsites = async (websitesToSave: Website[]) => {
    try {
      await TauriService.saveWebsites(websitesToSave);
    } catch (error) {
      console.error("Failed to save websites:", error);
    }
  };

  useEffect(() => {
    saveWebsites(websites);
  }, [websites]);

  const addWebsite = (url: string) => {
    try {
      const websiteData: Website = {
        id: Date.now(),
        url,
        name: new URL(url).hostname,
        vitals: null,
        status: null,
        lastChecked: null,
        industry: "general",
        favorite: false,
        screenshot: null
      };

      setWebsites([...websites, websiteData]);
    } catch (error) {
      console.error("Invalid URL:", error);
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
    }

    setLoading(false);
  };

  const takeScreenshot = async (id: number) => {
    setScreenshotLoading(true);
    // Set the specific card as processing
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
      // Reset processing state on error
      setWebsites(websites.map(w =>
        w.id === id ? { ...w, isProcessing: false } : w
      ));
    }

    setScreenshotLoading(false);
  };


  const handleCloudSync = async (websites: Website[]) => {
    if (!cloudProvider) return;

    try {
      for (const website of websites) {
        await TauriService.saveToCloud(website, cloudProvider);
      }
      console.log("Cloud sync completed");
    } catch (error) {
      console.error("Cloud sync failed:", error);
    }
  };

  const checkAllWebsites = async () => {
    setLoading(true);
    for (const website of websites) {
      await checkWebsite(website.id);
    }
    setLoading(false);
  };

  const takeAllScreenshots = async () => {
    if (websites.length === 0) return;

    setScreenshotLoading(true);

    try {
      await TauriService.takeBulkScreenshots();
    } catch (error) {
      console.error("Error starting bulk screenshots:", error);
      alert("Failed to start bulk screenshots. Check console for details.");
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


  const handleExport = async () => {
    try {
      const data = await WebsiteController.exportWebsites();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website_settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = websites.filter(website =>
      website.name.toLowerCase().includes(query.toLowerCase()) ||
      website.url.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
  };

  const handleSearchResultClick = () => {
    setActiveTab('dashboard');
    // You could add highlighting or scrolling to the specific website card here
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <main className="main-container">
      <NavigationBar
        initialTheme={theme}
        onThemeChange={handleThemeChange}
        onSearch={handleSearch}
        searchResults={searchResults}
        onSearchResultClick={handleSearchResultClick}
      />

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
      </nav>

      {activeTab === "dashboard" && (
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

          {/* Backend Progress Indicator */}
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
              {websites.map(website => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  onCheck={checkWebsite}
                  onRemove={removeWebsite}
                  onToggleFavorite={toggleFavorite}
                  onTakeScreenshot={takeScreenshot}
                  loading={loading}
                  screenshotLoading={screenshotLoading}
                  isProcessing={website.isProcessing || false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "add" && (
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
      )}

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
      </div>

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

          <button onClick={() => handleCloudSync(websites)}>
            Sync Now
          </button>
        </div>
      )}

      <button onClick={handleExport}>Export Settings</button>
    </main>
  );
}

export default App;