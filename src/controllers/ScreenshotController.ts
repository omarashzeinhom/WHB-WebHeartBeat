// controllers/ScreenshotController.ts
import { TauriService } from "../services/TauriService";
import { Website } from "../models/website";
import { ScreenshotProgress } from "./AppStateController";
import { listen } from '@tauri-apps/api/event';

export class ScreenshotController {
  private onProgressUpdate: (progress: ScreenshotProgress | null) => void;
  private onComplete: () => void;
  private onError: (error: string) => void;

  constructor(
    onProgressUpdate: (progress: ScreenshotProgress | null) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ) {
    this.onProgressUpdate = onProgressUpdate;
    this.onComplete = onComplete;
    this.onError = onError;
  }

  async setupProgressListener() {
    const unlisten = await listen<ScreenshotProgress>('screenshot-progress', (event) => {
      const progress = event.payload;
      this.onProgressUpdate(progress);

      if (progress.is_complete) {
        this.onComplete();

        // Clear progress after a short delay - this is now valid
        setTimeout(() => {
          this.onProgressUpdate(null); // ✅ Now allowed
        }, 2000);

        // Show completion message
        if (progress.errors.length > 0) {
          console.warn('Some screenshots failed:', progress.errors);
          this.onError(`Screenshots completed with ${progress.errors.length} errors. Check console for details.`);
        } else {
          console.log('All screenshots completed successfully');
        }
      }
    });

    return unlisten;
  }

  async takeSingleScreenshot(website: Website): Promise<Website> {
    try {
      return await TauriService.takeScreenshot(website);
    } catch (error) {
      console.error("Error taking screenshot:", error);
      throw error;
    }
  }

  async takeBulkScreenshots(): Promise<void> {
    try {
      await TauriService.takeBulkScreenshots();
    } catch (error) {
      console.error("Error starting bulk screenshots:", error);
      throw error;
    }
  }

  async cancelBulkScreenshots(): Promise<void> {
    try {
      await TauriService.cancelBulkScreenshots();
    } catch (error) {
      console.error("Error canceling screenshots:", error);
      throw error;
    }
  }
}