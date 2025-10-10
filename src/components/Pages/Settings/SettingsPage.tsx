import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Cloud, 
  Save, 
  Eye, 
  EyeOff,
  Shield,
  Database,
  RefreshCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import './Settings.css';
import { TauriService } from '../../../services/TauriService';

interface ApiKeys {
  wappalyzer?: string;
  screenshotApi?: string;
  googleDriveClientId?: string;
  googleDriveClientSecret?: string;
}

interface CloudSettings {
  provider: string;
  autoBackup: boolean;
  backupFrequency: number; // in hours
  lastBackup?: string;
}

interface AppSettings {
  apiKeys: ApiKeys;
  cloudSettings: CloudSettings;
  theme: 'light' | 'dark' | 'system';
  enableNotifications: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    apiKeys: {},
    cloudSettings: {
      provider: 'google-drive',
      autoBackup: false,
      backupFrequency: 24,
    },
    theme: 'system',
    enableNotifications: true,
  });

  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const loadedSettings = await TauriService.loadSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      await TauriService.saveSettings(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApiKeyChange = (key: keyof ApiKeys, value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [key]: value,
      },
    }));
  };

  const handleCloudSettingChange = (key: keyof CloudSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      cloudSettings: {
        ...prev.cloudSettings,
        [key]: value,
      },
    }));
  };

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const testGoogleDriveConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await TauriService.isGoogleDriveAuthenticated();
      if (isConnected) {
        alert('Google Drive connection successful!');
      } else {
        alert('Not connected to Google Drive. Please authenticate first.');
      }
    } catch (error) {
      alert(`Connection test failed: ${error}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearApiKey = (key: keyof ApiKeys) => {
    if (confirm(`Are you sure you want to clear the ${key} API key?`)) {
      handleApiKeyChange(key, '');
    }
  };

  if (isLoading) {
    return (
      <div className="settings-page loading">
        <RefreshCw className="spinner" size={32} />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <SettingsIcon size={24} />
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        {/* API Keys Section */}
        <section className="settings-section">
          <div className="section-header">
            <Key size={20} />
            <h2>API Keys</h2>
            <span className="section-badge">Encrypted</span>
          </div>

          <div className="settings-group">
            {/* Wappalyzer API Key */}
            <div className="setting-item">
              <label htmlFor="wappalyzer-key">
                <strong>Wappalyzer API Key</strong>
                <span className="setting-description">
                  For technology stack detection and website analysis
                </span>
              </label>
              <div className="api-key-input-group">
                <input
                  id="wappalyzer-key"
                  type={showApiKeys['wappalyzer'] ? 'text' : 'password'}
                  value={settings.apiKeys.wappalyzer || ''}
                  onChange={(e) => handleApiKeyChange('wappalyzer', e.target.value)}
                  placeholder="Enter Wappalyzer API key"
                  className="api-key-input"
                />
                <button
                  className="toggle-visibility-btn"
                  onClick={() => toggleShowApiKey('wappalyzer')}
                  title={showApiKeys['wappalyzer'] ? 'Hide' : 'Show'}
                >
                  {showApiKeys['wappalyzer'] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {settings.apiKeys.wappalyzer && (
                  <button
                    className="clear-btn"
                    onClick={() => handleClearApiKey('wappalyzer')}
                    title="Clear API key"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <small className="setting-hint">
                Get your API key from{' '}
                <a href="https://www.wappalyzer.com/api" target="_blank" rel="noopener noreferrer">
                  wappalyzer.com/api
                </a>
              </small>
            </div>

            {/* Screenshot API Key */}
            <div className="setting-item">
              <label htmlFor="screenshot-key">
                <strong>Screenshot API Key</strong>
                <span className="setting-description">
                  For capturing website screenshots (optional)
                </span>
              </label>
              <div className="api-key-input-group">
                <input
                  id="screenshot-key"
                  type={showApiKeys['screenshot'] ? 'text' : 'password'}
                  value={settings.apiKeys.screenshotApi || ''}
                  onChange={(e) => handleApiKeyChange('screenshotApi', e.target.value)}
                  placeholder="Enter Screenshot API key"
                  className="api-key-input"
                />
                <button
                  className="toggle-visibility-btn"
                  onClick={() => toggleShowApiKey('screenshot')}
                >
                  {showApiKeys['screenshot'] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {settings.apiKeys.screenshotApi && (
                  <button
                    className="clear-btn"
                    onClick={() => handleClearApiKey('screenshotApi')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Google Drive Credentials */}
            <div className="setting-item">
              <label htmlFor="google-client-id">
                <strong>Google Drive Client ID</strong>
                <span className="setting-description">
                  OAuth 2.0 Client ID for Google Drive integration
                </span>
              </label>
              <div className="api-key-input-group">
                <input
                  id="google-client-id"
                  type={showApiKeys['googleClientId'] ? 'text' : 'password'}
                  value={settings.apiKeys.googleDriveClientId || ''}
                  onChange={(e) => handleApiKeyChange('googleDriveClientId', e.target.value)}
                  placeholder="Enter Google Client ID"
                  className="api-key-input"
                />
                <button
                  className="toggle-visibility-btn"
                  onClick={() => toggleShowApiKey('googleClientId')}
                >
                  {showApiKeys['googleClientId'] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {settings.apiKeys.googleDriveClientId && (
                  <button
                    className="clear-btn"
                    onClick={() => handleClearApiKey('googleDriveClientId')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="google-client-secret">
                <strong>Google Drive Client Secret</strong>
                <span className="setting-description">
                  OAuth 2.0 Client Secret for Google Drive integration
                </span>
              </label>
              <div className="api-key-input-group">
                <input
                  id="google-client-secret"
                  type={showApiKeys['googleClientSecret'] ? 'text' : 'password'}
                  value={settings.apiKeys.googleDriveClientSecret || ''}
                  onChange={(e) => handleApiKeyChange('googleDriveClientSecret', e.target.value)}
                  placeholder="Enter Google Client Secret"
                  className="api-key-input"
                />
                <button
                  className="toggle-visibility-btn"
                  onClick={() => toggleShowApiKey('googleClientSecret')}
                >
                  {showApiKeys['googleClientSecret'] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {settings.apiKeys.googleDriveClientSecret && (
                  <button
                    className="clear-btn"
                    onClick={() => handleClearApiKey('googleDriveClientSecret')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <small className="setting-hint">
                Get credentials from{' '}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                  Google Cloud Console
                </a>
              </small>
            </div>
          </div>

          <div className="security-notice">
            <Shield size={16} />
            <span>All API keys are encrypted and stored securely on your device</span>
          </div>
        </section>

        {/* Cloud Backup Settings */}
        <section className="settings-section">
          <div className="section-header">
            <Cloud size={20} />
            <h2>Cloud Backup Settings</h2>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <label htmlFor="cloud-provider">
                <strong>Cloud Provider</strong>
              </label>
              <select
                id="cloud-provider"
                value={settings.cloudSettings.provider}
                onChange={(e) => handleCloudSettingChange('provider', e.target.value)}
                className="setting-select"
              >
                <option value="google-drive">Google Drive</option>
                <option value="dropbox" disabled>Dropbox (Coming Soon)</option>
                <option value="onedrive" disabled>OneDrive (Coming Soon)</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.cloudSettings.autoBackup}
                  onChange={(e) => handleCloudSettingChange('autoBackup', e.target.checked)}
                />
                <strong>Enable Automatic Backup</strong>
                <span className="setting-description">
                  Automatically backup your data to the cloud
                </span>
              </label>
            </div>

            {settings.cloudSettings.autoBackup && (
              <div className="setting-item">
                <label htmlFor="backup-frequency">
                  <strong>Backup Frequency</strong>
                </label>
                <select
                  id="backup-frequency"
                  value={settings.cloudSettings.backupFrequency}
                  onChange={(e) => handleCloudSettingChange('backupFrequency', Number(e.target.value))}
                  className="setting-select"
                >
                  <option value={1}>Every Hour</option>
                  <option value={6}>Every 6 Hours</option>
                  <option value={12}>Every 12 Hours</option>
                  <option value={24}>Daily</option>
                  <option value={168}>Weekly</option>
                </select>
              </div>
            )}

            {settings.cloudSettings.lastBackup && (
              <div className="setting-item">
                <div className="info-display">
                  <Database size={16} />
                  <span>
                    Last Backup: {new Date(settings.cloudSettings.lastBackup).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <button
              className="test-connection-btn"
              onClick={testGoogleDriveConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <RefreshCw size={16} className="spinner" />
              ) : (
                <Cloud size={16} />
              )}
              Test Google Drive Connection
            </button>
          </div>
        </section>

        {/* General Settings */}
        <section className="settings-section">
          <div className="section-header">
            <SettingsIcon size={20} />
            <h2>General Settings</h2>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <label htmlFor="theme">
                <strong>Theme</strong>
              </label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                className="setting-select"
              >
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                />
                <strong>Enable Notifications</strong>
                <span className="setting-description">
                  Show desktop notifications for important events
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="settings-footer">
          <button
            className={`save-settings-btn ${saveStatus}`}
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw size={18} className="spinner" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check size={18} />
                Saved Successfully!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle size={18} />
                Failed to Save
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;