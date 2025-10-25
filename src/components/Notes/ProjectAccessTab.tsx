// components/notes/ProjectAccessTab.tsx
import React from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { ProjectAccess, Credential } from '../../models/website'; // Import from models

interface ProjectAccessTabProps {
  projectAccess: ProjectAccess;
  onUpdate: (projectAccess: ProjectAccess) => void;
}

export const ProjectAccessTab: React.FC<ProjectAccessTabProps> = ({
  projectAccess,
  onUpdate
}) => {
  const updateCredentials = (credentials: Credential[]) => {
    onUpdate({
      ...projectAccess,
      credentials
    });
  };

  const updateCredential = (index: number, updates: Partial<Credential>) => {
    const updated = projectAccess?.credentials?.map((cred, i) =>
      i === index ? { ...cred, ...updates } : cred
    );
    updateCredentials(updated);
  };

  const addCredential = () => {
    const newCredential: Credential = {
      service: '',
      username: '',
      url: '',
      notes: '',
      type: 'general' // Add default type
    };
    updateCredentials([...projectAccess.credentials, newCredential]);
  };

  const removeCredential = (index: number) => {
    updateCredentials(projectAccess.credentials.filter((_, i) => i !== index));
  };

  const updateAccessNotes = (accessNotes: string) => {
    onUpdate({
      ...projectAccess,
      accessNotes
    });
  };

  return (
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
        <button className="add-btn" onClick={addCredential}>
          <Plus size={16} /> Add Credential
        </button>
      </div>

      <div className="credentials-list">
        {projectAccess?.credentials?.map((cred, index) => (
          <div key={index} className="credential-item">
            <input
              type="text"
              placeholder="Service (e.g., WordPress Admin, cPanel)"
              value={cred.service}
              onChange={(e) => updateCredential(index, { service: e.target.value })}
            />
            <input
              type="text"
              placeholder="Username/Email"
              value={cred.username}
              onChange={(e) => updateCredential(index, { username: e.target.value })}
            />
            <input
              type="text"
              placeholder="Login URL"
              value={cred.url}
              onChange={(e) => updateCredential(index, { url: e.target.value })}
            />
            <textarea
              placeholder="Notes (e.g., password hints, 2FA info)"
              value={cred.notes}
              onChange={(e) => updateCredential(index, { notes: e.target.value })}
            />
            <button
              className="remove-btn"
              onClick={() => removeCredential(index)}
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
          value={projectAccess?.accessNotes}
          onChange={(e) => updateAccessNotes(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
};