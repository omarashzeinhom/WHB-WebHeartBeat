// controllers/AppStateController.ts
import { Website, } from "../models/website";
import { WpscanResult } from "../models/WpscanResult";

export interface AppState {
  websites: Website[];
  loading: boolean;
  screenshotLoading: boolean;
  activeTab: 'dashboard' | 'add' | 'wpscan';
  cloudProvider: string | null;
  syncFrequency: number;
  theme: 'light' | 'dark';
  searchResults: Website[];
  screenshotProgress: ScreenshotProgress | null;
  wpscanApiKey: string;
  wpscanFilter: 'all' | 'wordpress' | 'other';
  wpscanResults: { [websiteId: number]: WpscanResult };
  isWpscanning: boolean;
}

export interface ScreenshotProgress {
  total: number;
  completed: number;
  current_website: string;
  current_id: number;
  is_complete: boolean;
  errors: string[];
}

export class AppStateController {
  private setState: React.Dispatch<React.SetStateAction<AppState>>;

  // Remove the state parameter entirely
  constructor(setState: React.Dispatch<React.SetStateAction<AppState>>) {
    this.setState = setState;
  }

  updateWebsites(websites: Website[]) {
    this.setState(prev => ({ ...prev, websites }));
  }

  setLoading(loading: boolean) {
    this.setState(prev => ({ ...prev, loading }));
  }

  setScreenshotLoading(screenshotLoading: boolean) {
    this.setState(prev => ({ ...prev, screenshotLoading }));
  }

  setActiveTab(activeTab: 'dashboard' | 'add' | 'wpscan') {
    this.setState(prev => ({ ...prev, activeTab }));
  }

  setTheme(theme: 'light' | 'dark') {
    this.setState(prev => ({ ...prev, theme }));
    document.documentElement.setAttribute('data-theme', theme);
  }

  setSearchResults(searchResults: Website[]) {
    this.setState(prev => ({ ...prev, searchResults }));
  }

  setScreenshotProgress(screenshotProgress: ScreenshotProgress | null) {
    this.setState(prev => ({ ...prev, screenshotProgress }));
  }

  setCloudProvider(cloudProvider: string | null) {
    this.setState(prev => ({ ...prev, cloudProvider }));
  }

  setSyncFrequency(syncFrequency: number) {
    this.setState(prev => ({ ...prev, syncFrequency }));
  }

  setWpscanApiKey(wpscanApiKey: string) {
    this.setState(prev => ({ ...prev, wpscanApiKey }));
  }

  setWpscanFilter(wpscanFilter: 'all' | 'wordpress' | 'other') {
    this.setState(prev => ({ ...prev, wpscanFilter }));
  }

  setWpscanResults(wpscanResults: { [websiteId: number]: WpscanResult }) {
    this.setState(prev => ({ ...prev, wpscanResults }));
  }

  setIsWpscanning(isWpscanning: boolean) {
    this.setState(prev => ({ ...prev, isWpscanning }));
  }

  updateWebsiteById(id: number, updates: Partial<Website>) {
    this.setState(prev => ({
      ...prev,
      websites: prev.websites.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  }
}