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
  ExternalLink
} from 'lucide-react';
import { Website } from '../../../models/website';
import './ExportStatusPopup.css';

interface ExportStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  exportedWebsites: Website[];
  exportDestination: string;
  exportFormat: 'json' | 'csv' | 'pdf';
  exportTime: Date;
  totalWebsites: number;
}

const ExportStatusPopup: React.FC<ExportStatusPopupProps> = ({
  isOpen,
  onClose,
  exportedWebsites,
  exportDestination,
  exportFormat,
  exportTime,
  totalWebsites,
}) => {
  if (!isOpen) return null;

  const successfulExports = exportedWebsites.length;
  const failedExports = totalWebsites - successfulExports;
  const exportSize = new Blob([JSON.stringify(exportedWebsites)]).size;

  const getDestinationIcon = (destination: string) => {
    switch (destination.toLowerCase()) {
      case 'local':
        return <Folder size={24} />;
      case 'google drive':
        return <Cloud size={24} />;
      case 'dropbox':
        return <Cloud size={24} />;
      case 'onedrive':
        return <Cloud size={24} />;
      default:
        return <Folder size={24} />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <Code size={24} />;
      case 'csv':
        return <Table size={24} />;
      case 'pdf':
        return <FileText size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  // Cloud icon component since it's not imported above
  const Cloud = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>
  );

  // Code icon component
  const Code = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  );

  // Table icon component
  const Table = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/>
    </svg>
  );

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
              <span className="detail-label">
                <Globe size={16} />
                Total Websites:
              </span>
              <span className="detail-value">{totalWebsites}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <CheckCircle size={16} />
                Successful:
              </span>
              <span className="detail-value success-text">{successfulExports}</span>
            </div>
            {failedExports > 0 && (
              <div className="detail-item">
                <span className="detail-label">
                  <X size={16} />
                  Failed:
                </span>
                <span className="detail-value error-text">{failedExports}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">
                <Clock size={16} />
                Export Time:
              </span>
              <span className="detail-value">{exportTime.toLocaleTimeString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <Calendar size={16} />
                Date:
              </span>
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
          <button 
            className="btn-primary" 
            onClick={() => {
              // Add functionality to open the exported file location
              console.log('Open file location');
            }}
          >
            <ExternalLink size={16} />
            Open File Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportStatusPopup;