import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SecurityNotes, SecurityVulnerability } from '../../models/website'; // Use SecurityVulnerability from models

interface SecurityTabProps {
  security: SecurityNotes;
  onUpdate: (security: SecurityNotes) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  security,
  onUpdate
}) => {
  const updateVulnerabilities = (vulnerabilities: SecurityVulnerability[]) => {
    onUpdate({
      ...security,
      vulnerabilities
    });
  };

  const updateVulnerability = (index: number, updates: Partial<SecurityVulnerability>) => {
    const updated = security.vulnerabilities.map((vuln, i) =>
      i === index ? { ...vuln, ...updates } : vuln
    );
    updateVulnerabilities(updated);
  };

  const addVulnerability = () => {
    const newVulnerability: SecurityVulnerability = {
      name: '',
      severity: 'medium',
      description: '',
      status: 'open',
      discovered: new Date().toISOString()
    };
    updateVulnerabilities([...security.vulnerabilities, newVulnerability]);
  };

  const removeVulnerability = (index: number) => {
    updateVulnerabilities(security.vulnerabilities.filter((_, i) => i !== index));
  };

  const updateExposedInfo = (exposedInfo: string) => {
    onUpdate({
      ...security,
      exposedInfo
    });
  };

  return (
    <div className="notes-tab-content">
      <div className="tab-header">
        <h3>Security Vulnerabilities</h3>
        <button className="add-btn" onClick={addVulnerability}>
          <Plus size={16} /> Add Vulnerability
        </button>
      </div>

      <div className="vulnerabilities-list">
        {security?.vulnerabilities?.map((vuln, index) => (
          <div key={index} className={`vulnerability-item severity-${vuln.severity}`}>
            <div className="vulnerability-inputs">
              <input
                type="text"
                placeholder="Vulnerability name"
                value={vuln.name}
                onChange={(e) => updateVulnerability(index, { name: e.target.value })}
              />
              <select
                value={vuln.severity}
                onChange={(e) => updateVulnerability(index, { 
                  severity: e.target.value as SecurityVulnerability['severity'] 
                })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={vuln.status}
                onChange={(e) => updateVulnerability(index, { 
                  status: e.target.value as SecurityVulnerability['status'] 
                })}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <textarea
              placeholder="Description and remediation steps"
              value={vuln.description}
              onChange={(e) => updateVulnerability(index, { description: e.target.value })}
            />
            <button
              className="remove-btn"
              onClick={() => removeVulnerability(index)}
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
          value={security.exposedInfo}
          onChange={(e) => updateExposedInfo(e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );
};