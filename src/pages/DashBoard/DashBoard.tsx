import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { listen } from '@tauri-apps/api/event';
import { Cloud } from "lucide-react";
import CloudBackup from "../../components/CloudBackUp/CloudBackup";
import { AppError } from "../../hooks/useErrorHandler";
import { ScreenshotProgress } from "../../models/ScreenshotProgress";
import { ProjectStatus, Website, Industry, PROJECT_STATUSES } from "../../models/website";
import { TauriService } from "../../services/TauriService";
import ExportStatusPopup from "./ExportStatusPopup/ExportStatusPopup";
import IndustryFilter from "./IndustryFilter/IndustryFilter";
import ProjectStatusFilter from "./ProjectStatusFilter/ProjectStatusFilter";
import WebsiteCard from "./WebsiteCard/WebsiteCard";
import WebsiteDetail from "./WebsiteDetail/WebSiteDetail";
import ImportSettingsPopup from "./ImportSettingsPopup/ImportSettingsPopup";

interface CustomStatusStorage {
  customStatuses: { value: ProjectStatus; label: string; color: string }[];
}

function DashBoard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wpscan' | 'backup'>('dashboard');
  const [cloudProvider, setCloudProvider] = useState<string | null>(null);
  const [syncFrequency, setSyncFrequency] = useState<number>(0);
  const [screenshotProgress, setScreenshotProgress] = useState<ScreenshotProgress | null>(null);
  const [errors, setErrors] = useState<AppError[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | 'all'>('all');
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<ProjectStatus | 'all'>('all');
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isImportPopupOpen, setIsImportPopupOpen] = useState(false);
  const [importMode, setImportMode] = useState<'websites' | 'full-backup'>('websites');
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
  const [customStatuses, setCustomStatuses] = useState<{ value: ProjectStatus; label: string; color: string }[]>([]);


  const navigate = useNavigate();

  useEffect(() => {
    loadWebsites();
    loadCustomStatuses(); // Load custom statuses on mount
    setupProgressListener();
  }, []);

  // Auto-save websites when they change
  useEffect(() => {
    if (websites.length > 0) {
      saveWebsites(websites);
    }
  }, [websites]);

  // Auto-save custom statuses when they change
  useEffect(() => {
    if (customStatuses.length > 0) {
      saveCustomStatuses();
    }
  }, [customStatuses]);

  // Load custom statuses from localStorage
  const loadCustomStatuses = () => {
    try {
      const stored = localStorage.getItem('customProjectStatuses');
      if (stored) {
        const parsed: CustomStatusStorage = JSON.parse(stored);
        setCustomStatuses(parsed.customStatuses || []);
      }
    } catch (error) {
      console.error('Failed to load custom statuses:', error);
    }
  };

  // Save custom statuses to localStorage
  const saveCustomStatuses = () => {
    try {
      const storage: CustomStatusStorage = {
        customStatuses: customStatuses
      };
      localStorage.setItem('customProjectStatuses', JSON.stringify(storage));
    } catch (error) {
      console.error('Failed to save custom statuses:', error);
    }
  };

  // Error handling utility
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
      
      // If no websites, prompt user to add one
      if (websitesData.length === 0) {
        addError("No websites found. Add your first website to start monitoring!", "info");
      }
    } catch (error) {
      console.error("Failed to load websites:", error);
      addError("Failed to load websites. Please try again or contact support.", "error");
    }
  };
  
  const saveWebsites = async (websitesToSave: Website[]) => {
    try {
      await TauriService.saveWebsites(websitesToSave);
    } catch (error) {
      console.error("Failed to save websites:", error);
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

  // FIXED: Single screenshot function with proper state management
  const takeScreenshot = async (id: number) => {
    const website = websites.find(w => w.id === id);

    if (!website) {
      return;
    }

    // Set processing state immediately
    setWebsites(websites.map(w =>
      w.id === id ? { ...w, isProcessing: true } : w
    ));

    try {
      const updatedWebsite = await TauriService.takeScreenshot(website);

      // Update with screenshot and clear processing state
      setWebsites(websites.map(w =>
        w.id === id ? { ...updatedWebsite, isProcessing: false } : w
      ));

      addError(`Screenshot taken for ${website.name}`, 'info');
    } catch (error) {
      console.error("Error taking screenshot:", error);
      addError(`Failed to take screenshot: ${website.name}`);

      // Clear processing state on error
      setWebsites(websites.map(w =>
        w.id === id ? { ...w, isProcessing: false } : w
      ));
    }
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

  const handleProjectStatusChange = async (id: number, projectStatus: ProjectStatus) => {
    setWebsites(prevWebsites =>
      prevWebsites.map(website =>
        website.id === id ? { ...website, projectStatus } : website
      )
    );

    try {
      await TauriService.updateWebsiteProjectStatus(id, projectStatus);
    } catch (error) {
      console.error('Failed to update project status:', error);
      addError('Failed to update project status');
    }
  };

  const handleAddCustomStatus = (status: { label: string; color: string }) => {
    const newStatus = {
      value: status.label.toLowerCase().replace(/\s+/g, '_') as ProjectStatus,
      label: status.label,
      color: status.color,
    };
    setCustomStatuses(prev => [...prev, newStatus]);
  };

  const getAllStatuses = () => {
    return [...PROJECT_STATUSES, ...customStatuses];
  };

  const getIndustryFilteredWebsites = (): Website[] => {
    let filtered = websites;
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(website => website.industry === selectedIndustry);
    }
    if (selectedProjectStatus !== 'all') {
      filtered = filtered.filter(website => website.projectStatus === selectedProjectStatus);
    }
    return filtered;
  };

  // FIXED: Export now includes custom statuses
  const handleExport = async () => {
    try {
      const exportData = {
        websites: websites,
        customStatuses: customStatuses,
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'full-backup' // Add type identifier
      };

      const data = JSON.stringify(exportData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update export status to show it's a full backup
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
  const handleWebsiteClick = (website: Website) => {
    setSelectedWebsite(website);
  };

  const handleBackToDashboard = () => {
    setSelectedWebsite(null);
  };

  const handleIndustryChange = async (id: number, industry: Industry) => {
    setWebsites(prevWebsites =>
      prevWebsites.map(website =>
        website.id === id ? { ...website, industry } : website
      )
    );

    try {
      await TauriService.updateWebsiteIndustry(id, industry);
    } catch (error) {
      console.error('Failed to update industry:', error);
      addError('Failed to update industry');
    }
  };

  const navigateToAddWebsite = () => {
    navigate({ to: '/add-website' });
  };

  const handleUpdateWebsite = async (id: number, updates: Partial<Website>) => {
    setWebsites(prevWebsites =>
      prevWebsites.map(website =>
        website.id === id ? { ...website, ...updates } : website
      )
    );

    try {
      const updatedWebsites = websites.map(website =>
        website.id === id ? { ...website, ...updates } : website
      );
      await TauriService.saveWebsites(updatedWebsites);
    } catch (error) {
      console.error('Failed to update website:', error);
      addError('Failed to update website notes');
    }
  };

  const handleRestoreBackup = (restoredWebsites: Website[]) => {
    setWebsites(restoredWebsites);
    saveWebsites(restoredWebsites);
    alert(`Successfully restored ${restoredWebsites.length} websites!`);
  };

  // FIXED: Import now handles custom statuses
  const handleImportComplete = async (importedData: any) => {
    try {
      // Check if importedData contains websites and customStatuses
      if (importedData.websites && Array.isArray(importedData.websites)) {
        setWebsites(importedData.websites);
        await TauriService.saveWebsites(importedData.websites);

        // Import custom statuses if they exist
        if (importedData.customStatuses && Array.isArray(importedData.customStatuses)) {
          setCustomStatuses(importedData.customStatuses);
        }

        alert(`Successfully imported ${importedData.websites.length} websites!`);
      } else {
        // Fallback for old format (just array of websites)
        const updatedWebsites = await TauriService.loadWebsites();
        setWebsites(updatedWebsites);
        alert(`Successfully imported ${updatedWebsites.length} websites!`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      addError('Import failed');
    }
  };

  // Main render function
  const renderContent = () => {
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
          onUpdateWebsite={handleUpdateWebsite}
          screenshotLoading={screenshotLoading}
        />
      );
    }

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
            className={activeTab === "backup" ? "active" : ""}
            onClick={() => setActiveTab("backup")}
          >
            <Cloud size={16} /> Cloud Backup
          </button>
          <button
            className="add-website-tab"
            onClick={navigateToAddWebsite}
          >
            Add Website
          </button>
        </nav>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "backup" && (
          <CloudBackup
            websites={websites}
            onRestore={handleRestoreBackup}
          />
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

        <div className="import-export-actions">
          <button className="scan-btn" onClick={handleExport}>
            Export Full Backup
          </button>
          <button className="scan-btn" onClick={() => {
            setImportMode('websites');
            setIsImportPopupOpen(true);
          }}>
            Import Websites Only
          </button>
          <button className="scan-btn" onClick={() => {
            setImportMode('full-backup');
            setIsImportPopupOpen(true);
          }}>
            Import Full Backup
          </button>
        </div>
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
          <button
            className="scan-btn add-website-btn"
            onClick={navigateToAddWebsite}
          >
            Add Website
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

      <IndustryFilter
        selectedIndustry={selectedIndustry}
        onIndustryChange={setSelectedIndustry}
      />

      <ProjectStatusFilter
        selectedStatus={selectedProjectStatus}
        onStatusChange={setSelectedProjectStatus}
        onAddCustomStatus={handleAddCustomStatus}
      />

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
            onClick={navigateToAddWebsite}
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
              onProjectStatusChange={handleProjectStatusChange}
              loading={loading}
              screenshotLoading={screenshotLoading}
              isProcessing={website.isProcessing || false}
              projectStatuses={getAllStatuses()}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main>
      <div className="main-container">
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

      
        <ImportSettingsPopup
          isOpen={isImportPopupOpen}
          onClose={() => setIsImportPopupOpen(false)}
          mode={importMode}
          onImportComplete={handleImportComplete}
        />
      </div>
    </main>
  );
}

export default DashBoard;