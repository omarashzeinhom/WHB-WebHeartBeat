import { Website } from "../models/website";

export interface TauriCommands {
  get_websites: () => Website[];
  save_websites: (websites: Website[]) => void;
  check_website_status: (url: string) => number | null;
  get_web_vitals: (url: string) => { lcp: number; fid: number; cls: number; fcp: number; ttfb: number };
  take_screenshot: (url: string) => string;
  take_bulk_screenshots: () => void;
  cancel_bulk_screenshots: () => void;
  save_to_cloud: (website: Website, provider: string) => void;
  scan_website: (website: Website, apiKey: string) => any;
  detect_wordpress: (url: string) => boolean;
}