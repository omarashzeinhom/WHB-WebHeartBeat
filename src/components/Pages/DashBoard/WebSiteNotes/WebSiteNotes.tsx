import React, { useState } from 'react';
import { Globe, Lock, FileText, Shield, AlertTriangle, Save, Plus, Trash2 } from 'lucide-react';
import './WebsiteNotes.css';

interface WebsiteNotesProps {
  notes: any;
  onNotesChange: (notes: any) => void;
}

const WebsiteNotes: React.FC<WebsiteNotesProps> = ({ notes, onNotesChange }) => {
  const [activeTab, setActiveTab] = useState<'dns' | 'access' | 'general' | 'security' | 'report'>('dns');
  const [hasChanges, setHasChanges] = useState(false);

  const defaultNotes = {
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
  };

  const currentNotes = notes || defaultNotes;

  const handleSave = () => {
    onNotesChange({
      ...currentNotes,
      lastUpdated: new Date().toISOString()
    });
    setHasChanges(false);
  };

  const handleFieldChange = (section: string, field: string, value: any) => {
    if (section === 'generalNotes') {
      // Handle general notes directly
      const updatedNotes = {
        ...currentNotes,
        generalNotes: value
      };
      onNotesChange(updatedNotes);
    } else {
      const updatedNotes = {
        ...currentNotes,
        [section]: {
          ...currentNotes[section],
          [field]: value
        }
      };
      onNotesChange(updatedNotes);
    }
    setHasChanges(true);
  };

  const handleArrayChange = (section: string, items: any[]) => {
    const updatedNotes = {
      ...currentNotes,
      [section]: items
    };
    onNotesChange(updatedNotes);
    setHasChanges(true);
  };

  const handleNestedArrayChange = (section: string, subsection: string, items: any[]) => {
    const updatedNotes = {
      ...currentNotes,
      [section]: {
        ...currentNotes[section],
        [subsection]: items
      }
    };
    onNotesChange(updatedNotes);
    setHasChanges(true);
  };

  // DNS History Tab - Fixed functionality
  const DNSHistoryTab = () => (
    <div className="notes-tab-content">
      <div className="tab-header">
        <h3>DNS Records History</h3>
        <button className="add-btn" onClick={() => handleArrayChange('dnsHistory', [...currentNotes.dnsHistory, {
          record_type: 'A',  // Changed from 'type' to 'record_type'
          value: '',
          last_checked: new Date().toISOString()  // Changed from 'lastChecked' to 'last_checked'
        }])}>
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="dns-records">
        {currentNotes.dnsHistory?.length === 0 ? (
          <p className="empty-message">No DNS records added yet. Click "Add Record" to start tracking DNS changes.</p>
        ) : (
          currentNotes.dnsHistory?.map((record: any, index: number) => (
            <div key={index} className="dns-record">
              <select
                value={record.type}
                onChange={(e) => {
                  const updated = [...currentNotes.dnsHistory];
                  updated[index].type = e.target.value;
                  handleArrayChange('dnsHistory', updated);
                }}
              >
                <option value="A">A Record</option>
                <option value="MX">MX Record</option>
                <option value="TXT">TXT Record</option>
                <option value="CNAME">CNAME Record</option>
                <option value="NS">NS Record</option>
                <option value="AAAA">AAAA Record</option>
                <option value="PTR">PTR Record</option>
                <option value="SRV">SRV Record</option>
              </select>
              <input
                type="text"
                placeholder="Record value (e.g., IP address, domain)"
                value={record.value}
                onChange={(e) => {
                  const updated = [...currentNotes.dnsHistory];
                  updated[index].value = e.target.value;
                  updated[index].lastChecked = new Date().toISOString();
                  handleArrayChange('dnsHistory', updated);
                }}
              />
              <input
                type="number"
                placeholder="TTL (seconds)"
                value={record.ttl || ''}
                onChange={(e) => {
                  const updated = [...currentNotes.dnsHistory];
                  updated[index].ttl = parseInt(e.target.value) || 300;
                  handleArrayChange('dnsHistory', updated);
                }}
              />
              <span className="last-checked">
                {record.lastChecked ? new Date(record.lastChecked).toLocaleDateString() : 'Never'}
              </span>
              <button
                className="remove-btn"
                onClick={() => handleArrayChange('dnsHistory', currentNotes.dnsHistory.filter((_: any, i: number) => i !== index))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Project Access Tab
  const ProjectAccessTab = () => (
    <div className="notes-tab-content">
      <div className="security-warning">
        <AlertTriangle size={20} />
        <div>
          <strong>Security Notice</strong>
          <p>This feature is under development. Please save your passwords in a dedicated password manager for security reasons.</p>
        </div>
      </div>

      <div className="tab-header">
        <h3>Project Access Credentials</h3>
        <button
          className="add-btn"
          onClick={() => handleNestedArrayChange('projectAccess', 'credentials', [
            ...currentNotes.projectAccess.credentials,
            { service: '', username: '', url: '', notes: '' }
          ])}
        >
          <Plus size={16} /> Add Credential
        </button>
      </div>

      <div className="credentials-list">
        {currentNotes.projectAccess.credentials.map((cred: any, index: number) => (
          <div key={index} className="credential-item">
            <input
              type="text"
              placeholder="Service (e.g., WordPress Admin, cPanel)"
              value={cred.service}
              onChange={(e) => {
                const updated = [...currentNotes.projectAccess.credentials];
                updated[index].service = e.target.value;
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <input
              type="text"
              placeholder="Username"
              value={cred.username}
              onChange={(e) => {
                const updated = [...currentNotes.projectAccess.credentials];
                updated[index].username = e.target.value;
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <input
              type="text"
              placeholder="URL"
              value={cred.url}
              onChange={(e) => {
                const updated = [...currentNotes.projectAccess.credentials];
                updated[index].url = e.target.value;
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <textarea
              placeholder="Notes"
              value={cred.notes}
              onChange={(e) => {
                const updated = [...currentNotes.projectAccess.credentials];
                updated[index].notes = e.target.value;
                handleNestedArrayChange('projectAccess', 'credentials', updated);
              }}
            />
            <button
              className="remove-btn"
              onClick={() => handleNestedArrayChange('projectAccess', 'credentials',
                currentNotes.projectAccess.credentials.filter((_: any, i: number) => i !== index))}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="access-notes">
        <h4>Access Notes</h4>
        <textarea
          placeholder="Additional access information..."
          value={currentNotes.projectAccess.accessNotes}
          onChange={(e) => handleFieldChange('projectAccess', 'accessNotes', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );

  // General Notes Tab
  const GeneralNotesTab = () => (
    <div className="notes-tab-content">
      <h3>General Website Notes</h3>
      <textarea
        className="general-notes-textarea"
        placeholder="Enter general notes about this website..."
        value={currentNotes.generalNotes}
        onChange={(e) => handleFieldChange('generalNotes', '', e.target.value)}
        rows={15}
      />
    </div>
  );

  // Security Tab
  const SecurityTab = () => (
    <div className="notes-tab-content">
      <div className="tab-header">
        <h3>Security Vulnerabilities</h3>
        <button
          className="add-btn"
          onClick={() => handleNestedArrayChange('security', 'vulnerabilities', [
            ...currentNotes.security.vulnerabilities,
            {
              name: '',
              severity: 'medium',
              description: '',
              status: 'open',
              discovered: new Date().toISOString()
            }
          ])}
        >
          <Plus size={16} /> Add Vulnerability
        </button>
      </div>

      <div className="vulnerabilities-list">
        {currentNotes.security.vulnerabilities.map((vuln: any, index: number) => (
          <div key={index} className={`vulnerability-item severity-${vuln.severity}`}>
            <input
              type="text"
              placeholder="Vulnerability name"
              value={vuln.name}
              onChange={(e) => {
                const updated = [...currentNotes.security.vulnerabilities];
                updated[index].name = e.target.value;
                handleNestedArrayChange('security', 'vulnerabilities', updated);
              }}
            />
            <select
              value={vuln.severity}
              onChange={(e) => {
                const updated = [...currentNotes.security.vulnerabilities];
                updated[index].severity = e.target.value;
                handleNestedArrayChange('security', 'vulnerabilities', updated);
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={vuln.status}
              onChange={(e) => {
                const updated = [...currentNotes.security.vulnerabilities];
                updated[index].status = e.target.value;
                handleNestedArrayChange('security', 'vulnerabilities', updated);
              }}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="fixed">Fixed</option>
            </select>
            <textarea
              placeholder="Description"
              value={vuln.description}
              onChange={(e) => {
                const updated = [...currentNotes.security.vulnerabilities];
                updated[index].description = e.target.value;
                handleNestedArrayChange('security', 'vulnerabilities', updated);
              }}
            />
            <button
              className="remove-btn"
              onClick={() => handleNestedArrayChange('security', 'vulnerabilities',
                currentNotes.security.vulnerabilities.filter((_: any, i: number) => i !== index))}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="security-notes">
        <h4>Security Scan Results & Exposed Information</h4>
        <textarea
          placeholder="Enter security scan results and exposed information..."
          value={currentNotes.security.exposedInfo}
          onChange={(e) => handleFieldChange('security', 'exposedInfo', e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );

  // Report Tab with Export Functionality
  const ReportTab = () => (
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
            value={currentNotes.report.summary}
            onChange={(e) => handleFieldChange('report', 'summary', e.target.value)}
            placeholder="Brief overview of website status..."
            rows={3}
          />
        </div>
        <div className="report-field">
          <label>Performance Analysis</label>
          <textarea
            value={currentNotes.report.performance}
            onChange={(e) => handleFieldChange('report', 'performance', e.target.value)}
            placeholder="Performance metrics and analysis..."
            rows={3}
          />
        </div>
        <div className="report-field">
          <label>Security Assessment</label>
          <textarea
            value={currentNotes.report.security}
            onChange={(e) => handleFieldChange('report', 'security', e.target.value)}
            placeholder="Security findings and recommendations..."
            rows={3}
          />
        </div>
        <div className="report-field">
          <label>Recommendations</label>
          <textarea
            value={currentNotes.report.recommendations}
            onChange={(e) => handleFieldChange('report', 'recommendations', e.target.value)}
            placeholder="Action items and recommendations..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const exportReport = (format: 'pdf' | 'json') => {
    if (format === 'json') {
      const reportData = {
        ...currentNotes.report,
        exportDate: new Date().toISOString(),
        format: 'json'
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `website-report-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'pdf') {
      // For PDF export, you'd typically use a library like jsPDF or html2canvas
      console.log('PDF export functionality would be implemented here');
      alert('PDF export feature will be implemented. For now, use the JSON export.');
    }
  };

  return (
    <div className="website-notes">
      <div className="notes-header">
        <h3>Website Notes & Documentation</h3>
        {hasChanges && (
          <button className="save-btn" onClick={handleSave}>
            <Save size={16} /> Save Changes
          </button>
        )}
      </div>

      <div className="notes-tabs">
        <button className={activeTab === 'dns' ? 'active' : ''} onClick={() => setActiveTab('dns')}>
          <Globe size={16} /> DNS History
        </button>
        <button className={activeTab === 'access' ? 'active' : ''} onClick={() => setActiveTab('access')}>
          <Lock size={16} /> Project Access
        </button>
        <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
          <FileText size={16} /> General Notes
        </button>
        <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
          <Shield size={16} /> Security
        </button>
        <button className={activeTab === 'report' ? 'active' : ''} onClick={() => setActiveTab('report')}>
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

      <div className="notes-footer">
        <span>Last updated: {new Date(currentNotes.lastUpdated).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default WebsiteNotes;