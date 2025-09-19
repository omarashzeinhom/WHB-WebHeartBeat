import { WebVitals } from "./WebVitals";

export interface Website {
  id: number;
  url: string;
  name: string;
  vitals: WebVitals | null;
  status: number | null;
  lastChecked: string | null;
  industry: string;
  favorite: boolean;
  screenshot: string | null;
  isProcessing?: boolean;
}

export type Industry =
  | 'general'
  | 'ecommerce'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'technology';