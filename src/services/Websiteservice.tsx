import { Website } from "../models/website";
import { WebVitals } from "../models/WebVitals";

export class WebsiteService {
  private static readonly STORAGE_KEY = 'webHealthWebsites';

  static getWebsites(): Website[] {
    const savedWebsites = localStorage.getItem(this.STORAGE_KEY);
    return savedWebsites ? JSON.parse(savedWebsites) : [];
  }

  static saveWebsites(websites: Website[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(websites));
  }

  static async checkStatus(_url: string): Promise<number> {
    // In a real Tauri app, this would invoke a Rust command
    return Math.random() > 0.1 ? 200 : 404;
  }

  static async getWebVitals(_url: string): Promise<WebVitals> {
    // In a real Tauri app, this would invoke a Rust command
    return {
      lcp: Math.random() * 3000,
      fid: Math.random() * 100,
      cls: Math.random(),
      fcp: Math.random() * 2000,
      ttfb: Math.random() * 600,
    };
  }

  static async saveToBack4App(data: Website): Promise<void> {
    // Implementation using Back4App keys
    console.log("Saving to Back4App:", data);
  }
}