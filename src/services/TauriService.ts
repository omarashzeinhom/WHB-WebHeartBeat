// services/TauriService.ts
import { WebsiteController } from "../controllers/websiteController";
import { Website } from "../models/website";

export class TauriService {
  static async loadWebsites(): Promise<Website[]> {
    return WebsiteController.getWebsites();
  }

  static async saveWebsites(websites: Website[]): Promise<void> {
    return WebsiteController.saveWebsites(websites);
  }

  static async checkWebsite(website: Website): Promise<Website> {
    const status = await WebsiteController.checkWebsiteStatus(website.url);
    const vitals = await WebsiteController.getWebVitals(website.url);

    return {
      ...website,
      status,
      vitals: {
        lcp: vitals.lcp || 0,
        fid: vitals.fid || 0,
        cls: vitals.cls || 0,
        fcp: vitals.fcp || 0,
        ttfb: vitals.ttfb || 0
      },
      lastChecked: new Date().toISOString(),
    };
  }

  static async takeScreenshot(website: Website): Promise<Website> {
    const screenshot = await WebsiteController.takeScreenshot(website.url);
    return {
      ...website,
      screenshot,
      lastChecked: new Date().toISOString(),
    };
  }

  // New method for bulk screenshots
  static async takeBulkScreenshots(): Promise<void> {
    return WebsiteController.takeBulkScreenshots();
  }

  // New method to cancel bulk screenshots
  static async cancelBulkScreenshots(): Promise<void> {
    return WebsiteController.cancelBulkScreenshots();
  }

  static async saveToCloud(website: Website, provider: string): Promise<void> {
    return WebsiteController.saveToCloud(website, provider);
  }
}