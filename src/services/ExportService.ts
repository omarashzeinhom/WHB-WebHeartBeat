// src/services/ExportService.ts
import { Website } from '../models/website';

interface ExportOptions {
  format: 'json' | 'full-backup';
  includeNotes: boolean;
  includeCustomStatuses: boolean;
}

interface FullBackup {
  websites: Website[];
  customStatuses: { value: string; label: string; color: string }[];
  exportDate: string;
  version: string;
}

export class ExportService {
  static async downloadExport(
    websites: Website[], 
    options: ExportOptions,
    customStatuses: any[] = []
  ): Promise<void> {
    try {
      let data: string;
      let filename: string;

      if (options.format === 'full-backup') {
        const backup: FullBackup = {
          websites: websites.map(website => this.ensureNotesStructure(website)),
          customStatuses,
          exportDate: new Date().toISOString(),
          version: '1.0'
        };
        data = JSON.stringify(backup, null, 2);
        filename = `website-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        const exportWebsites = options.includeNotes 
          ? websites.map(website => this.ensureNotesStructure(website))
          : websites.map(({ notes, ...website }) => website);
        
        data = JSON.stringify(exportWebsites, null, 2);
        filename = `websites-export-${new Date().toISOString().split('T')[0]}.json`;
      }

      this.downloadFile(data, filename, 'application/json');
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  private static ensureNotesStructure(website: Website): Website {
    if (!website.notes) {
      return {
        ...website,
        notes: {
          dnsHistory: [],
          projectAccess: {
            credentials: [],
            accessNotes: '',
            warningAcknowledged: false
          },
          generalNotes: '',
          security: {
            vulnerabilities: [],
            openPorts: [],
            exposedInfo: '',
            securityScanResults: ''
          },
          report: {
            summary: '',
            performance: '',
            security: '',
            recommendations: '',
            generatedDate: new Date().toISOString()
          },
          lastUpdated: new Date().toISOString()
        }
      };
    }
    return website;
  }

  private static downloadFile(data: string, filename: string, type: string): void {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}