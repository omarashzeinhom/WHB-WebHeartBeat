// hooks/useWebsites.ts
import { useState, useCallback } from 'react';
import { Website } from '../models/website';
import { WebsiteController } from '../controllers/websiteController';
import { AppStateController } from '../controllers/AppStateController';

export const useWebsites = (appStateController: AppStateController) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWebsites = useCallback(async () => {
    setLoading(true);
    try {
      const loadedWebsites = await WebsiteController.loadWebsites();
      setWebsites(loadedWebsites);
      appStateController.updateWebsites(loadedWebsites);
      return loadedWebsites;
    } catch (error) {
      console.error('Failed to load websites:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [appStateController]);

  const saveWebsites = useCallback(async (websitesToSave: Website[]) => {
    try {
      await WebsiteController.saveWebsites(websitesToSave);
      setWebsites(websitesToSave);
      appStateController.updateWebsites(websitesToSave);
    } catch (error) {
      console.error('Failed to save websites:', error);
      throw error;
    }
  }, [appStateController]);

  const addWebsite = useCallback(async (url: string) => {
    const newWebsite = WebsiteController.createWebsite(url);
    const updatedWebsites = [...websites, newWebsite];
    await saveWebsites(updatedWebsites);
    return newWebsite;
  }, [websites, saveWebsites]);

  const checkWebsite = useCallback(async (website: Website) => {
    try {
      const updatedWebsite = await WebsiteController.checkWebsite(website);
      const updatedWebsites = websites.map(w => 
        w.id === website.id ? updatedWebsite : w
      );
      await saveWebsites(updatedWebsites);
      return updatedWebsite;
    } catch (error) {
      console.error('Error checking website:', error);
      throw error;
    }
  }, [websites, saveWebsites]);

  const checkAllWebsites = useCallback(async () => {
    setLoading(true);
    try {
      const updatedWebsites = [];
      for (const website of websites) {
        try {
          const updatedWebsite = await WebsiteController.checkWebsite(website);
          updatedWebsites.push(updatedWebsite);
        } catch (error) {
          console.error(`Error checking website ${website.name}:`, error);
          updatedWebsites.push(website); // Keep the original if check fails
        }
      }
      await saveWebsites(updatedWebsites);
      return updatedWebsites;
    } finally {
      setLoading(false);
    }
  }, [websites, saveWebsites]);

  const takeScreenshot = useCallback(async (website: Website) => {
    try {
      const result = await WebsiteController.takeScreenshot(website);
      const updatedWebsite = { ...website, screenshot: result.screenshot };
      const updatedWebsites = websites.map(w => 
        w.id === website.id ? updatedWebsite : w
      );
      await saveWebsites(updatedWebsites);
      return updatedWebsite;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      throw error;
    }
  }, [websites, saveWebsites]);

  const takeBulkScreenshots = useCallback(async () => {
    try {
      await WebsiteController.takeBulkScreenshots();
      // Reload websites to get updated screenshots
      await loadWebsites();
    } catch (error) {
      console.error('Error taking bulk screenshots:', error);
      throw error;
    }
  }, [loadWebsites]);

  const toggleFavorite = useCallback(async (id: number) => {
    const updatedWebsites = WebsiteController.toggleFavorite(websites, id);
    await saveWebsites(updatedWebsites);
  }, [websites, saveWebsites]);

  const removeWebsite = useCallback(async (id: number) => {
    const updatedWebsites = WebsiteController.removeWebsite(websites, id);
    await saveWebsites(updatedWebsites);
  }, [websites, saveWebsites]);

  const searchWebsites = useCallback((query: string) => {
    return WebsiteController.searchWebsites(websites, query);
  }, [websites]);

  return {
    websites,
    loading,
    loadWebsites,
    saveWebsites,
    addWebsite,
    checkWebsite,
    checkAllWebsites,
    takeScreenshot,
    takeBulkScreenshots,
    toggleFavorite,
    removeWebsite,
    searchWebsites,
  };
};