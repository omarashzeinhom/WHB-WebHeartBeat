// controllers/ExportController.ts
import { Website, WebsiteNotes } from "../models/website";

export class ExportController {
  private static convertNotesToFrontendFormat(notes: any): WebsiteNotes {
    return {
      dnsHistory: notes.dns_history?.map((record: any) => ({
        type: record.record_type,
        value: record.value,
        ttl: record.ttl,
        lastChecked: record.last_checked
      })) || [],

      projectAccess: {
        credentials: notes.project_access?.credentials?.map((cred: any) => ({
          service: cred.service,
          username: cred.username,
          url: cred.url,
          notes: cred.notes,
          type: cred.type || 'general'
        })) || [],
        accessNotes: notes.project_access?.access_notes || '',
        warningAcknowledged: notes.project_access?.warning_acknowledged || false
      },

      generalNotes: notes.general_notes || '',

      security: {
        vulnerabilities: notes.security?.vulnerabilities?.map((vuln: any) => ({
          name: vuln.name,
          severity: vuln.severity,
          description: vuln.description,
          status: vuln.status,
          discovered: vuln.discovered
        })) || [],
        openPorts: notes.security?.open_ports?.map((port: any) => ({
          number: port.number,
          service: port.service,
          status: port.status,
          risk: port.risk
        })) || [],
        exposedInfo: notes.security?.exposed_info || '',
        securityScanResults: notes.security?.security_scan_results || ''
      },

      report: {
        summary: notes.report?.summary || '',
        performance: notes.report?.performance || '',
        security: notes.report?.security || '',
        recommendations: notes.report?.recommendations || '',
        generatedDate: notes.report?.generated_date || new Date().toISOString()
      },

      lastUpdated: notes.last_updated || new Date().toISOString()
    };
  }

  static async exportWebsites(websites: Website[]): Promise<void> {
    try {
      const convertedWebsites = websites.map(website => ({
        ...website,
        notes: website.notes ? this.convertNotesToFrontendFormat(website.notes) : undefined
      }));

      const data = JSON.stringify(convertedWebsites, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website_settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  static async importWebsites(file: File): Promise<Website[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Validate the data structure here
          resolve(data as Website[]);
        } catch (error) {
          reject(new Error('Invalid file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}