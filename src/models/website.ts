import { WebVitals } from "./WebVitals";
import { WpscanResult } from "./WpscanResult";


export interface Website {
  id: number;
  url: string;
  name: string;
  vitals: WebVitals | null;
  status: number | null;
  lastChecked: string | null;
  industry: Industry;
  projectStatus: ProjectStatus; // NEW
  favorite: boolean;
  screenshot: string | null;
  isProcessing?: boolean;
  isWordPress?: boolean;
  wpscanResult?: WpscanResult | null;
  description?: string;
  tags?: string[];
}

export type ProjectStatus =
  | 'wip'
  | 'building'
  | 'developing'
  | 'designing'
  | 'figma_prototype'
  | 'client_access'
  | 'info_gathering'
  | string; // For custom statuses

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'wip', label: 'WIP', color: '#FF6B35' },
  { value: 'building', label: 'Building', color: '#4ECDC4' },
  { value: 'developing', label: 'Developing', color: '#45B7D1' },
  { value: 'designing', label: 'Designing', color: '#96CEB4' },
  { value: 'figma_prototype', label: 'Figma Prototype', color: '#FECA57' },
  { value: 'client_access', label: 'Client Access', color: '#FF9FF3' },
  { value: 'info_gathering', label: 'Info Gathering', color: '#54A0FF' },
];

export type Industry =
  | 'general'
  | 'ecommerce'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'technology'
  | 'media'
  | 'travel'
  | 'government'
  | 'nonprofit';