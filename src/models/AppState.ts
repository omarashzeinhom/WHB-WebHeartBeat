import { ScreenshotProgress } from "./ScreenshotProgress";
import { Website } from "./website";
import { WpscanResult } from "./WpscanResult";


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
