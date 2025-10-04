// hooks/useScreenshots.ts
import { useEffect } from 'react';
import { ScreenshotController } from '../controllers/ScreenshotController';
import { AppStateController} from '../controllers/AppStateController';
import { Website } from '../models/website';
import { ScreenshotProgress } from '../models/ScreenshotProgress';

export const useScreenshots = (
  websites: Website[],
  controller: AppStateController,
  _screenshotLoading: boolean,
  _screenshotProgress: ScreenshotProgress | null
) => {
  const screenshotController = new ScreenshotController(
    (progress) => controller.setScreenshotProgress(progress),
    () => {
      // Reload websites when complete
      controller.setScreenshotLoading(false);
    },
    (error) => alert(error)
  );

  useEffect(() => {
    const setupListener = async () => {
      try {
        const unlisten = await screenshotController.setupProgressListener();
        return unlisten;
      } catch (error) {
        console.error("Failed to setup screenshot listener:", error);
      }
    };

    setupListener();
  }, []);

  const takeScreenshot = async (id: number) => {
    const website = websites.find(w => w.id === id);
    if (!website) return;

    controller.setScreenshotLoading(true);
    controller.updateWebsiteById(id, { isProcessing: true });

    try {
      const updatedWebsite = await screenshotController.takeSingleScreenshot(website);
      controller.updateWebsiteById(id, { ...updatedWebsite, isProcessing: false });
    } catch (error) {
      console.error("Error taking screenshot:", error);
      controller.updateWebsiteById(id, { isProcessing: false });
      throw error;
    } finally {
      controller.setScreenshotLoading(false);
    }
  };

  const takeAllScreenshots = async () => {
    if (websites.length === 0) return;

    controller.setScreenshotLoading(true);

    try {
      await screenshotController.takeBulkScreenshots();
    } catch (error) {
      console.error("Error starting bulk screenshots:", error);
      controller.setScreenshotLoading(false);
      controller.setScreenshotProgress(null);
      throw error;
    }
  };

  const cancelScreenshots = async () => {
    try {
      await screenshotController.cancelBulkScreenshots();
      controller.setScreenshotLoading(false);
      controller.setScreenshotProgress(null);
    } catch (error) {
      console.error("Error canceling screenshots:", error);
      throw error;
    }
  };

  return {
    takeScreenshot,
    takeAllScreenshots,
    cancelScreenshots,
  };
};
