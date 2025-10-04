export interface WpscanResult {
  vulnerabilities: Vulnerability[];
  plugins: Plugin[];
  themes: Theme[];
  users: User[];
  scan_date: string;
  is_wordpress: boolean;
  url?: string;
  wordpress_version?: string;
}

export interface Plugin {
  name: string;
  version: string | null;
  vulnerabilities: Vulnerability[];
  slug: string;
}

export interface Theme {
  name: string;
  version: string | null;
  vulnerabilities: Vulnerability[];
  slug: string;
}

export interface User {
  id: number;
  login: string;
  display_name: string | null;
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string | null;
  vuln_type: string | null;
  severity: string | null;
  fixed_in: string | null;
  references: string[];
  cve: string | null;
}