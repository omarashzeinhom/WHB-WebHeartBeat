// controllers/websiteController.ts
import { invoke } from "@tauri-apps/api/core";
import { Website } from "../models/website";

export class WebsiteController {
  static async getWebsites(): Promise<Website[]> {
    try {
      return await invoke('get_websites');
    } catch (error) {
      console.error('Error getting websites:', error);
      return [];
    }
  }

  static async saveWebsites(websites: Website[]): Promise<void> {
    try {
      await invoke('save_websites', { websites });
    } catch (error) {
      console.error('Error saving websites:', error);
    }
  }

  static async exportWebsites(): Promise<string> {
    try {
      return await invoke('export_websites');
    } catch (error) {
      console.error('Error exporting websites:', error);
      throw error;
    }
  }

  static async checkWebsiteStatus(url: string): Promise<number> {
    try {
      return await invoke('check_website_status', { url });
    } catch (error) {
      console.error('Error checking website status:', error);
      return 0;
    }
  }

  static async getWebVitals(url: string): Promise<any> {
    try {
      return await invoke('get_web_vitals', { url });
    } catch (error) {
      console.error('Error getting web vitals:', error);
      return {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0
      };
    }
  }

  static async takeScreenshot(url: string): Promise<string> {
    try {
      return await invoke('take_screenshot', { url });
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return '';
    }
  }

  // New method for bulk screenshots
  static async takeBulkScreenshots(): Promise<void> {
    try {
      await invoke('take_bulk_screenshots');
    } catch (error) {
      console.error('Error taking bulk screenshots:', error);
      throw error;
    }
  }

  // New method to cancel bulk screenshots
  static async cancelBulkScreenshots(): Promise<void> {
    try {
      await invoke('cancel_bulk_screenshots');
    } catch (error) {
      console.error('Error canceling bulk screenshots:', error);
      throw error;
    }
  }

  static async saveToCloud(website: Website, provider: string): Promise<void> {
    try {
      await invoke('save_to_cloud', { website, provider });
    } catch (error) {
      console.error('Error saving to cloud:', error);
      throw error;
    }
  }
}