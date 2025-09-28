export interface WpscanResult {
  vulnerabilities: Vulnerability[];
  plugins: Plugin[];
  themes: Theme[];
  users: User[];
  scanDate: string;
  isWordPress: boolean;
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cve?: string;
  references: string[];
}

export interface Plugin {
  name: string;
  version: string;
  vulnerabilities: Vulnerability[];
}

export interface Theme {
  name: string;
  version: string;
  vulnerabilities: Vulnerability[];
}

export interface User {
  id: number;
  login: string;
  displayName: string;
}