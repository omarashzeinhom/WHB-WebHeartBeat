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
  projectStatus: ProjectStatus;
  favorite: boolean;
  screenshot: string | null;
  isProcessing?: boolean;
  isWordPress?: boolean;
  wpscanResult?: WpscanResult | null;
  description?: string;
  tags?: string[];
  notes?: WebsiteNotes;
}

export interface WebsiteNotes {
  dnsHistory: DNSRecord[];
  projectAccess: ProjectAccess;
  generalNotes: string;
  security: SecurityNotes;
  report: WebsiteReport;
  lastUpdated: string;
}

export interface DNSRecord {
  type: 'A' | 'MX' | 'TXT' | 'CNAME' | 'NS';
  value: string;
  ttl?: number;
  lastChecked: string;
}

export interface ProjectAccess {
  credentials: Credential[];
  accessNotes: string;
  warningAcknowledged: boolean;
}

export interface Credential {
  service: string;
  username: string;
  password?: string; // Should be encrypted in production
  url: string;
  notes: string;
}

export interface SecurityNotes {
  vulnerabilities: Vulnerability[];
  openPorts: Port[];
  exposedInfo: string;
  securityScanResults: string;
}

export interface Vulnerability {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'fixed' | 'in-progress';
  discovered: string;
}

export interface Port {
  number: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
  risk: 'low' | 'medium' | 'high';
}

export interface WebsiteReport {
  summary: string;
  performance: string;
  security: string;
  recommendations: string;
  generatedDate: string;
}

export type ProjectStatus = 'wip' | 'building' | 'developing' | 'designing' | 'figma_prototype' | 'client_access' | 'info_gathering' | string;

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'wip', label: 'WIP', color: '#FF6B35' },
  { value: 'building', label: 'Building', color: '#4ECDC4' },
  { value: 'developing', label: 'Developing', color: '#45B7D1' },
  { value: 'designing', label: 'Designing', color: '#96CEB4' },
  { value: 'figma_prototype', label: 'Figma Prototype', color: '#FECA57' },
  { value: 'client_access', label: 'Client Access', color: '#FF9FF3' },
  { value: 'info_gathering', label: 'Info Gathering', color: '#54A0FF' },
];

export type Industry = 'general' | 'ecommerce' | 'finance' | 'healthcare' | 'education' | 'technology' | 'media' | 'travel' | 'government' | 'nonprofit';