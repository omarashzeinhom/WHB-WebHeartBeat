// components/IndustrySelector/IndustrySelector.tsx
import React from 'react';
import { Industry } from '../../models/website';
import './IndustrySelector.css';

interface IndustrySelectorProps {
  currentIndustry: Industry;
  onIndustryChange: (industry: Industry) => void;
  compact?: boolean;
}

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

const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  currentIndustry,
  onIndustryChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentIndustryData = industries.find(ind => ind.value === currentIndustry) || industries[0];

  return (
    <div className="industry-selector">
      <button
        className={`industry-btn ${compact ? 'compact' : ''} ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Change industry: ${currentIndustryData.label}`}
      >
        <span className="industry-icon">{currentIndustryData.icon}</span>
        {!compact && <span className="industry-label">{currentIndustryData.label}</span>}
        <span className="dropdown-arrow">▾</span>
      </button>
      
      {isOpen && (
        <div className="industry-dropdown">
          {industries.map((industry) => (
            <button
              key={industry.value}
              className={`industry-option ${currentIndustry === industry.value ? 'selected' : ''}`}
              onClick={() => {
                onIndustryChange(industry.value);
                setIsOpen(false);
              }}
            >
              <span className="industry-icon">{industry.icon}</span>
              <span className="industry-label">{industry.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndustrySelector;