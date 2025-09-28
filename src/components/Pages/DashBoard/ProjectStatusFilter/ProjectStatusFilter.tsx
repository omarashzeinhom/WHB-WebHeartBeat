import React, { useState } from 'react';
import './ProjectStatusFilter.css';
import { PROJECT_STATUSES, ProjectStatus } from '../../../../models/website';

interface ProjectStatusFilterProps {
  selectedStatus: ProjectStatus | 'all';
  onStatusChange: (status: ProjectStatus | 'all') => void;
  onAddCustomStatus?: (status: { label: string; color: string }) => void;
}

const ProjectStatusFilter: React.FC<ProjectStatusFilterProps> = ({
  selectedStatus,
  onStatusChange,
  onAddCustomStatus,
}) => {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customColor, setCustomColor] = useState('#A4A4A4');

  const handleAddCustomStatus = () => {
    if (customLabel.trim() && onAddCustomStatus) {
      onAddCustomStatus({
        label: customLabel.trim(),
        color: customColor,
      });
      setCustomLabel('');
      setIsAddingCustom(false);
    }
  };

  return (
    <div className="project-status-filter">
      <div className="filter-title">Project Status</div>
      <div className="status-buttons">
        <button
          className={`status-btn ${selectedStatus === 'all' ? 'active' : ''}`}
          onClick={() => onStatusChange('all')}
        >
          <span className="status-dot all-dot">•</span>
          All
        </button>
        
        {PROJECT_STATUSES.map((status) => (
          <button
            key={status.value}
            className={`status-btn circle-btn ${selectedStatus === status.value ? 'active' : ''}`}
            onClick={() => onStatusChange(status.value)}
            title={status.label}
          >
            <span 
              className="status-dot"
              style={{ backgroundColor: status.color }}
            />
            <span className="status-label">{status.label}</span>
          </button>
        ))}
        
        {/* Add Custom Status Button */}
        <button
          className="status-btn add-status-btn"
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          title="Add Custom Status"
        >
          <span className="status-dot">+</span>
          Add Status
        </button>
      </div>

      {/* Custom Status Form */}
      {isAddingCustom && (
        <div className="custom-status-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Status label"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="status-input"
            />
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="color-picker"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddCustomStatus} className="add-btn">
              Add
            </button>
            <button onClick={() => setIsAddingCustom(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusFilter;