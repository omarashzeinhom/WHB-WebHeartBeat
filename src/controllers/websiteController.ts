// services/WebsiteController.ts
import { Website } from "../models/website";
import { invoke } from "@tauri-apps/api/core";

export class WebsiteController {
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

  static async takeScreenshot(website: Website): Promise<{ screenshot: string }> {
    try {
      const screenshot = await invoke('take_screenshot', { url: website.url }) as string;
      return { screenshot };
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

  static async scanWebsite(website: Website, apiKey: string): Promise<any> {
    try {
      return await invoke('scan_website', { website, apiKey });
    } catch (error) {
      console.error("Error scanning website:", error);
      throw error;
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

  // Updated createWebsite method with favorite field
  static createWebsite(url: string): Website {
    try {
      return {
        id: Date.now(),
        url,
        name: new URL(url).hostname,
        vitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
        status: null,
        lastChecked: null,
        industry: "general",
        projectStatus: "wip",
        favorite: false, // Add this field
        screenshot: null,
        isWordPress: false
      };
    } catch (error) {
      console.error("Invalid URL:", error);
      throw error;
    }
  }

  static searchWebsites(websites: Website[], query: string): Website[] {
    if (!query.trim()) {
      return [];
    }

    return websites.filter(website =>
      website.name.toLowerCase().includes(query.toLowerCase()) ||
      website.url.toLowerCase().includes(query.toLowerCase())
    );
  }

  static toggleFavorite(websites: Website[], id: number): Website[] {
    return websites.map(w =>
      w.id === id ? { ...w, favorite: !w.favorite } : w
    );
  }

  static removeWebsite(websites: Website[], id: number): Website[] {
    return websites.filter(w => w.id !== id);
  }

  static async exportWebsites(): Promise<string> {
    try {
      const data = await this.loadWebsites();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  static async checkWebsite(website: Website): Promise<Website> {
    try {
      const [status, vitals] = await Promise.all([
        this.checkWebsiteStatus(website.url),
        this.getWebVitals(website.url)
      ]);

      return {
        ...website,
        status,
        vitals: vitals || { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error checking website:', error);
      return {
        ...website,
        status: null,
        vitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
        lastChecked: new Date().toISOString(),
      };
    }
  }
}