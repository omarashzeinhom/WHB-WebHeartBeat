// services/TauriService.ts
import { Website } from "../models/website";
import { WpscanResult } from "../models/WpscanResult";
import { invoke } from "@tauri-apps/api/core";


export interface CloudBackupResult {
  success: boolean;
  message: string;
  backupPath?: string;
  driveUrl?: string;
  timestamp: string;
}

export interface GoogleAuthResult {
  success: boolean;
  message: string;
  authUrl?: string;
}

interface ApiKeys {
  wappalyzer?: string;
  screenshotApi?: string;
  googleDriveClientId?: string;
  googleDriveClientSecret?: string;
}

interface CloudSettings {
  provider: string;
  autoBackup: boolean;
  backupFrequency: number;
  lastBackup?: string;
}

interface AppSettings {
  apiKeys: ApiKeys;
  cloudSettings: CloudSettings;
  theme: 'light' | 'dark' | 'system';
  enableNotifications: boolean;
}

export class TauriService {
  // Add API key validation method
  static async testWpscanApiKey(apiKey: string): Promise<boolean> {
    try {
      return await invoke('test_wpscan_api_key', { apiKey });
    } catch (error) {
      console.error("API key validation failed:", error);
      throw new Error(`Invalid API key: ${error}`);
    }
  }

  static async getWebsites(): Promise<Website[]> {
    return this.loadWebsites();
  }

  static async loadWebsites(): Promise<Website[]> {
    try {
      const websites = await invoke('get_websites') as Website[];
      return websites || [];
    } catch (error) {
      console.error("Failed to load websites:", error);
      return [];
    }
  }

  static async saveWebsites(websites: Website[]): Promise<void> {
    try {
      await invoke('save_websites', { websites });
    } catch (error) {
      console.error("Failed to save websites:", error);
      throw error;
    }
  }

  static async checkWebsiteStatus(url: string): Promise<number | null> {
    try {
      return await invoke('check_website_status', { url }) as number | null;
    } catch (error) {
      console.error("Failed to check website status:", error);
      return null;
    }
  }

  static async getWebVitals(url: string): Promise<{ lcp: number; fid: number; cls: number; fcp: number; ttfb: number }> {
    try {
      return await invoke('get_web_vitals', { url }) as { lcp: number; fid: number; cls: number; fcp: number; ttfb: number };
    } catch (error) {
      console.error("Failed to get web vitals:", error);
      return { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 };
    }
  }

  static async takeScreenshot(website: Website): Promise<Website> {
    try {
      const screenshot = await invoke('take_screenshot', { url: website.url }) as string;
      return {
        ...website,
        screenshot: screenshot, // Direct string, not object
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error taking screenshot:", error);
      throw error;
    }
  }
  static async takeBulkScreenshots(): Promise<void> {
    try {
      await invoke('take_bulk_screenshots');
    } catch (error) {
      console.error("Error taking bulk screenshots:", error);
      throw error;
    }
  }

  static async cancelBulkScreenshots(): Promise<void> {
    try {
      await invoke('cancel_bulk_screenshots');
    } catch (error) {
      console.error("Error canceling bulk screenshots:", error);
      throw error;
    }
  }

  static async saveToCloud(website: Website, provider: string): Promise<void> {
    try {
      await invoke('save_to_cloud', { website, provider });
    } catch (error) {
      console.error("Error saving to cloud:", error);
      throw error;
    }
  }

  // Enhanced WPScan method with better error handling
  static async scanWebsite(website: Website, apiKey: string): Promise<WpscanResult> {
    if (!apiKey?.trim()) {
      throw new Error('WPScan API key is required');
    }

    if (!website?.url?.trim()) {
      throw new Error('Website URL is required');
    }

    // Ensure the website object has all required fields including favorite
    const completeWebsite: Website = {
      ...website,
      favorite: website.favorite !== undefined ? website.favorite : false
    };

    try {
      console.log(`Starting WPScan for: ${website.name} (${website.url})`);

      const result = await invoke('scan_website', { website: completeWebsite, apiKey }) as WpscanResult;

      console.log(`WPScan completed for ${website.name}:`, {
        isWordPress: result.is_wordpress,
        vulnerabilities: result.vulnerabilities.length,
        plugins: result.plugins.length,
        themes: result.themes.length,
        users: result.users.length
      });

      return result;
    } catch (error) {
      console.error('WPScan error:', error);

      // Re-throw with more specific error messages
      const errorMessage = error as string;
      if (errorMessage.includes('Invalid WPScan API key')) {
        throw new Error('Invalid WPScan API key. Please check your API key and try again.');
      } else if (errorMessage.includes('rate limit')) {
        throw new Error('WPScan API rate limit exceeded. Please wait before trying again.');
      } else if (errorMessage.includes('timeout')) {
        throw new Error(`Request timeout while scanning ${website.name}. The website may be slow to respond.`);
      } else {
        throw new Error(`Failed to scan ${website.name}: ${errorMessage}`);
      }
    }
  }

  static async detectWordPress(url: string): Promise<boolean> {
    try {
      return await invoke('detect_wordpress', { url }) as boolean;
    } catch (error) {
      console.error("Error detecting WordPress:", error);
      return false;
    }
  }

  static async updateWebsiteIndustry(id: number, industry: string): Promise<void> {
    try {
      await invoke('update_website_industry', { id, industry });
    } catch (error) {
      console.error('Failed to update website industry:', error);
      throw error;
    }
  }

  static async updateWebsiteProjectStatus(id: number, projectStatus: string): Promise<void> {
    try {
      await invoke('update_website_project_status', { id, projectStatus });
    } catch (error) {
      console.error('Failed to update website project status:', error);
      throw error;
    }
  }

  // Utility method to check website and detect WordPress in one call
  static async checkWebsite(website: Website): Promise<Website> {
    try {
      const [status, vitals, isWordPress] = await Promise.all([
        this.checkWebsiteStatus(website.url),
        this.getWebVitals(website.url),
        this.detectWordPress(website.url)
      ]);

      return {
        ...website,
        status,
        vitals: vitals || { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
        lastChecked: new Date().toISOString(),
        isWordPress,
      };
    } catch (error) {
      console.error('Error checking website:', error);
      return {
        ...website,
        status: null,
        vitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
        lastChecked: new Date().toISOString(),
        isWordPress: false,
      };
    }
  }

  static async startGoogleDriveAuth(): Promise<GoogleAuthResult> {
    try {
      return await invoke('start_google_drive_auth') as GoogleAuthResult;
    } catch (error) {
      console.error("Google Drive auth failed:", error);
      throw new Error(`Google Drive auth failed: ${error}`);
    }
  }

  static async completeGoogleDriveAuth(code: string, state: string): Promise<CloudBackupResult> {
    try {
      return await invoke('complete_google_drive_auth', { code, state }) as CloudBackupResult;
    } catch (error) {
      console.error("Google Drive auth completion failed:", error);
      throw new Error(`Google Drive auth completion failed: ${error}`);
    }
  }

  static async backupToGoogleDrive(websites: Website[]): Promise<CloudBackupResult> {
    try {
      return await invoke('backup_to_google_drive', { websites }) as CloudBackupResult;
    } catch (error) {
      console.error("Google Drive backup failed:", error);
      throw new Error(`Google Drive backup failed: ${error}`);
    }
  }

  static async isGoogleDriveAuthenticated(): Promise<boolean> {
    try {
      return await invoke('is_google_drive_authenticated') as boolean;
    } catch (error) {
      console.error("Failed to check auth status:", error);
      return false;
    }
  }

  static async disconnectGoogleDrive(): Promise<void> {
    try {
      await invoke('disconnect_google_drive');
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw new Error(`Failed to disconnect: ${error}`);
    }
  }

  // Local backup
  static async backupLocal(websites: Website[]): Promise<CloudBackupResult> {
    try {
      return await invoke('backup_local', { websites }) as CloudBackupResult;
    } catch (error) {
      console.error("Local backup failed:", error);
      throw new Error(`Local backup failed: ${error}`);
    }
  }

  static async openBackupFolder(): Promise<void> {
    try {
      await invoke('open_backup_folder');
    } catch (error) {
      console.error("Failed to open backup folder:", error);
      throw new Error(`Failed to open backup folder: ${error}`);
    }
  }
  static async restoreFromCloud(backupPath: string): Promise<Website[]> {
    try {
      return await invoke('restore_from_cloud', { backupPath }) as Website[];
    } catch (error) {
      console.error("Cloud restore failed:", error);
      throw new Error(`Cloud restore failed: ${error}`);
    }
  }

  static async listCloudBackups(): Promise<any[]> {
    try {
      return await invoke('list_cloud_backups') as any[];
    } catch (error) {
      console.error("Failed to list backups:", error);
      throw new Error(`Failed to list backups: ${error}`);
    }
  }



  // Replace the settings methods in TauriService.ts

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      console.log('💾 Saving settings:', settings);
      await invoke('save_settings', { settings });
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  static async loadSettings(): Promise<AppSettings | null> {
    try {
      console.log('📖 Loading settings...');
      const settings = await invoke<AppSettings | null>('load_settings');

      if (settings) {
        console.log('✅ Settings loaded:', settings);

        // Validate the structure
        if (!settings.apiKeys || !settings.cloudSettings) {
          console.error('⚠️ Invalid settings structure, returning null');
          return null;
        }

        return settings;
      } else {
        console.log('ℹ️ No settings found, returning null');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      // Return null instead of throwing to allow graceful fallback
      return null;
    }
  }

  static async getApiKey(keyName: string): Promise<string | null> {
    try {
      console.log(`🔑 Getting API key: ${keyName}`);
      const key = await invoke<string | null>('get_api_key', { keyName });

      if (key) {
        console.log(`✅ API key found for: ${keyName}`);
      } else {
        console.log(`ℹ️ No API key found for: ${keyName}`);
      }

      return key;
    } catch (error) {
      console.error(`❌ Failed to get API key ${keyName}:`, error);
      return null;
    }
  }

  static async deleteAllSettings(): Promise<void> {
    try {
      console.log('🗑️ Deleting all settings...');
      await invoke('delete_all_settings');
      console.log('✅ All settings deleted');
    } catch (error) {
      console.error('❌ Failed to delete settings:', error);
      throw new Error(`Failed to delete settings: ${error}`);
    }
  }

  static async exportSettingsUnencrypted(): Promise<string> {
    try {
      console.log('📤 Exporting settings...');
      const settingsJson = await invoke<string>('export_settings_unencrypted');
      console.log('✅ Settings exported successfully');
      return settingsJson;
    } catch (error) {
      console.error('❌ Failed to export settings:', error);
      throw new Error(`Failed to export settings: ${error}`);
    }
  }

  // Helper method to get default settings
  static getDefaultSettings(): AppSettings {
    return {
      apiKeys: {},
      cloudSettings: {
        provider: 'google-drive',
        autoBackup: false,
        backupFrequency: 24,
      },
      theme: 'system',
      enableNotifications: true,
    };
  }

  // Wappalyzer Integration
  static async analyzeWebsiteTech(url: string): Promise<any> {
    try {
      const apiKey = await this.getApiKey('wappalyzer');

      if (!apiKey) {
        throw new Error('Wappalyzer API key not configured. Please add it in Settings.');
      }

      const response = await fetch(`https://api.wappalyzer.com/lookup/v2/?urls=${encodeURIComponent(url)}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Wappalyzer API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to analyze website technology:', error);
      throw error;
    }
  }

  // Screenshot with API
  // FIXED: Changed parameter from url: string to website: Website
  static async takeScreenshotWithApi(website: Website): Promise<string> {
    try {
      const apiKey = await this.getApiKey('screenshot_api');

      if (!apiKey) {
        // Fallback to local screenshot method
        const result = await this.takeScreenshot(website);
        return result.screenshot || '';
      }

      const response = await fetch(`https://api.screenshotapi.net/screenshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: website.url,
          width: 1280,
          height: 720,
          fullPage: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Screenshot API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.screenshotUrl || data.screenshot;
    } catch (error) {
      console.error('Failed to take screenshot via API:', error);
      // Fallback to local method
      const result = await this.takeScreenshot(website);
      return result.screenshot || '';
    }
  }
  // Google Drive Authentication with stored credentials
  static async startGoogleDriveAuthWithStoredCredentials(): Promise<any> {
    try {
      const clientId = await this.getApiKey('google_drive_client_id');
      const clientSecret = await this.getApiKey('google_drive_client_secret');

      if (!clientId || !clientSecret) {
        throw new Error('Google Drive credentials not configured. Please add them in Settings.');
      }

      return await invoke('start_google_drive_auth', { clientId, clientSecret });
    } catch (error) {
      console.error('Failed to start Google Drive auth:', error);
      throw error;
    }
  }

  // Update cloud settings after backup
  static async updateLastBackupTime(): Promise<void> {
    try {
      const settings = await this.loadSettings();
      if (settings) {
        settings.cloudSettings.lastBackup = new Date().toISOString();
        await this.saveSettings(settings);
      }
    } catch (error) {
      console.error('Failed to update last backup time:', error);
    }
  }




} //* END 



