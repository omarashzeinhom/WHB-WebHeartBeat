// components/Pages/WpscanPage/WpscanPage.tsx
import React, { useState } from 'react';
import './WpscanPage.css';
import { useWpscan } from '../../hooks/useWpscan';
import { WpscanResult, Plugin, Theme, User, Vulnerability } from '../../models/WpscanResult';

export default function WpscanPage() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'plugins' | 'themes' | 'users' | 'vulnerabilities'>('overview');
  
  // Fix: Update your useWpscan hook to return these properties
  const { scanWebsite, isScanning, result, error } = useWpscan();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] Form submitted, starting scan...');
    
    if (!url || !apiKey) {
      console.log('[v0] Missing URL or API key');
      return;
    }

    await scanWebsite(url, apiKey);
  };

  const getTotalVulnerabilities = (result: WpscanResult) => {
    let total = result.vulnerabilities.length;
    result.plugins.forEach((p: Plugin) => total += p.vulnerabilities.length);
    result.themes.forEach((t: Theme) => total += t.vulnerabilities.length);
    return total;
  };

  const getSeverityClass = (severity?: string | null) => {
    if (!severity) return 'severity-unknown';
    const lower = severity.toLowerCase();
    if (lower.includes('critical')) return 'severity-critical';
    if (lower.includes('high')) return 'severity-high';
    if (lower.includes('medium')) return 'severity-medium';
    return 'severity-low';
  };

  const renderPluginItem = (plugin: Plugin, idx: number) => (
    <div key={idx} className="item-card">
      <div className="item-header">
        <h4>{plugin.name}</h4>
        {plugin.vulnerabilities.length > 0 && (
          <span className="badge badge-danger">
            {plugin.vulnerabilities.length} vulnerabilities
          </span>
        )}
      </div>
      <p className="item-meta">
        Slug: <code>{plugin.slug}</code>
        {plugin.version && <> | Version: <strong>{plugin.version}</strong></>}
      </p>
      
      {plugin.vulnerabilities.length > 0 && (
        <div className="vulnerabilities-list">
          {plugin.vulnerabilities.map((vuln: Vulnerability, vIdx: number) => (
            <div key={vIdx} className="vulnerability-item">
              <div className="vuln-header">
                <strong>{vuln.title}</strong>
                {vuln.severity && (
                  <span className={`severity-badge ${getSeverityClass(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                )}
              </div>
              {vuln.vuln_type && <p>Type: {vuln.vuln_type}</p>}
              {vuln.fixed_in && <p>Fixed in version: <strong>{vuln.fixed_in}</strong></p>}
              {vuln.references.length > 0 && (
                <div className="references">
                  <strong>References:</strong>
                  <ul>
                    {vuln.references.map((ref: string, rIdx: number) => (
                      <li key={rIdx}>
                        <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderThemeItem = (theme: Theme, idx: number) => (
    <div key={idx} className="item-card">
      <div className="item-header">
        <h4>{theme.name}</h4>
        {theme.vulnerabilities.length > 0 && (
          <span className="badge badge-danger">
            {theme.vulnerabilities.length} vulnerabilities
          </span>
        )}
      </div>
      <p className="item-meta">
        Slug: <code>{theme.slug}</code>
        {theme.version && <> | Version: <strong>{theme.version}</strong></>}
      </p>
      
      {theme.vulnerabilities.length > 0 && (
        <div className="vulnerabilities-list">
          {theme.vulnerabilities.map((vuln: Vulnerability, vIdx: number) => (
            <div key={vIdx} className="vulnerability-item">
              <div className="vuln-header">
                <strong>{vuln.title}</strong>
                {vuln.severity && (
                  <span className={`severity-badge ${getSeverityClass(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                )}
              </div>
              {vuln.vuln_type && <p>Type: {vuln.vuln_type}</p>}
              {vuln.fixed_in && <p>Fixed in version: <strong>{vuln.fixed_in}</strong></p>}
              {vuln.references.length > 0 && (
                <div className="references">
                  <strong>References:</strong>
                  <ul>
                    {vuln.references.map((ref: string, rIdx: number) => (
                      <li key={rIdx}>
                        <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUserItem = (user: User, idx: number) => (
    <div key={idx} className="item-card">
      <h4>{user.login}</h4>
      <p className="item-meta">
        ID: {user.id}
        {user.display_name && <> | Name: {user.display_name}</>}
      </p>
    </div>
  );

  const renderVulnerabilityItem = (vuln: Vulnerability, idx: number) => (
    <div key={idx} className="vulnerability-item">
      <div className="vuln-header">
        <strong>{vuln.title}</strong>
        {vuln.severity && (
          <span className={`severity-badge ${getSeverityClass(vuln.severity)}`}>
            {vuln.severity}
          </span>
        )}
      </div>
      {vuln.vuln_type && <p>Type: {vuln.vuln_type}</p>}
      {vuln.fixed_in && <p>Fixed in version: <strong>{vuln.fixed_in}</strong></p>}
      {vuln.references.length > 0 && (
        <div className="references">
          <strong>References:</strong>
          <ul>
            {vuln.references.map((ref: string, rIdx: number) => (
              <li key={rIdx}>
                <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="wpscan-page">
      <div className="wpscan-header">
        <h1>WordPress Security Scanner</h1>
        <p>Scan WordPress sites for vulnerabilities using WPScan database</p>
      </div>

      <form onSubmit={handleScan} className="scan-form">
        <div className="form-group">
          <label htmlFor="url">WordPress Site URL</label>
          <input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isScanning}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">WPScan API Key</label>
          <input
            id="apiKey"
            type="password"
            placeholder="Enter your WPScan API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isScanning}
            required
          />
          <small>Get your free API key at <a href="https://wpscan.com/api" target="_blank" rel="noopener noreferrer">wpscan.com/api</a></small>
        </div>

        <button type="submit" disabled={isScanning} className="scan-button">
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="results-container">
          <div className="results-header">
            <h2>Scan Results for {result.url}</h2>
            <span className="scan-date">{new Date(result.scan_date).toLocaleString()}</span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{result.wordpress_version || 'Unknown'}</div>
              <div className="stat-label">WordPress Version</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.plugins.length}</div>
              <div className="stat-label">Plugins Found</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.themes.length}</div>
              <div className="stat-label">Themes Found</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.users.length}</div>
              <div className="stat-label">Users Found</div>
            </div>
            <div className="stat-card stat-card-danger">
              <div className="stat-value">{getTotalVulnerabilities(result)}</div>
              <div className="stat-label">Total Vulnerabilities</div>
            </div>
          </div>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'plugins' ? 'active' : ''}`}
              onClick={() => setActiveTab('plugins')}
            >
              Plugins ({result.plugins.length})
            </button>
            <button 
              className={`tab ${activeTab === 'themes' ? 'active' : ''}`}
              onClick={() => setActiveTab('themes')}
            >
              Themes ({result.themes.length})
            </button>
            <button 
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({result.users.length})
            </button>
            <button 
              className={`tab ${activeTab === 'vulnerabilities' ? 'active' : ''}`}
              onClick={() => setActiveTab('vulnerabilities')}
            >
              Core Vulnerabilities ({result.vulnerabilities.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <h3>Scan Summary</h3>
                <div className="summary-section">
                  <h4>WordPress Core</h4>
                  <p>Version: <strong>{result.wordpress_version || 'Unknown'}</strong></p>
                  <p>Core Vulnerabilities: <strong className={result.vulnerabilities.length > 0 ? 'text-danger' : 'text-success'}>
                    {result.vulnerabilities.length}
                  </strong></p>
                </div>

                <div className="summary-section">
                  <h4>Plugins</h4>
                  <p>Total Plugins: <strong>{result.plugins.length}</strong></p>
                  <p>Vulnerable Plugins: <strong className="text-danger">
                    {result.plugins.filter((p: Plugin) => p.vulnerabilities.length > 0).length}
                  </strong></p>
                </div>

                <div className="summary-section">
                  <h4>Themes</h4>
                  <p>Total Themes: <strong>{result.themes.length}</strong></p>
                  <p>Vulnerable Themes: <strong className="text-danger">
                    {result.themes.filter((t: Theme) => t.vulnerabilities.length > 0).length}
                  </strong></p>
                </div>

                <div className="summary-section">
                  <h4>Security Recommendations</h4>
                  <ul>
                    {result.vulnerabilities.length > 0 && (
                      <li className="text-danger">Update WordPress core to the latest version</li>
                    )}
                    {result.plugins.some((p: Plugin) => p.vulnerabilities.length > 0) && (
                      <li className="text-danger">Update or remove vulnerable plugins</li>
                    )}
                    {result.themes.some((t: Theme) => t.vulnerabilities.length > 0) && (
                      <li className="text-danger">Update or remove vulnerable themes</li>
                    )}
                    {result.users.length > 0 && (
                      <li className="text-warning">Review user accounts and permissions</li>
                    )}
                    {getTotalVulnerabilities(result) === 0 && (
                      <li className="text-success">No known vulnerabilities found!</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'plugins' && (
              <div className="plugins-tab">
                {result.plugins.length === 0 ? (
                  <p className="empty-state">No plugins detected</p>
                ) : (
                  <div className="items-list">
                    {result.plugins.map(renderPluginItem)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="themes-tab">
                {result.themes.length === 0 ? (
                  <p className="empty-state">No themes detected</p>
                ) : (
                  <div className="items-list">
                    {result.themes.map(renderThemeItem)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-tab">
                {result.users.length === 0 ? (
                  <p className="empty-state">No users detected</p>
                ) : (
                  <div className="items-list">
                    {result.users.map(renderUserItem)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vulnerabilities' && (
              <div className="vulnerabilities-tab">
                {result.vulnerabilities.length === 0 ? (
                  <p className="empty-state">No core vulnerabilities found</p>
                ) : (
                  <div className="vulnerabilities-list">
                    {result.vulnerabilities.map(renderVulnerabilityItem)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}