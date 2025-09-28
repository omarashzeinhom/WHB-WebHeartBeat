// controllers/WpscanController.ts
import { Website} from "../models/website";
import { WpscanResult } from "../models/WpscanResult";
import { TauriService } from "../services/TauriService";

export class WpscanController {
  static getFilteredWebsites(websites: Website[], filter: 'all' | 'wordpress' | 'other'): Website[] {
    return websites.filter(website => {
      switch (filter) {
        case 'wordpress':
          return website.isWordPress === true;
        case 'other':
          return website.isWordPress === false;
        default:
          return true;
      }
    });
  }

  static async scanWebsite(website: Website, apiKey: string): Promise<WpscanResult> {
    try {
      return await TauriService.scanWebsite(website, apiKey);
    } catch (error) {
      console.error('WPScan error:', error);
      throw error;
    }
  }

  static async scanMultipleWebsites(
    websites: Website[], 
    apiKey: string,
    onProgress?: (website: Website, result: WpscanResult) => void
  ): Promise<{ [websiteId: number]: WpscanResult }> {
    const results: { [websiteId: number]: WpscanResult } = {};

    for (const website of websites) {
      try {
        const result = await this.scanWebsite(website, apiKey);
        results[website.id] = result;
        
        if (onProgress) {
          onProgress(website, result);
        }
      } catch (error) {
        console.error(`Failed to scan ${website.name}:`, error);
        // Continue with other websites even if one fails
      }
    }

    return results;
  }
}