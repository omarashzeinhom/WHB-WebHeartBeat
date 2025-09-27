import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { Website } from '../models/website'
import { NavigationBar } from '../components';

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [websites] = useState<Website[]>([]); // Remove unused setWebsites
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchResults, setSearchResults] = useState<Website[]>([]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = websites.filter(website =>
      website.name.toLowerCase().includes(query.toLowerCase()) ||
      website.url.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleSearchResultClick = () => {
    // Navigation will be handled by router now
  };

  return (
    <main>
      <NavigationBar
        initialTheme={theme}
        onThemeChange={handleThemeChange}
        onSearch={handleSearch}
        searchResults={searchResults}
        onSearchResultClick={handleSearchResultClick}
      />
      <div className="main-container">
        <Outlet />
      </div>
    </main>
  )
}