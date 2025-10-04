// services/TauriService.ts
import { Website } from "../models/website";
import { WpscanResult } from "../models/WpscanResult";
import { invoke } from "@tauri-apps/api/core";

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
      return await invoke('get_websites') as Website[];
    } catch (error) {
      console.error("Failed to load websites:", error);
      throw error;
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
      const result = await invoke('take_screenshot', { url: website.url }) as { screenshot: string };
      return {
        ...website,
        screenshot: result.screenshot
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
}