import React from 'react';
import './WebsiteCard.css';
import { Website } from '../../models/website';

// Import SVG icons
import ScreenshotIcon from '../../assets/icons/screenshot-icon.svg';
import StatusIcon from '../../assets/icons/status-icon.svg';
import DeleteIcon from '../../assets/icons/delete-icon.svg';
import OpenLinkIcon from '../../assets/icons/open-link-icon.svg';
import FavoriteIcon from '../../assets/icons/favorite-icon.svg';
import FavoriteFilledIcon from "../../assets/icons/favorite-filled-icon.svg";

interface WebsiteCardProps {
  website: Website;
  onCheck: (id: number) => void;
  onRemove: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onTakeScreenshot: (id: number) => void;
  loading: boolean;
  screenshotLoading: boolean;
  isProcessing?: boolean;
  onWebsiteClick: (website: Website) => void;

}

const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  onCheck,
  onRemove,
  onToggleFavorite,
  onTakeScreenshot,
  onWebsiteClick,
  loading,
  screenshotLoading,
}) => {
  const getStatusColor = (status: number | null) => {
    if (status === null) return '#6c757d'; // Gray for unknown
    return status === 200 ? '#28a745' : '#dc3545'; // Green for up, red for down
  };

  const openWebsite = () => {
    window.open(website.url, '_blank');
  };

  return (
    <div
      className={`website-card ${website.favorite ? 'favorite' : ''}`}
      onClick={() => onWebsiteClick(website)}
      style={{ cursor: 'pointer' }}
    >
      {/* Screenshot preview (if available) */}
      {website.screenshot && (
        <div className="screenshot-preview">
          <img
            src={website.screenshot}
            alt={`Screenshot of ${website.name}`}
            className="website-screenshot"
          />
        </div>
      )}
      {/* Status badge at the top */}
      <div className="card-status-bar">
        <div className="status-indicator" style={{ backgroundColor: getStatusColor(website.status) }}>
          Status: {website.status || 'N/A'}
        </div>
        <button
          className="favorite-btn"
          onClick={() => onToggleFavorite(website.id)}
          title={website.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <img
            src={website.favorite ? FavoriteFilledIcon : FavoriteIcon}
            alt={website.favorite ? 'Favorited' : 'Not favorited'}
          />
        </button>
      </div>


      {/* Website title in the middle */}
      <div className="card-title-section">
        <h3 className="website-title">{website.name}</h3>
      </div>

      {/* Action buttons with icons */}
      <div className="card-actions">
        <button
          className="action-btn"
          onClick={() => onTakeScreenshot(website.id)}
          disabled={screenshotLoading}
          title="Take Screenshot"
        >
          <img src={ScreenshotIcon} alt="Screenshot" />
          <span>Screenshot</span>
        </button>

        <button
          className="action-btn"
          onClick={() => onCheck(website.id)}
          disabled={loading}
          title="Check Status"
        >
          <img src={StatusIcon} alt="Status" style={{ filter: `drop-shadow(0 0 8px ${getStatusColor(website.status)}80)` }} />
          <span>Status</span>
        </button>

        <button
          className="action-btn"
          onClick={() => onRemove(website.id)}
          title="Delete Website"
        >
          <img src={DeleteIcon} alt="Delete" />
          <span>Delete</span>
        </button>

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