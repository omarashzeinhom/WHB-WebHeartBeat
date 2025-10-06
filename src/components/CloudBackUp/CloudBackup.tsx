import React, { useState, useEffect } from 'react';
import { Cloud, Download, Upload, RefreshCw, FolderOpen, LogOut, LogIn, History } from 'lucide-react';
import { TauriService, CloudBackupResult } from '../../services/TauriService';
import { Website } from '../../models/website';
import './CloudBackup.css';

interface CloudBackupProps {
  websites: Website[];
  onRestore: (restoredWebsites: Website[]) => void;
}

const CloudBackup: React.FC<CloudBackupProps> = ({ websites, onRestore }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<CloudBackupResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'waiting' | 'completed'>('idle');
  const [authUrl, setAuthUrl] = useState<string>('');
  const [availableBackups, setAvailableBackups] = useState<any[]>([]);
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
    loadAvailableBackups();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await TauriService.isGoogleDriveAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  const loadAvailableBackups = async () => {
    try {
      const backups = await TauriService.listCloudBackups();
      setAvailableBackups(backups);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const handleGoogleDriveAuth = async () => {
    setIsAuthenticating(true);
    try {
      const result = await TauriService.startGoogleDriveAuth();
      if (result.authUrl) {
        setAuthUrl(result.authUrl);
        setAuthStep('waiting');
        
        // Open the auth URL in default browser
        window.open(result.authUrl, '_blank');
        
        // In a real app, you'd set up a local server to catch the callback
        // For now, we'll use a prompt for the user to paste the code
        setTimeout(() => {
          promptForAuthCode();
        }, 2000);
      }
    } catch (error) {
      alert(`Authentication failed: ${error}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const promptForAuthCode = () => {
    const code = prompt(
      'After authenticating, you will be redirected. Please paste the full URL from your browser address bar:'
    );
    
    if (code) {
      completeAuth(code);
    } else {
      setAuthStep('idle');
    }
  };

  const completeAuth = async (redirectUrl: string) => {
    try {
      // Parse code and state from URL
      const url = new URL(redirectUrl);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (!code || !state) {
        throw new Error('Invalid redirect URL - missing code or state');
      }
      
      const result = await TauriService.completeGoogleDriveAuth(code, state);
      
      if (result.success) {
        setAuthStep('completed');
        setIsAuthenticated(true);
        alert('Successfully connected to Google Drive!');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert(`Failed to complete authentication: ${error}`);
      setAuthStep('idle');
    }
  };

  const handleBackup = async () => {
    if (websites.length === 0) {
      alert('No websites to backup');
      return;
    }

    setIsBackingUp(true);
    try {
      let result: CloudBackupResult;
      
      if (isAuthenticated) {
        result = await TauriService.backupToGoogleDrive(websites);
      } else {
        result = await TauriService.backupLocal(websites);
      }
      
      setLastBackup(result);
      
      if (result.success) {
        alert(`Backup successful! ${result.message}`);
        if (result.driveUrl) {
          // Open the Google Drive URL
          window.open(result.driveUrl, '_blank');
        }
        // Reload available backups
        loadAvailableBackups();
      } else {
        alert(`Backup failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Backup error: ${error}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (backupPath: string) => {
    if (!confirm('This will replace your current websites with the backup. Continue?')) {
      return;
    }

    setIsRestoring(true);
    try {
      const restoredWebsites = await TauriService.restoreFromCloud(backupPath);
      onRestore(restoredWebsites);
      alert(`Successfully restored ${restoredWebsites.length} websites from backup!`);
      setShowRestoreOptions(false);
    } catch (error) {
      alert(`Restore failed: ${error}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const restoredWebsites = JSON.parse(content) as Website[];
        
        if (confirm(`This will restore ${restoredWebsites.length} websites. Continue?`)) {
          onRestore(restoredWebsites);
          alert(`Successfully restored ${restoredWebsites.length} websites!`);
        }
      } catch (error) {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const handleDisconnect = async () => {
    try {
      await TauriService.disconnectGoogleDrive();
      setIsAuthenticated(false);
      setAuthStep('idle');
      alert('Disconnected from Google Drive');
    } catch (error) {
      alert(`Failed to disconnect: ${error}`);
    }
  };

  const handleOpenBackupFolder = async () => {
    try {
      await TauriService.openBackupFolder();
    } catch (error) {
      alert(`Failed to open backup folder: ${error}`);
    }
  };

  const handleExportLocal = () => {
    const dataStr = JSON.stringify(websites, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `website_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  return (
    <div className="cloud-backup">
      <div className="backup-header">
        <Cloud size={20} />
        <h3>Cloud Backup & Restore</h3>
        <div className="auth-status">
          {isAuthenticated ? (
            <span className="status-connected">Connected to Google Drive</span>
          ) : (
            <span className="status-disconnected">Not Connected</span>
          )}
        </div>
      </div>

      <div className="backup-content">
        {/* Authentication Section */}
        <div className="auth-section">
          <h4>Google Drive Connection</h4>
          {!isAuthenticated ? (
            <div className="auth-actions">
              <button 
                className="auth-btn primary"
                onClick={handleGoogleDriveAuth}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? <RefreshCw size={16} className="spinner" /> : <LogIn size={16} />}
                {isAuthenticating ? 'Connecting...' : 'Connect Google Drive'}
              </button>
              
              {authStep === 'waiting' && (
                <div className="auth-instructions">
                  <p>✅ Browser opened! Complete the authentication and paste the redirect URL when prompted.</p>
                  {authUrl && (
                    <details>
                      <summary>Manual Steps</summary>
                      <ol>
                        <li>Click this link: <a href={authUrl} target="_blank" rel="noopener noreferrer">Open Google Auth</a></li>
                        <li>Sign in with your Google account</li>
                        <li>Grant the requested permissions</li>
                        <li>You'll be redirected - copy the full URL from address bar</li>
                        <li>Paste it in the prompt that appears</li>
                      </ol>
                    </details>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <button 
                className="auth-btn secondary"
                onClick={handleDisconnect}
              >
                <LogOut size={16} />
                Disconnect Google Drive
              </button>
              <span className="auth-success">✅ Successfully connected!</span>
            </div>
          )}
        </div>

        {/* Backup Section */}
        <div className="backup-section">
          <div className="backup-stats">
            <p>Websites to backup: <strong>{websites.length}</strong></p>
            {lastBackup && (
              <p className="last-backup">
                Last backup: {new Date(lastBackup.timestamp).toLocaleString()}
                {lastBackup.driveUrl && (
                  <a href={lastBackup.driveUrl} target="_blank" rel="noopener noreferrer">
                    View in Drive
                  </a>
                )}
              </p>
            )}
          </div>

          <div className="backup-actions">
            <button 
              className="backup-btn primary"
              onClick={handleBackup}
              disabled={isBackingUp || websites.length === 0}
            >
              {isBackingUp ? <RefreshCw size={16} className="spinner" /> : <Upload size={16} />}
              {isBackingUp ? 'Backing Up...' : `Backup to ${isAuthenticated ? 'Google Drive' : 'Local'}`}
            </button>

            <button 
              className="backup-btn secondary"
              onClick={handleExportLocal}
              disabled={websites.length === 0}
            >
              <Download size={16} />
              Export Local File
            </button>

            <button 
              className="backup-btn secondary"
              onClick={handleOpenBackupFolder}
            >
              <FolderOpen size={16} />
              Open Backup Folder
            </button>

            <button 
              className="backup-btn secondary"
              onClick={() => setShowRestoreOptions(!showRestoreOptions)}
            >
              <History size={16} />
              Restore Backup
            </button>
          </div>
        </div>

        {/* Restore Section */}
        {showRestoreOptions && (
          <div className="restore-section">
            <h4>Restore from Backup</h4>
            
            <div className="restore-options">
              {/* File Upload */}
              <div className="restore-option">
                <h5>Upload Backup File</h5>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isRestoring}
                />
                <small>Select a previously exported .json backup file</small>
              </div>

              {/* Local Backups */}
              {availableBackups.length > 0 && (
                <div className="restore-option">
                  <h5>Local Backups</h5>
                  <div className="backup-list">
                    {availableBackups.map((backup, index) => (
                      <div key={index} className="backup-item">
                        <div className="backup-info">
                          <strong>{backup.filename}</strong>
                          <span>{backup.size}</span>
                          <span>{backup.modified}</span>
                        </div>
                        <button
                          className="restore-btn"
                          onClick={() => handleRestore(backup.path)}
                          disabled={isRestoring}
                        >
                          {isRestoring ? 'Restoring...' : 'Restore'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableBackups.length === 0 && (
                <p className="no-backups">No local backups found. Create a backup first.</p>
              )}
            </div>
          </div>
        )}

        <div className="backup-info">
          <h4>Backup Options:</h4>
          <ul>
            <li><strong>Google Drive:</strong> Real cloud backup (requires authentication)</li>
            <li><strong>Local Backup:</strong> Saves to ./backups/ folder</li>
            <li><strong>Export:</strong> Download backup file manually</li>
            <li><strong>Restore:</strong> Restore from backup file or local backups</li>
          </ul>
          
          {!isAuthenticated && (
            <div className="google-drive-info">
              <strong>Google Drive Benefits:</strong>
              <ul>
                <li>15GB free storage</li>
                <li>Automatic sync across devices</li>
                <li>Secure cloud storage</li>
                <li>Version history</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudBackup;