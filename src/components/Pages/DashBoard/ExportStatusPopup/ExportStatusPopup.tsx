// components/ExportStatusPopup/ExportStatusPopup.tsx
import React from 'react';
import { Website } from '../../../../models/website';
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
        return '💾';
      case 'google drive':
        return '📁';
      case 'dropbox':
        return '☁️';
      case 'onedrive':
        return '📊';
      default:
        return '📄';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return '{}';
      case 'csv':
        return '📊';
      case 'pdf':
        return '📄';
      default:
        return '📁';
    }
  };

  return (
    <div className="export-popup-overlay" onClick={onClose}>
      <div className="export-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="export-popup-header">
          <h2>Export Completed Successfully! 🎉</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="export-stats-grid">
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{successfulExports}</span>
              <span className="stat-label">Websites Exported</span>
            </div>
          </div>

          <div className="stat-card destination">
            <div className="stat-icon">{getDestinationIcon(exportDestination)}</div>
            <div className="stat-info">
              <span className="stat-value">{exportDestination}</span>
              <span className="stat-label">Destination</span>
            </div>
          </div>

          <div className="stat-card format">
            <div className="stat-icon">{getFormatIcon(exportFormat)}</div>
            <div className="stat-info">
              <span className="stat-value">{exportFormat.toUpperCase()}</span>
              <span className="stat-label">Format</span>
            </div>
          </div>

          <div className="stat-card size">
            <div className="stat-icon">📦</div>
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
              <span className="detail-label">Total Websites:</span>
              <span className="detail-value">{totalWebsites}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Successful:</span>
              <span className="detail-value success-text">{successfulExports}</span>
            </div>
            {failedExports > 0 && (
              <div className="detail-item">
                <span className="detail-label">Failed:</span>
                <span className="detail-value error-text">{failedExports}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Export Time:</span>
              <span className="detail-value">{exportTime.toLocaleTimeString()}</span>
            </div>
            <div className="detail-item">
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
          <button 
            className="btn-primary" 
            onClick={() => {
              // Add functionality to open the exported file location
              console.log('Open file location');
            }}
          >
            Open File Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportStatusPopup;