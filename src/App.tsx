import { useState } from "react";
import "./App.css";
import { Website } from "./models/website";
import DashBoard from "./components/Pages/DashBoard/DashBoard";
import { NavigationBar } from "./components";

function App() {
  const [websites, setWebsites] = useState<Website[]>([]);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchResults, setSearchResults] = useState<Website[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'wpscan'>('dashboard');

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
    setActiveTab('dashboard');
  };
  return (
    <main >
      <NavigationBar
        initialTheme={theme}
        onThemeChange={handleThemeChange}
        onSearch={handleSearch}
        searchResults={searchResults}
        onSearchResultClick={handleSearchResultClick}
      />
      <div className="main-container">
        <DashBoard />
      </div>
    </main>
  );
}

export default App;