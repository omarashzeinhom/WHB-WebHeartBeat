import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Lock, FileText, Shield, AlertTriangle, Save, Plus, Trash2 } from 'lucide-react';
import './WebsiteNotes.css';

// Define the props interface directly in this file
interface WebsiteNotesProps {
  notes?: any; // Add the notes prop
  onNotesChange: (notes: any) => void;
}

const WebsiteNotes: React.FC<WebsiteNotesProps> = ({ notes, onNotesChange }) => {
  const [activeTab, setActiveTab] = useState<'dns' | 'access' | 'general' | 'security' | 'report'>('dns');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDefaultNotes = () => ({
    dnsHistory: [],
    projectAccess: {
      credentials: [],
      accessNotes: '',
      warningAcknowledged: false
    },
    generalNotes: '',
    security: {
      vulnerabilities: [],
      openPorts: [],
      exposedInfo: '',
      securityScanResults: ''
    },
    report: {
      summary: '',
      performance: '',
      security: '',
      recommendations: '',
      generatedDate: new Date().toISOString()
    },
    lastUpdated: new Date().toISOString()
  });

  // Use a single state object to prevent multiple re-renders
  const [notesState, setNotesState] = useState({
    currentNotes: notes || getDefaultNotes(),
    hasChanges: false
  });

  // Memoized save function
  const handleSave = useCallback(() => {
    console.log('💾 Saving notes...');
    const updatedNotes = {
      ...notesState.currentNotes,
      lastUpdated: new Date().toISOString()
    };
    onNotesChange(updatedNotes);
    setNotesState(prev => ({ ...prev, hasChanges: false }));
    console.log('✅ Notes saved');
  }, [notesState.currentNotes, onNotesChange]);

  // Auto-save effect with proper dependencies
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (notesState.hasChanges) {
      console.log('⏱️ Setting auto-save timeout (2 seconds)');
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log('💾 Auto-save triggered');
        handleSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [notesState.hasChanges, handleSave]);

  const handleFieldChange = useCallback((section: string, field: string, value: any) => {
    setNotesState(prev => {
      const updatedNotes = { ...prev.currentNotes };

      if (section === 'generalNotes') {
        updatedNotes.generalNotes = value;
      } else if (section.includes('.')) {
        const [parent, child] = section.split('.');
        if (updatedNotes[parent]) {
          updatedNotes[parent] = {
            ...updatedNotes[parent],
            [child]: value
          };
        }
      } else {
        updatedNotes[section] = {
          ...updatedNotes[section],
          [field]: value
        };
      }

      return {
        currentNotes: updatedNotes,
        hasChanges: true
      };
    });
  }, []);

  const handleArrayChange = useCallback((section: string, items: any[]) => {
    setNotesState(prev => ({
      currentNotes: {
        ...prev.currentNotes,
        [section]: items
      },
      hasChanges: true
    }));
  }, []);

  const handleNestedArrayChange = useCallback((section: string, subsection: string, items: any[]) => {
    setNotesState(prev => ({
      currentNotes: {
        ...prev.currentNotes,
        [section]: {
          ...prev.currentNotes[section],
          [subsection]: items
        }
      },
      hasChanges: true
    }));
  }, []);

  const handleTabChange = (tab: 'dns' | 'access' | 'general' | 'security' | 'report') => {
    if (notesState.hasChanges) {
      const confirmSave = window.confirm('You have unsaved changes. Do you want to save them before switching tabs?');
      if (confirmSave) {
        handleSave();
      } else {
        setNotesState(prev => ({ ...prev, hasChanges: false }));
      }
    }
    setActiveTab(tab);
  };

  // DNS History Tab
  const DNSHistoryTab = () => (
    <div className="notes-tab-content">
      <div className="tab-header">
        <h3>DNS Records History</h3>
        <button
          className="add-btn"
          onClick={() => {
            const timestamp = new Date().toISOString();
            handleArrayChange('dnsHistory', [
              ...(notesState.currentNotes.dnsHistory || []),
              {
                type: 'A',
                value: '',
                ttl: 300,
                lastChecked: timestamp
              }
            ]);
          }}
        >
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="dns-records">
        {(!notesState.currentNotes.dnsHistory || notesState.currentNotes.dnsHistory.length === 0) ? (
          <p className="empty-message">No DNS records added yet. Click "Add Record" to start tracking DNS changes.</p>
        ) : (
          notesState.currentNotes.dnsHistory.map((record: any, index: number) => (
            <div key={index} className="dns-record">
              <select
                value={record.type || 'A'}
                onChange={(e) => {
                  const updated = [...notesState.currentNotes.dnsHistory];
                  updated[index] = { ...updated[index], type: e.target.value };
                  handleArrayChange('dnsHistory', updated);
                }}
              >
                <option value="A">A Record</option>
                <option value="MX">MX Record</option>
                <option value="TXT">TXT Record</option>
                <option value="CNAME">CNAME Record</option>
                <option value="NS">NS Record</option>
                <option value="AAAA">AAAA Record</option>
              </select>
              <input
                type="text"
                placeholder="Record value (e.g., IP address, domain)"
                value={record.value || ''}
                onChange={(e) => {
                  const timestamp = new Date().toISOString();
                  const updated = [...notesState.currentNotes.dnsHistory];
                  updated[index] = {
                    ...updated[index],
                    value: e.target.value,
                    lastChecked: timestamp
                  };
                  handleArrayChange('dnsHistory', updated);
                }}
              />
              <input
                type="number"
                placeholder="TTL (seconds)"
                value={record.ttl || 300}
                onChange={(e) => {
                  const updated = [...notesState.currentNotes.dnsHistory];
                  updated[index] = { ...updated[index], ttl: parseInt(e.target.value) || 300 };
                  handleArrayChange('dnsHistory', updated);
                }}
              />
              <span className="last-checked">
                {record.lastChecked ? new Date(record.lastChecked).toLocaleDateString() : 'Never'}
              </span>
              <button
                className="remove-btn"
                onClick={() => handleArrayChange('dnsHistory',
                  notesState.currentNotes.dnsHistory.filter((_: any, i: number) => i !== index)
                )}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const ProjectAccessTab = () => (
    <div className="notes-tab-content">
      <div className="security-warning">
        <AlertTriangle size={20} />
        <div>
          <strong>Security Notice</strong>
          <p>Never store real passwords here. Use a dedicated password manager for security.</p>
        </div>
      </div>

      <div className="tab-header">
        <h3>Project Access Credentials</h3>
        <button
          className="add-btn"
          onClick={() => handleNestedArrayChange('projectAccess', 'credentials', [
            ...(notesState.currentNotes.projectAccess?.credentials || []),
            { service: '', username: '', url: '', notes: '' }
          ])}
        >
          <Plus size={16} /> Add Credential
        </button>
      </div>

      <div className="credentials-list">
        {(notesState.currentNotes.projectAccess?.credentials || []).map((cred: any, index: number) => (
          <div key={index} className="credential-item">
            <input
              type="text"
              placeholder="Service (e.g., WordPress Admin, cPanel)"
              value={cred.service || ''}
              onChange={(e) => {
                const updated = [...(notesState.currentNotes.projectAccess?.credentials || [])];
                updated[index] = { ...updated[index], service: e.target.value };
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <input
              type="text"
              placeholder="Username/Email"
              value={cred.username || ''}
              onChange={(e) => {
                const updated = [...(notesState.currentNotes.projectAccess?.credentials || [])];
                updated[index] = { ...updated[index], username: e.target.value };
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <input
              type="text"
              placeholder="Login URL"
              value={cred.url || ''}
              onChange={(e) => {
                const updated = [...(notesState.currentNotes.projectAccess?.credentials || [])];
                updated[index] = { ...updated[index], url: e.target.value };
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <textarea
              placeholder="Notes (e.g., password hints, 2FA info)"
              value={cred.notes || ''}
              onChange={(e) => {
                const updated = [...(notesState.currentNotes.projectAccess?.credentials || [])];
                updated[index] = { ...updated[index], notes: e.target.value };
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <button
              className="remove-btn"
              onClick={() => handleNestedArrayChange('projectAccess', 'credentials',
                (notesState.currentNotes.projectAccess?.credentials || []).filter((_: any, i: number) => i !== index)
              )}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="access-notes">
        <h4>Access Notes</h4>
        <textarea
          placeholder="Additional access information, client instructions, etc."
          value={notesState.currentNotes.projectAccess?.accessNotes || ''}
          onChange={(e) => handleFieldChange('projectAccess', 'accessNotes', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );

  const GeneralNotesTab = () => (
    <div className="notes-tab-content">
      <h3>General Website Notes</h3>
      <textarea
        className="general-notes-textarea"
        placeholder="Enter general notes about this website: client requirements, project scope, deadlines, etc."
        value={notesState.currentNotes.generalNotes || ''}
        onChange={(e) => handleFieldChange('generalNotes', '', e.target.value)}
        rows={15}
      />
    </div>
  );

  const SecurityTab = () => (
    <div className="notes-tab-content">
      <div className="tab-header">
        <h3>Security Vulnerabilities</h3>
        <button
          className="add-btn"
          onClick={() => {
            const timestamp = new Date().toISOString();
            handleNestedArrayChange('security', 'vulnerabilities', [
              ...(notesState.currentNotes.security?.vulnerabilities || []),
              {
                name: '',
                severity: 'medium',
                description: '',
                status: 'open',
                discovered: timestamp
              }
            ]);
          }}
        >
          <Plus size={16} /> Add Vulnerability
        </button>
      </div>

      <div className="vulnerabilities-list">
        {(notesState.currentNotes.security?.vulnerabilities || []).map((vuln: any, index: number) => (
          <div key={index} className={`vulnerability-item severity-${vuln.severity}`}>
            <div className="vulnerability-inputs">
              <input
                type="text"
                placeholder="Vulnerability name"
                value={vuln.name || ''}
                onChange={(e) => {
                  const updated = [...(notesState.currentNotes.security?.vulnerabilities || [])];
                  updated[index] = { ...updated[index], name: e.target.value };
                  handleNestedArrayChange('security', 'vulnerabilities', updated);
                }}
              />
              <select
                value={vuln.severity || 'medium'}
                onChange={(e) => {
                  const updated = [...(notesState.currentNotes.security?.vulnerabilities || [])];
                  updated[index] = { ...updated[index], severity: e.target.value };
                  handleNestedArrayChange('security', 'vulnerabilities', updated);
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={vuln.status || 'open'}
                onChange={(e) => {
                  const updated = [...(notesState.currentNotes.security?.vulnerabilities || [])];
                  updated[index] = { ...updated[index], status: e.target.value };
                  handleNestedArrayChange('security', 'vulnerabilities', updated);
                }}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <textarea
              placeholder="Description and remediation steps"
              value={vuln.description || ''}
              onChange={(e) => {
                const updated = [...(notesState.currentNotes.security?.vulnerabilities || [])];
                updated[index] = { ...updated[index], description: e.target.value };
                handleNestedArrayChange('security', 'vulnerabilities', updated);
              }}
            />
            <button
              className="remove-btn"
              onClick={() => handleNestedArrayChange('security', 'vulnerabilities',
                (notesState.currentNotes.security?.vulnerabilities || []).filter((_: any, i: number) => i !== index)
              )}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="security-notes">
        <h4>Security Scan Results</h4>
        <textarea
          placeholder="Enter security scan results, exposed information, and security recommendations..."
          value={notesState.currentNotes.security?.exposedInfo || ''}
          onChange={(e) => handleFieldChange('security.exposedInfo', '', e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );

  const ReportTab = () => {
    const exportReport = (format: 'pdf' | 'json') => {
      if (format === 'json') {
        const timestamp = new Date().toISOString();
        const reportData = {
          ...notesState.currentNotes.report,
          exportDate: timestamp,
          format: 'json'
        };

        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `website-report-${timestamp.split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else {
        alert('PDF export feature will be implemented. For now, use the JSON export.');
      }
    };

    return (
      <div className="notes-tab-content">
        <div className="tab-header">
          <h3>Website Status Report</h3>
          <div className="report-actions">
            <button className="export-btn" onClick={() => exportReport('pdf')}>
              Export as PDF
            </button>
            <button className="export-btn" onClick={() => exportReport('json')}>
              Export as JSON
            </button>
          </div>
        </div>

        <div className="report-fields">
          <div className="report-field">
            <label>Executive Summary</label>
            <textarea
              value={notesState.currentNotes.report?.summary || ''}
              onChange={(e) => handleFieldChange('report', 'summary', e.target.value)}
              placeholder="Brief overview of website status..."
              rows={3}
            />
          </div>
          <div className="report-field">
            <label>Performance Analysis</label>
            <textarea
              value={notesState.currentNotes.report?.performance || ''}
              onChange={(e) => handleFieldChange('report', 'performance', e.target.value)}
              placeholder="Performance metrics and analysis..."
              rows={3}
            />
          </div>
          <div className="report-field">
            <label>Security Assessment</label>
            <textarea
              value={notesState.currentNotes.report?.security || ''}
              onChange={(e) => handleFieldChange('report', 'security', e.target.value)}
              placeholder="Security findings and recommendations..."
              rows={3}
            />
          </div>
          <div className="report-field">
            <label>Recommendations</label>
            <textarea
              value={notesState.currentNotes.report?.recommendations || ''}
              onChange={(e) => handleFieldChange('report', 'recommendations', e.target.value)}
              placeholder="Action items and recommendations..."
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="website-notes">
      <div className="notes-header">
        <h3>Website Notes & Documentation</h3>
        <div className="header-actions">
          {notesState.hasChanges && (
            <button className="save-btn" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          )}
          <span className="last-saved">
            Last updated: {new Date(notesState.currentNotes.lastUpdated).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="notes-tabs">
        <button
          className={activeTab === 'dns' ? 'active' : ''}
          onClick={() => handleTabChange('dns')}
        >
          <Globe size={16} /> DNS History
        </button>
        <button
          className={activeTab === 'access' ? 'active' : ''}
          onClick={() => handleTabChange('access')}
        >
          <Lock size={16} /> Project Access
        </button>
        <button
          className={activeTab === 'general' ? 'active' : ''}
          onClick={() => handleTabChange('general')}
        >
          <FileText size={16} /> General Notes
        </button>
        <button
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => handleTabChange('security')}
        >
          <Shield size={16} /> Security
        </button>
        <button
          className={activeTab === 'report' ? 'active' : ''}
          onClick={() => handleTabChange('report')}
        >
          <FileText size={16} /> Status Report
        </button>
      </div>

      <div className="notes-content">
        {activeTab === 'dns' && <DNSHistoryTab />}
        {activeTab === 'access' && <ProjectAccessTab />}
        {activeTab === 'general' && <GeneralNotesTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'report' && <ReportTab />}
      </div>
    </div>
  );
};

export default WebsiteNotes;