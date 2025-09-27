import React from 'react';
import './WebsiteCard.css';
import { Industry, Website } from '../../../../models/website';

// Import SVG icons
import ScreenshotIcon from '../../../../assets/icons/screenshot-icon.svg';
import StatusIcon from '../../../../assets/icons/status-icon.svg';
import DeleteIcon from '../../../../assets/icons/delete-icon.svg';
import OpenLinkIcon from '../../../../assets/icons/open-link-icon.svg';
import FavoriteIcon from '../../../../assets/icons/favorite-icon.svg';
import FavoriteFilledIcon from "../../../../assets/icons/favorite-filled-icon.svg";
import IndustrySelector from '../IndustrySelector/IndustrySelector';

interface WebsiteCardProps {
  website: Website;
  onCheck: (id: number) => void;
  onRemove: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onTakeScreenshot: (id: number) => void;
  onIndustryChange: (id: number, industry: Industry) => void;
  loading: boolean;
  screenshotLoading: boolean;
  isProcessing?: boolean;
  onWebsiteClick: (website: Website) => void;
}

// Define industries array with proper typing
const industries: { value: Industry; label: string; icon: string }[] = [
  { value: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'media', label: 'Media', icon: '📰' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'nonprofit', label: 'Non-Profit', icon: '🤝' },
  { value: 'general', label: 'General', icon: '🌍' },
];

const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  onCheck,
  onRemove,
  onToggleFavorite,
  onTakeScreenshot,
  onIndustryChange,
  onWebsiteClick,
  loading,
  screenshotLoading,
}) => {
  const getStatusColor = (status: number | null) => {
    if (status === null) return '#6c757d';
    return status === 200 ? '#28a745' : '#dc3545';
  };

  const handleIndustryChange = (industry: Industry) => {
    onIndustryChange(website.id, industry);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('.action-btn') || target.closest('.industry-selector') || target.closest('.favorite-btn')) {
      return;
    }
    onWebsiteClick(website);
  };

  // FIXED: Simplified handleActionClick
  const handleActionClick = (handler: Function) => (e: React.MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  // FIXED: openWebsite now works correctly
  const openWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(website.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`website-card ${website.favorite ? 'favorite' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Screenshot preview */}
      {website.screenshot && (
        <div className="screenshot-preview">
          <img
            src={website.screenshot}
            alt={`Screenshot of ${website.name}`}
            className="website-screenshot"
          />
        </div>
      )}

      {/* Status badge and industry selector */}
      <div className="card-header">
        <div className="status-indicator" style={{ backgroundColor: getStatusColor(website.status) }}>
          Status: {website.status || 'N/A'}
        </div>
        <div className="header-actions">
          <div onClick={(e) => e.stopPropagation()}>
            <IndustrySelector
              currentIndustry={website.industry}
              onIndustryChange={handleIndustryChange}
              compact={true}
            />
          </div>
          <button
            className="favorite-btn"
            onClick={handleActionClick(() => onToggleFavorite(website.id))}
            title={website.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <img
              src={website.favorite ? FavoriteFilledIcon : FavoriteIcon}
              alt={website.favorite ? 'Favorited' : 'Not favorited'}
            />
          </button>
        </div>
      </div>

      {/* Website title */}
      <div className="card-title-section">
        <h3 className="website-title">{website.name}</h3>
        <span className="website-industry-badge">
          {industries.find(ind => ind.value === website.industry)?.icon}
        </span>
      </div>

      {/* Action buttons */}
      <div className="card-actions">
        <button
          className="action-btn"
          onClick={handleActionClick(() => onTakeScreenshot(website.id))}
          disabled={screenshotLoading}
          title="Take Screenshot"
        >
          <img src={ScreenshotIcon} alt="Screenshot" />
          <span>Screenshot</span>
        </button>

        <button
          className="action-btn"
          onClick={handleActionClick(() => onCheck(website.id))}
          disabled={loading}
          title="Check Status"
        >
          <img src={StatusIcon} alt="Status" style={{ filter: `drop-shadow(0 0 8px ${getStatusColor(website.status)}80)` }} />
          <span>Status</span>
        </button>

        <button
          className="action-btn"
          onClick={handleActionClick(() => onRemove(website.id))}
          title="Delete Website"
        >
          <img src={DeleteIcon} alt="Delete" />
          <span>Delete</span>
        </button>

        {/* FIXED: This should now work correctly */}
        <button
          className="action-btn"
          onClick={openWebsite}
          title="Open Website"
        >
          <img src={OpenLinkIcon} alt="Open Link" />
          <span>Open Link</span>
        </button>
      </div>
    </div>
  );
};

export default WebsiteCard;