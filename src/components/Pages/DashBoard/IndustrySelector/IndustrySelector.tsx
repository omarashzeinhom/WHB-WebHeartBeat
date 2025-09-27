// components/IndustrySelector/IndustrySelector.tsx
import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  ShoppingCart,
  DollarSign,
  Heart,
  GraduationCap,
  Monitor,
  Newspaper,
  Plane,
  Building,
  HandHeart,
  Globe,
  Check,
  X
} from 'lucide-react';
import { Industry } from '../../../../models/website';
import './IndustrySelector.css';

interface IndustrySelectorProps {
  currentIndustry: Industry;
  onIndustryChange: (industry: Industry) => void;
  compact?: boolean;
}

const industries: { value: Industry; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
  { value: 'finance', label: 'Finance', icon: DollarSign },
  { value: 'healthcare', label: 'Healthcare', icon: Heart },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'technology', label: 'Technology', icon: Monitor },
  { value: 'media', label: 'Media', icon: Newspaper },
  { value: 'travel', label: 'Travel', icon: Plane },
  { value: 'government', label: 'Government', icon: Building },
  { value: 'nonprofit', label: 'Non-Profit', icon: HandHeart },
  { value: 'general', label: 'General', icon: Globe },
];

const IndustrySelector: React.FC<IndustrySelectorProps> = ({
  currentIndustry,
  onIndustryChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [animate, setAnimate] = useState(false);

  const currentIndustryData = industries.find(ind => ind.value === currentIndustry) || industries[0];

  const filteredIndustries = industries.filter(industry =>
    industry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    industry.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    setAnimate(true);
  };

  const handleIndustrySelect = (industry: Industry, e: React.MouseEvent) => {
    e.stopPropagation();
    onIndustryChange(industry);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClosePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // FIXED: Prevent layout shift by accounting for scrollbar
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
      setSearchTerm('');
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      // FIXED: Always reserve space for scrollbar to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    };
  }, [isOpen]);


const IconComponent = currentIndustryData.icon;

return (
  <div className="industry-selector">
    <button
      className={`industry-selector-btn ${compact ? 'compact' : ''} ${animate ? 'animate' : ''}`}
      onClick={handleButtonClick}
      title={`Change industry: ${currentIndustryData.label}`}
      onAnimationEnd={() => setAnimate(false)}
    >
      <div className="industry-btn-content">
        <IconComponent className="industry-icon" size={18} />
        {!compact && <span className="industry-label">{currentIndustryData.label}</span>}
        <ChevronDown size={16} className="dropdown-arrow" />
      </div>
    </button>

    {isOpen && (
      <div className="industry-selector-overlay" onClick={handleClosePopup}>
        <div className="industry-selector-popup" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header">
            <h3>Select Industry</h3>
            <button className="close-popup-btn" onClick={handleClosePopup}>
              <X size={20} />
            </button>
          </div>

          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search industries..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="industries-list">
            {filteredIndustries.map((industry) => {
              const IndustryIcon = industry.icon;
              const isSelected = currentIndustry === industry.value;

              return (
                <button
                  key={industry.value}
                  className={`industry-option ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => handleIndustrySelect(industry.value, e)}
                >
                  <div className="industry-option-content">
                    <IndustryIcon className="industry-option-icon" size={20} />
                    <span className="industry-option-label">{industry.label}</span>
                  </div>
                  {isSelected && <Check size={16} className="check-icon" />}
                </button>
              );
            })}

            {filteredIndustries.length === 0 && (
              <div className="no-results">
                <span>No industries found for "{searchTerm}"</span>
              </div>
            )}
          </div>

          <div className="popup-footer">
            <span className="industry-count">
              {filteredIndustries.length} of {industries.length} industries
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default IndustrySelector;