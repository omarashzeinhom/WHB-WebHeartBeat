import React from 'react';
import './WebsiteCard.css';
import { Industry, Website, ProjectStatus, PROJECT_STATUSES } from '../../../../models/website';
import { FavoriteFilledIcon, FavoriteIcon, ScreenshotIcon, StatusIcon, OpenLinkIcon, DeleteIcon } from '../../../../assets/icons/icons';
import IndustrySelector from '../IndustrySelector/IndustrySelector';

interface WebsiteCardProps {
  website: Website;
  onCheck: (id: number) => void;
  onRemove: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onTakeScreenshot: (id: number) => void;
  onIndustryChange: (id: number, industry: Industry) => void;
  onProjectStatusChange: (id: number, projectStatus: ProjectStatus) => void;
  loading: boolean;
  screenshotLoading: boolean;
  isProcessing?: boolean;
  onWebsiteClick: (website: Website) => void;
  projectStatuses?: { value: ProjectStatus; label: string; color: string }[];
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
  onProjectStatusChange,
  onWebsiteClick,
  loading,
  screenshotLoading,
  projectStatuses = PROJECT_STATUSES,
}) => {
  // HTTP Response Status (completely separate from project status)
  const getStatusColor = (status: number | null) => {
    if (status === null) return '#6c757d';
    return status === 200 ? '#28a745' : '#dc3545';
  };

  // Project Status (completely separate from HTTP status)
  const getProjectStatusInfo = () => {
    const statusInfo = projectStatuses.find(s => s.value === website.projectStatus);
    return statusInfo || { value: website.projectStatus, label: website.projectStatus, color: '#A4A4A4' };
  };

  const projectStatusInfo = getProjectStatusInfo();

  const handleIndustryChange = (industry: Industry) => {
    onIndustryChange(website.id, industry);
  };

  const handleProjectStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onProjectStatusChange(website.id, e.target.value as ProjectStatus);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.action-btn') || 
        target.closest('.industry-selector') || 
        target.closest('.favorite-btn') ||
        target.closest('.project-status-selector')) {
      return;
    }
    onWebsiteClick(website);
  };

  const handleActionClick = (handler: Function) => (e: React.MouseEvent) => {
    e.stopPropagation();
    handler();
  };

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
      {/* Project Status Badge - Top Left */}
      <div 
        className="project-status-badge"
        style={{ backgroundColor: projectStatusInfo.color }}
        title={`Project Status: ${projectStatusInfo.label}`}
      >
        {projectStatusInfo.label}
      </div>

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

      {/* HTTP Status Badge - Top Right */}
      <div className="card-header">
        <div className="http-status-indicator" style={{ backgroundColor: getStatusColor(website.status) }}>
          {website.status || 'N/A'}
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

      {/* Project Status Selector (simple dropdown) */}
      <div className="project-status-section" onClick={(e) => e.stopPropagation()}>
        <select 
          className="project-status-selector"
          value={website.projectStatus}
          onChange={handleProjectStatusChange}
        >
          {projectStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
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
          title="Check HTTP Status"
        >
          <img src={StatusIcon} alt="Status" />
          <span>Check Status</span>
        </button>

        <button
          className="action-btn"
          onClick={handleActionClick(() => onRemove(website.id))}
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