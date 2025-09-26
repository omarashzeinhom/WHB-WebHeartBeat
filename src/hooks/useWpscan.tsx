// hooks/useWpscan.ts
import { AppStateController } from '../controllers/AppStateController';
import { WpscanController } from '../controllers/wspscanController';
import { Website, WpscanResult } from '../models/website';

export const useWpscan = (
  websites: Website[],
  controller: AppStateController,
  wpscanApiKey: string,
  wpscanFilter: 'all' | 'wordpress' | 'other',
  wpscanResults: { [websiteId: number]: WpscanResult },
  _isWpscanning: boolean
) => {
  const validateApiKey = () => {
    if (!wpscanApiKey.trim()) {
      throw new Error('Please enter your WPScan API key');
    }
  };

  const handleWpscanSelected = async () => {
    try {
      validateApiKey();

      const filteredWebsites = WpscanController.getFilteredWebsites(websites, wpscanFilter);

      if (filteredWebsites.length === 0) {
        throw new Error('No websites match the selected filter');
      }

      controller.setIsWpscanning(true);

      const results = await WpscanController.scanMultipleWebsites(
        filteredWebsites,
        wpscanApiKey,
        (website, result) => {
          controller.setWpscanResults({
            ...wpscanResults,
            [website.id]: result
          });
        }
      );
      
      controller.setWpscanResults({ ...wpscanResults, ...results });
    } catch (error) {
      console.error('WPScan error:', error);
      throw error;
    } finally {
      controller.setIsWpscanning(false);
    }
  };

  const handleWpscanAll = async () => {
    try {
      validateApiKey();

      if (websites.length === 0) {
        throw new Error('No websites to scan');
      }

      controller.setIsWpscanning(true);

      const results = await WpscanController.scanMultipleWebsites(
        websites,
        wpscanApiKey,
        (website, result) => {
          controller.setWpscanResults({
            ...wpscanResults,
            [website.id]: result
          });
        }
      );
      
      controller.setWpscanResults({ ...wpscanResults, ...results });
    } catch (error) {
      console.error('WPScan error:', error);
      throw error;
    } finally {
      controller.setIsWpscanning(false);
    }
  };

  return {
    handleWpscanSelected,
    handleWpscanAll,
  };
};