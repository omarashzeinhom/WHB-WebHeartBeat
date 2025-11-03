// components/ExportStatusPopup/ExportStatusPopup.tsx
import React from 'react';
import { 
  X, 
  CheckCircle, 
  Folder, 
  FileText, 
  Package, 
  Globe, 
  Calendar,
  Clock,
  ExternalLink,
  Cloud,
  Code,
  Table
} from 'lucide-react';
import { Website } from '../../../models/website';
import { invoke } from '@tauri-apps/api/core';
import './ExportStatusPopup.css';

interface ExportStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  exportedWebsites: Website[];
  exportDestination: string;
  exportFormat: 'json' | 'csv' | 'pdf';
  exportTime: Date;
  totalWebsites: number;
  exportFilePath?: string;
}

const ExportStatusPopup: React.FC<ExportStatusPopupProps> = ({
  isOpen,
  onClose,
  exportedWebsites,
  exportDestination,
  exportFormat,
  exportTime,
  totalWebsites,
  exportFilePath,
}) => {
  const successfulExports = exportedWebsites.length;
  const failedExports = totalWebsites - successfulExports;
  const exportSize = new Blob([JSON.stringify(exportedWebsites)]).size;

  const getDestinationIcon = (destination: string) => {
    const cloudDestinations = ['google drive', 'dropbox', 'onedrive'];
    return cloudDestinations.includes(destination.toLowerCase()) ? 
      <Cloud size={24} /> : <Folder size={24} />;
  };

  const getFormatIcon = (format: string) => {
    const formatIcons = {
      json: <Code size={24} />,
      csv: <Table size={24} />,
      pdf: <FileText size={24} />
    };
    return formatIcons[format as keyof typeof formatIcons] || <FileText size={24} />;
  };

  const handleOpenExportLocation = async () => {
    try {
      if (exportFilePath) {
        // If we have a specific file path, open its containing folder
        await invoke('open_containing_folder', { path: exportFilePath });
      } else {
        // Always open downloads folder for exports
        await invoke('open_downloads_folder');
      }
    } catch (error) {
      console.error('Failed to open file location:', error);
      
      // Fallback: try to get the downloads path and show it
      try {
        const downloadsPath = await invoke('get_downloads_path') as string;
        alert(`Could not open file location automatically. Please navigate to: ${downloadsPath}`);
      } catch (e) {
        alert('Could not open file location. Please check your Downloads folder.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-popup-overlay" onClick={onClose}>
      <div className="export-popup-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="export-popup-header">
          <h2>Export Completed Successfully! 🎉</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="export-stats-grid">
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle size={32} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{successfulExports}</span>
              <span className="stat-label">Websites Exported</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon destination">
              {getDestinationIcon(exportDestination)}
            </div>
            <div className="stat-info">
              <span className="stat-value">{exportDestination}</span>
              <span className="stat-label">Destination</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon format">
              {getFormatIcon(exportFormat)}
            </div>
            <div className="stat-info">
              <span className="stat-value">{exportFormat.toUpperCase()}</span>
              <span className="stat-label">Format</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon size">
              <Package size={32} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{(exportSize / 1024).toFixed(1)}KB</span>
              <span className="stat-label">File Size</span>
            </div>
          </div>
        </div>

        <div className="export-details">
          <h3>Export Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <Globe size={16} />
              <span className="detail-label">Total Websites:</span>
              <span className="detail-value">{totalWebsites}</span>
            </div>
            <div className="detail-item">
              <CheckCircle size={16} />
              <span className="detail-label">Successful:</span>
              <span className="detail-value success-text">{successfulExports}</span>
            </div>
            {failedExports > 0 && (
              <div className="detail-item">
                <X size={16} />
                <span className="detail-label">Failed:</span>
                <span className="detail-value error-text">{failedExports}</span>
              </div>
            )}
            <div className="detail-item">
              <Clock size={16} />
              <span className="detail-label">Export Time:</span>
              <span className="detail-value">{exportTime.toLocaleTimeString()}</span>
            </div>
            <div className="detail-item">
              <Calendar size={16} />
              <span className="detail-label">Date:</span>
              <span className="detail-value">{exportTime.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="exported-websites-list">
          <h3>Exported Websites ({exportedWebsites.length})</h3>
          <div className="websites-scroll-container">
            {exportedWebsites.map((website, index) => (
              <div key={website.id} className="website-export-item">
                <span className="website-number">{index + 1}.</span>
                <span className="website-name">{website.name}</span>
                <span className="website-industry">{website.industry}</span>
                <span className={`website-status ${website.status === 200 ? 'online' : 'offline'}`}>
                  {website.status === 200 ? '🟢' : '🔴'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="export-popup-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handleOpenExportLocation}>
            <ExternalLink size={16} />
            Open Downloads Folder
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ExportStatusPopup;