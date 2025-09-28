// services/TauriService.ts
import { invoke } from "@tauri-apps/api/core";
import { WebsiteController } from "../controllers/websiteController";
import { Industry, ProjectStatus, Website } from "../models/website";

export class TauriService {
  static async loadWebsites(): Promise<Website[]> {
    return WebsiteController.getWebsites();
  }

  static async saveWebsites(websites: Website[]): Promise<void> {
    return WebsiteController.saveWebsites(websites);
  }

  static async checkWebsite(website: Website): Promise<Website> {
    try {
      const [status, vitals] = await Promise.all([
        WebsiteController.checkWebsiteStatus(website.url),
        WebsiteController.getWebVitals(website.url)
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

  static async takeScreenshot(website: Website): Promise<Website> {
    try {
      const result = await WebsiteController.takeScreenshot(website);
      return {
        ...website,
        screenshot: result.screenshot,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return {
        ...website,
        screenshot: null,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  // Other methods remain the same...
  static async takeBulkScreenshots(): Promise<void> {
    return WebsiteController.takeBulkScreenshots();
  }

  static async cancelBulkScreenshots(): Promise<void> {
    return WebsiteController.cancelBulkScreenshots();
  }

  static async saveToCloud(website: Website, provider: string): Promise<void> {
    return WebsiteController.saveToCloud(website, provider);
  }

  static async scanWebsite(website: Website, apiKey: string): Promise<any> {
    return WebsiteController.scanWebsite(website, apiKey);
  }

  static async detectWordPress(url: string): Promise<boolean> {
    return WebsiteController.detectWordPress(url);
  }

  static async updateWebsiteIndustry(id: number, industry: Industry): Promise<void> {
    try {
      await invoke('update_website_industry', { id, industry });
    } catch (error) {
      console.error("Failed to update website industry:", error);
      throw error;
    }
  }

  static async updateWebsiteProjectStatus(id: number, projectStatus: ProjectStatus): Promise<void> {
    try {
      await invoke('update_website_project_status', { id, projectStatus });
    } catch (error) {
      console.error("Failed to update website project status:", error);
      throw error;
    }
  }



  
}

