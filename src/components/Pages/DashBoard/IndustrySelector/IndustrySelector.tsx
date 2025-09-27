// components/IndustrySelector/IndustrySelector.tsx - FIXED
import React from 'react';
import { Industry } from '../../../../models/website';
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

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleIndustrySelect = (industry: Industry, e: React.MouseEvent) => {
    e.stopPropagation();
    onIndustryChange(industry);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="industry-selector" onClick={(e) => e.stopPropagation()}>
      <button
        className={`industry-btn ${compact ? 'compact' : ''} ${isOpen ? 'open' : ''}`}
        onClick={handleButtonClick}
        title={`Change industry: ${currentIndustryData.label}`}
      >
        <span className="industry-icon">{currentIndustryData.icon}</span>
        {!compact && <span className="industry-label">{currentIndustryData.label}</span>}
        <span className="dropdown-arrow">▾</span>
      </button>
      
      {isOpen && (
        <div className="industry-dropdown" onClick={(e) => e.stopPropagation()}>
          {industries.map((industry) => (
            <button
              key={industry.value}
              className={`industry-option ${currentIndustry === industry.value ? 'selected' : ''}`}
              onClick={(e) => handleIndustrySelect(industry.value, e)}
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