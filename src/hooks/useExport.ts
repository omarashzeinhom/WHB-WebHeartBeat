// hooks/useExport.ts
import { ExportController } from '../controllers/ExportController';
import { Website } from '../models/website';

export const useExport = (websites: Website[]) => {
  const exportWebsites = async () => {
    try {
      await ExportController.exportWebsites(websites);
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const importWebsites = async (file: File): Promise<Website[]> => {
    try {
      return await ExportController.importWebsites(file);
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  };

  return { exportWebsites, importWebsites };
};