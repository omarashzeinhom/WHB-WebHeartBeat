// hooks/useCloudSync.ts
import { CloudSyncController } from '../controllers/CloudSyncController';
import { Website } from '../models/website';

export const useCloudSync = (websites: Website[]) => {
  const syncToCloud = async (cloudProvider: string) => {
    if (!cloudProvider) {
      throw new Error('No cloud provider selected');
    }

    if (!CloudSyncController.validateCloudProvider(cloudProvider)) {
      throw new Error('Invalid cloud provider');
    }

    try {
      await CloudSyncController.syncToCloud(websites, cloudProvider);
      console.log("Cloud sync completed successfully");
    } catch (error) {
      console.error("Cloud sync failed:", error);
      throw error;
    }
  };

  return { syncToCloud };
};