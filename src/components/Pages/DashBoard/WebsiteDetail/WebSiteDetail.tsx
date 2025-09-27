// components/WebsiteDetail/WebsiteDetail.tsx
import React from 'react';
import { Website } from '../../../../models/website';
import './WebsiteDetail.css';

interface WebsiteDetailProps {
  website?: Website | null;
  websiteId?: number;
  onBack: () => void;
  onCheck: (id: number) => void;
  onTakeScreenshot: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onRemove: (id: number) => void;
  loading: boolean;
  screenshotLoading: boolean;
}

const WebsiteDetail: React.FC<WebsiteDetailProps> = ({
  website,
  onBack,
  onCheck,
  onTakeScreenshot,
  onToggleFavorite,
  onRemove,
  loading,
  screenshotLoading,
}) => {
  // Early return if website is not available
  if (!website) {
    return (
      <div className="website-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="detail-content">
          <div className="website-not-found">
            <p>Website not found or loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: number | null) => {
    if (!status) return 'gray';
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'blue';
    if (status >= 400 && status < 500) return 'orange';
    return 'red';
  };

  const getIndustryIcon = (industry: string) => {
    const icons: { [key: string]: string } = {
      ecommerce: '🛒',
      finance: '💰',
      healthcare: '🏥',
      education: '🎓',
      technology: '💻',
      media: '📰',
      travel: '✈️',
      government: '🏛️',
      nonprofit: '🤝',
      general: '🌍',
    };
    return icons[industry] || '🌐';
  };

  return (
    <div className="website-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div className="header-actions">
          <button
            className={`favorite-btn ${website.favorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(website.id)}
            title={website.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {website.favorite ? '★' : '☆'}
          </button>
          <button
            className="remove-btn"
            onClick={() => onRemove(website.id)}
            title="Remove website"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="website-info">
          <div className="website-header">
            <h1>{website.name}</h1>
            <span className={`status status-${getStatusColor(website.status)}`}>
              {website.status || 'Unknown'}
            </span>
          </div>

          <div className="website-url">
            <a href={website.url} target="_blank" rel="noopener noreferrer">
              {website.url}
            </a>
          </div>

          <div className="website-meta">
            <span className="industry-tag">
              {getIndustryIcon(website.industry)} {website.industry}
            </span>
            {website.lastChecked && (
              <span className="last-checked">
                Last checked: {new Date(website.lastChecked).toLocaleString()}
              </span>
            )}
            {website.isWordPress !== undefined && (
              <span className="wordpress-tag">
                {website.isWordPress ? 'WordPress' : 'Non-WordPress'}
              </span>
            )}
          </div>

          {website.tags && website.tags.length > 0 && (
            <div className="website-tags">
              <h3>Tags</h3>
              <div className="tags">
                {website.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="website-actions">
          <button
            className="action-btn primary"
            onClick={() => onCheck(website.id)}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
          <button
            className="action-btn secondary"
            onClick={() => onTakeScreenshot(website.id)}
            disabled={screenshotLoading}
          >
            {screenshotLoading ? 'Capturing...' : 'Take Screenshot'}
          </button>
        </div>

        {website.screenshot && (
          <div className="screenshot-section">
            <h3>Screenshot</h3>
            <div className="screenshot-container">
              <img src={website.screenshot} alt={`Screenshot of ${website.name}`} />
            </div>
          </div>
        )}

        {website.vitals && (
          <div className="vitals-section">
            <h3>Performance Metrics</h3>
            <div className="vitals-grid">
              <div className="vital-item">
                <span className="vital-label">LCP</span>
                <span className="vital-value">{website.vitals.lcp}ms</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">FID</span>
                <span className="vital-value">{website.vitals.fid}ms</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">CLS</span>
                <span className="vital-value">{website.vitals.cls}</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">FCP</span>
                <span className="vital-value">{website.vitals.fcp}ms</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">TTFB</span>
                <span className="vital-value">{website.vitals.ttfb}ms</span>
              </div>
            </div>
          </div>
        )}

        {website.wpscanResult && (
          <div className="security-section">
            <h3>Security Scan Results</h3>
            <div className="scan-summary">
              <div className="scan-item">
                <span>Vulnerabilities:</span>
                <span className={`count ${website.wpscanResult.vulnerabilities.length > 0 ? 'danger' : 'safe'}`}>
                  {website.wpscanResult.vulnerabilities.length}
                </span>
              </div>
              <div className="scan-item">
                <span>Plugins:</span>
                <span className="count">{website.wpscanResult.plugins.length}</span>
              </div>
              <div className="scan-item">
                <span>Themes:</span>
                <span className="count">{website.wpscanResult.themes.length}</span>
              </div>
              <div className="scan-item">
                <span>Users:</span>
                <span className="count">{website.wpscanResult.users.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteDetail;