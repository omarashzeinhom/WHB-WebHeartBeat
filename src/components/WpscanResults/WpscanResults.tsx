import React, { useState } from 'react';
import './WpscanResults.css';
import { WpscanResult, Vulnerability, Plugin, Theme } from '../../models/website';

interface WpscanResultsProps {
  results: { [websiteId: number]: WpscanResult };
  websites: any[];
}

const WpscanResults: React.FC<WpscanResultsProps> = ({ results, websites }) => {
  const [selectedWebsite, setSelectedWebsite] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'vulnerabilities' | 'plugins' | 'themes' | 'users'>('vulnerabilities');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📋';
    }
  };

  const VulnerabilityCard: React.FC<{ vulnerability: Vulnerability }> = ({ vulnerability }) => (
    <div className="vulnerability-card">
      <div className="vulnerability-header">
        <span className="severity-badge" style={{ backgroundColor: getSeverityColor(vulnerability.severity) }}>
          {getSeverityIcon(vulnerability.severity)} {vulnerability.severity.toUpperCase()}
        </span>
        <h4 className="vulnerability-title">{vulnerability.title}</h4>
      </div>
      <p className="vulnerability-description">{vulnerability.description}</p>
      {vulnerability.cve && (
        <div className="cve-info">
          <strong>CVE:</strong> {vulnerability.cve}
        </div>
      )}
      {vulnerability.references.length > 0 && (
        <div className="references">
          <strong>References:</strong>
          <ul>
            {vulnerability.references.map((ref, index) => (
              <li key={index}>
                <a href={ref} target="_blank" rel="noopener noreferrer">
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const PluginCard: React.FC<{ plugin: Plugin }> = ({ plugin }) => (
    <div className="plugin-card">
      <div className="plugin-header">
        <h4 className="plugin-name">{plugin.name}</h4>
        <span className="plugin-version">v{plugin.version}</span>
      </div>
      {plugin.vulnerabilities.length > 0 && (
        <div className="plugin-vulnerabilities">
          <strong>Vulnerabilities ({plugin.vulnerabilities.length}):</strong>
          {plugin.vulnerabilities.map((vuln, index) => (
            <VulnerabilityCard key={index} vulnerability={vuln} />
          ))}
        </div>
      )}
    </div>
  );

  const ThemeCard: React.FC<{ theme: Theme }> = ({ theme }) => (
    <div className="theme-card">
      <div className="theme-header">
        <h4 className="theme-name">{theme.name}</h4>
        <span className="theme-version">v{theme.version}</span>
      </div>
      {theme.vulnerabilities.length > 0 && (
        <div className="theme-vulnerabilities">
          <strong>Vulnerabilities ({theme.vulnerabilities.length}):</strong>
          {theme.vulnerabilities.map((vuln, index) => (
            <VulnerabilityCard key={index} vulnerability={vuln} />
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = (result: WpscanResult) => {
    switch (selectedTab) {
      case 'vulnerabilities':
        return (
          <div className="tab-content">
            {result.vulnerabilities.length === 0 ? (
              <p className="no-results">No vulnerabilities found! 🎉</p>
            ) : (
              <div className="vulnerabilities-list">
                {result.vulnerabilities.map((vuln, index) => (
                  <VulnerabilityCard key={index} vulnerability={vuln} />
                ))}
              </div>
            )}
          </div>
        );
      case 'plugins':
        return (
          <div className="tab-content">
            {result.plugins.length === 0 ? (
              <p className="no-results">No plugins detected</p>
            ) : (
              <div className="plugins-list">
                {result.plugins.map((plugin, index) => (
                  <PluginCard key={index} plugin={plugin} />
                ))}
              </div>
            )}
          </div>
        );
      case 'themes':
        return (
          <div className="tab-content">
            {result.themes.length === 0 ? (
              <p className="no-results">No themes detected</p>
            ) : (
              <div className="themes-list">
                {result.themes.map((theme, index) => (
                  <ThemeCard key={index} theme={theme} />
                ))}
              </div>
            )}
          </div>
        );
      case 'users':
        return (
          <div className="tab-content">
            {result.users.length === 0 ? (
              <p className="no-results">No users detected</p>
            ) : (
              <div className="users-list">
                {result.users.map((user, index) => (
                  <div key={index} className="user-card">
                    <div className="user-info">
                      <strong>ID:</strong> {user.id}
                    </div>
                    <div className="user-info">
                      <strong>Login:</strong> {user.login}
                    </div>
                    <div className="user-info">
                      <strong>Display Name:</strong> {user.displayName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (Object.keys(results).length === 0) {
    return (
      <div className="wpscan-results">
        <h3>Scan Results</h3>
        <div className="no-scans">
          <p>No scans performed yet. Select websites and click scan to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wpscan-results">
      <h3>Scan Results</h3>
      
      <div className="results-layout">
        <div className="websites-list">
          <h4>Scanned Websites</h4>
          {Object.entries(results).map(([websiteId, result]) => {
            const website = websites.find(w => w.id === parseInt(websiteId));
            if (!website) return null;
            
            const totalVulns = result.vulnerabilities.length + 
              result.plugins.reduce((sum, p) => sum + p.vulnerabilities.length, 0) +
              result.themes.reduce((sum, t) => sum + t.vulnerabilities.length, 0);
            
            return (
              <div
                key={websiteId}
                className={`website-result-item ${selectedWebsite === parseInt(websiteId) ? 'selected' : ''}`}
                onClick={() => setSelectedWebsite(parseInt(websiteId))}
              >
                <div className="website-info">
                  <h5>{website.name}</h5>
                  <p className="website-url">{website.url}</p>
                </div>
                <div className="scan-summary">
                  <span className={`wordpress-badge ${result.isWordPress ? 'is-wordpress' : 'not-wordpress'}`}>
                    {result.isWordPress ? 'WordPress' : 'Other'}
                  </span>
                  <span className="vulnerability-count">
                    {totalVulns} vulnerabilities
                  </span>
                  <span className="scan-date">
                    {new Date(result.scanDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedWebsite && results[selectedWebsite] && (
          <div className="result-details">
            <div className="result-header">
              <h4>
                {websites.find(w => w.id === selectedWebsite)?.name} - Scan Details
              </h4>
              <div className="result-tabs">
                <button
                  className={selectedTab === 'vulnerabilities' ? 'active' : ''}
                  onClick={() => setSelectedTab('vulnerabilities')}
                >
                  Vulnerabilities ({results[selectedWebsite].vulnerabilities.length})
                </button>
                <button
                  className={selectedTab === 'plugins' ? 'active' : ''}
                  onClick={() => setSelectedTab('plugins')}
                >
                  Plugins ({results[selectedWebsite].plugins.length})
                </button>
                <button
                  className={selectedTab === 'themes' ? 'active' : ''}
                  onClick={() => setSelectedTab('themes')}
                >
                  Themes ({results[selectedWebsite].themes.length})
                </button>
                <button
                  className={selectedTab === 'users' ? 'active' : ''}
                  onClick={() => setSelectedTab('users')}
                >
                  Users ({results[selectedWebsite].users.length})
                </button>
              </div>
            </div>
            {renderTabContent(results[selectedWebsite])}
          </div>
        )}
      </div>
    </div>
  );
};

export default WpscanResults;
