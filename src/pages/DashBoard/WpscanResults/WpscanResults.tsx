// components/Pages/Dashboard/WpscanResults/WpscanResults.tsx
import React from 'react';
import { Website } from '../../../models/website';
import { WpscanResult, Vulnerability as WpscanVulnerability, Theme, Plugin } from '../../../models/WpscanResult';
import './WpscanResults.css';

interface WpscanResultsProps {
  results: { [websiteId: number]: WpscanResult };
  websites: Website[];
}

// Fix: Use WpscanVulnerability to avoid conflict with Website's Vulnerability
const VulnerabilityItem: React.FC<{ vulnerability: WpscanVulnerability; index: number }> = ({ vulnerability, index }) => {
  // Fix: Handle optional severity and provide fallback
  const severity = vulnerability.severity || 'unknown';
  
  return (
    <div key={index} className="vulnerability-item">
      <span className={`severity-badge severity-${severity.toLowerCase()}`}>
        {severity.toUpperCase()}
      </span>
      <span className="vuln-title">{vulnerability.title}</span>
      {vulnerability.cve && <span className="cve-badge">{vulnerability.cve}</span>}
    </div>
  );
};

// Fix: Use the correct Plugin type from models
const PluginItem: React.FC<{ plugin: Plugin }> = ({ plugin }) => (
  <div className="plugin-item">
    <div className="plugin-header">
      <span className="plugin-name">{plugin.name}</span>
      {plugin.version && <span className="plugin-version">v{plugin.version}</span>}
    </div>
    {/* Fix: Add proper check for vulnerabilities array */}
    {plugin.vulnerabilities && plugin.vulnerabilities.length > 0 && (
      <div className="plugin-vulnerabilities">
        <span className="vuln-count">{plugin.vulnerabilities.length} vulnerabilities</span>
        {plugin.vulnerabilities.map((vuln: WpscanVulnerability, index: number) => (
          <VulnerabilityItem key={index} vulnerability={vuln} index={index} />
        ))}
      </div>
    )}
  </div>
);

// Fix: Use the correct Theme type from models and avoid naming conflict
const ThemeItem: React.FC<{ themeData: Theme }> = ({ themeData }) => (
  <div className="theme-item">
    <div className="theme-header">
      <span className="theme-name">{themeData.name}</span>
      {themeData.version && <span className="theme-version">v{themeData.version}</span>}
    </div>
    {/* Fix: Add proper check for vulnerabilities array */}
    {themeData.vulnerabilities && themeData.vulnerabilities.length > 0 && (
      <div className="theme-vulnerabilities">
        <span className="vuln-count">{themeData.vulnerabilities.length} vulnerabilities</span>
        {themeData.vulnerabilities.map((vuln: WpscanVulnerability, index: number) => (
          <VulnerabilityItem key={index} vulnerability={vuln} index={index} />
        ))}
      </div>
    )}
  </div>
);

const WpscanResults: React.FC<WpscanResultsProps> = ({ results, websites }) => {
  if (Object.keys(results).length === 0) {
    return (
      <div className="wpscan-results">
        <div className="no-results">
          <p>No security scan results available. Run a scan to see vulnerabilities.</p>
        </div>
      </div>
    );
  }

  // Helper function to count vulnerabilities by severity
  const countVulnerabilitiesBySeverity = (vulnerabilities: WpscanVulnerability[], severity: string) => {
    return vulnerabilities.filter(v => (v.severity || '').toLowerCase() === severity.toLowerCase()).length;
  };

  return (
    <div className="wpscan-results">
      <h3>Security Scan Results</h3>

      {Object.entries(results).map(([websiteId, result]) => {
        const website = websites.find(w => w.id === parseInt(websiteId));
        if (!website) return null;

        return (
          <div key={websiteId} className="website-scan-result">
            <div className="scan-header">
              <h4>{website.name}</h4>
              <span className={`scan-status ${result.is_wordpress ? 'wordpress' : 'non-wordpress'}`}>
                {result.is_wordpress ? 'WordPress' : 'Non-WordPress'}
              </span>
              <span className="scan-date">
                Scanned: {new Date(result.scan_date).toLocaleDateString()}
              </span>
            </div>

            {/* WordPress Version */}
            {result.wordpress_version && (
              <div className="wordpress-version">
                WordPress Version: <strong>{result.wordpress_version}</strong>
              </div>
            )}

            {/* Vulnerabilities Summary */}
            <div className="vulnerabilities-summary">
              <div className="summary-item critical">
                <span className="count">
                  {countVulnerabilitiesBySeverity(result.vulnerabilities, 'critical')}
                </span>
                <span className="label">Critical</span>
              </div>
              <div className="summary-item high">
                <span className="count">
                  {countVulnerabilitiesBySeverity(result.vulnerabilities, 'high')}
                </span>
                <span className="label">High</span>
              </div>
              <div className="summary-item medium">
                <span className="count">
                  {countVulnerabilitiesBySeverity(result.vulnerabilities, 'medium')}
                </span>
                <span className="label">Medium</span>
              </div>
              <div className="summary-item low">
                <span className="count">
                  {countVulnerabilitiesBySeverity(result.vulnerabilities, 'low')}
                </span>
                <span className="label">Low</span>
              </div>
            </div>

            {/* Plugins Section */}
            {result.plugins.length > 0 && (
              <div className="plugins-section">
                <h5>Plugins ({result.plugins.length})</h5>
                <div className="plugins-list">
                  {result.plugins.map((plugin: Plugin, index: number) => (
                    <PluginItem key={index} plugin={plugin} />
                  ))}
                </div>
              </div>
            )}

            {/* Themes Section */}
            {result.themes.length > 0 && (
              <div className="themes-section">
                <h5>Themes ({result.themes.length})</h5>
                <div className="themes-list">
                  {result.themes.map((theme: Theme, index: number) => (
                    <ThemeItem key={index} themeData={theme} />
                  ))}
                </div>
              </div>
            )}

            {/* Users Section */}
            {result.users.length > 0 && (
              <div className="users-section">
                <h5>Users Found ({result.users.length})</h5>
                <div className="users-list">
                  {result.users.map((user, index) => (
                    <div key={index} className="user-item">
                      <span className="user-login">{user.login}</span>
                      {user.display_name && (
                        <span className="user-display-name">({user.display_name})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Vulnerabilities */}
            {result.vulnerabilities.length > 0 && (
              <div className="direct-vulnerabilities">
                <h5>Direct Vulnerabilities ({result.vulnerabilities.length})</h5>
                <div className="vulnerabilities-list">
                  {result.vulnerabilities.map((vuln: WpscanVulnerability, index: number) => (
                    <VulnerabilityItem key={index} vulnerability={vuln} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WpscanResults;