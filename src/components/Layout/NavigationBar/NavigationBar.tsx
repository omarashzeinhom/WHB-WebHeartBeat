import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import './NavigationBar.css';
import MenuIcon from '../../../assets/icons/menu.svg';
import CloseIcon from '../../../assets/icons/close.svg';
import ThemeToggleIcon from '../../../assets/icons/theme-toggle.svg';
import Logo from '../../../assets/WHB.svg';
import { Website } from '../../../models/website';
import AdvancedWebsiteSearch from '../AdvancedWebsiteSearch/AdvancedWebsiteSearch';

interface NavigationBarProps {
  initialTheme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  websites: Website[]; // Changed from searchResults
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  initialTheme = 'light',
  onThemeChange,
  websites = []
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="navigation-bar">
        <div className="nav-container">
          <div className="nav-left">
            <button className="menu-toggle" onClick={toggleMenu} aria-label="Open menu">
              <img src={MenuIcon} alt="Menu" />
            </button>
            <div className="logo">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <img src={Logo} alt="WebHeartbeat" />
              </Link>
            </div>
          </div>

           <div className="nav-center">
            <AdvancedWebsiteSearch
              onWebsiteSelect={(website) => {
                // Handle website selection if needed
              }}
            />
          </div>
          <div className="nav-right">
            <nav className="nav-links">
              <a href="#" className="nav-link">Donate</a>
              <a href="#" className="nav-link">Go Pro</a>
              <a href="#" className="nav-link">Contribute</a>
            </nav>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              <img src={ThemeToggleIcon} alt="Toggle theme" />
            </button>
          </div>
        </div>
      </nav>

      {/* Side Menu Overlay */}
      <div className={`side-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <div className="side-menu" onClick={(e) => e.stopPropagation()}>
          <div className="side-menu-header">
            <button className="close-menu" onClick={toggleMenu} aria-label="Close menu">
              <img src={CloseIcon} alt="Close" />
            </button>
          </div>
          <nav className="side-nav-links">
            <Link to="/" className="side-nav-link" onClick={toggleMenu}>Dashboard</Link>
            <Link to="/add-website" className="side-nav-link" onClick={toggleMenu}>Add New Website</Link>
            <Link to="/wpscan" className="side-nav-link" onClick={toggleMenu}>Security Scan</Link>
            <Link to="/settings" className="side-nav-link" onClick={toggleMenu}>Settings</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;