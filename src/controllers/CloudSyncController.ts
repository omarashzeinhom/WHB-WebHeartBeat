// controllers/CloudSyncController.ts
import { Website } from "../models/website";
import { TauriService } from "../services/TauriService";

export class CloudSyncController {
  static async syncToCloud(websites: Website[], cloudProvider: string): Promise<void> {
    if (!cloudProvider) return;

    try {
      for (const website of websites) {
        await TauriService.saveToCloud(website, cloudProvider);
      }
      console.log("Cloud sync completed");
    } catch (error) {
      console.error("Cloud sync failed:", error);
      throw error;
    }
  }

  static validateCloudProvider(provider: string): boolean {
    const validProviders = ['google-drive', 'dropbox', 'one-drive'];
    return validProviders.includes(provider);
  }

  static validateSyncFrequency(frequency: number): boolean {
    const validFrequencies = [0, 1, 24, 168]; // Manual, hourly, daily, weekly
    return validFrequencies.includes(frequency);
  }
}