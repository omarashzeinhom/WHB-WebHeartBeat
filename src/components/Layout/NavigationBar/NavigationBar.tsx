import React, { useState, useEffect } from 'react';
import './NavigationBar.css';

// Import your SVG assets
import SearchIcon from '../../../assets/icons/search.svg';
import MenuIcon from '../../../assets/icons/menu.svg';
import CloseIcon from '../../../assets/icons/close.svg';
import ThemeToggleIcon from '../../../assets/icons/theme-toggle.svg';
import Logo from '../../../assets/WHB.svg';

// Update NavigationBar.tsx
interface NavigationBarProps {
  initialTheme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onSearch?: (query: string) => void;
  searchResults?: any[];
  onSearchResultClick?: (result: any) => void;
  onNavigate?: (tab: 'dashboard' | 'add' | 'wpscan' | 'settings') => void; // Add this
  activeTab?: string; // Add this to highlight current tab
}


const NavigationBar: React.FC<NavigationBarProps> = ({ 
  initialTheme = 'light', 
  onThemeChange,
  onSearch,
  searchResults = [],
  onSearchResultClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const handleSearchResultClick = (result: any) => {
    onSearchResultClick?.(result);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicks on them
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setShowSearchResults(true);
    }
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
              <img src={Logo} alt="WebHeartbeat" />
            </div>
          </div>

          <div className="nav-center">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-container">
                <img src={SearchIcon} alt="Search" className="search-icon" />
                <input
                  type="text"
                  placeholder="Search Website"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onBlur={handleSearchBlur}
                  onFocus={handleSearchFocus}
                  className="search-input"
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onMouseDown={() => handleSearchResultClick(result)}
                      >
                        {result.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="nav-right">
            <nav className="nav-links">
              <a href="#" className="nav-link">Media</a>
              <a href="#" className="nav-link">Finance</a>
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
            <a href="#" className="side-nav-link">Dashboard</a>
            <a href="#" className="side-nav-link">Websites</a>
            <a href="#" className="side-nav-link">Add New Website</a>
            <a href="#" className="side-nav-link">Analytics</a>
            <a href="#" className="side-nav-link">Settings</a>
            <a href="#" className="side-nav-link">Export</a>
            <a href="#" className="side-nav-link disabled">Import</a>
            <a href="#" className="side-nav-link">Help</a>
          </nav>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;