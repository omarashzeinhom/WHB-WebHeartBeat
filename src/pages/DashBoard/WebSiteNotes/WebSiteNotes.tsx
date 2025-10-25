// WebsiteNotes.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Lock, FileText, Shield, Save, } from 'lucide-react';
import './WebsiteNotes.css';


// Import hook
import { DNSHistoryTab } from '../../../components/Notes/DNSHistoryTab';
import { GeneralNotesTab } from '../../../components/Notes/GeneralNotesTab';
import { ProjectAccessTab } from '../../../components/Notes/ProjectAccessTab';
import { ReportTab } from '../../../components/Notes/ReportTab';
import { SecurityTab } from '../../../components/Notes/SecurityTab';
import { useWebsiteNotes, WebsiteNotesData } from '../../../hooks/useWebsiteNotes';

interface WebsiteNotesProps {
  notes?: WebsiteNotesData;
  onNotesChange: (notes: WebsiteNotesData) => void;
}

const WebsiteNotes: React.FC<WebsiteNotesProps> = ({ notes, onNotesChange }) => {
  const [activeTab, setActiveTab] = useState<'dns' | 'access' | 'general' | 'security' | 'report'>('dns');
  
  const {
    notes: notesState,
    hasChanges,
    updateField,
    clearChanges,
    resetAutoSave
  } = useWebsiteNotes(notes);

  // Auto-save effect
  useEffect(() => {
    if (!hasChanges) return;

    resetAutoSave();
    
    const timeoutId = setTimeout(() => {
      console.log('💾 Auto-saving notes...');
      onNotesChange({
        ...notesState,
        lastUpdated: new Date().toISOString()
      });
      clearChanges();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [hasChanges, notesState, onNotesChange, clearChanges, resetAutoSave]);

  const handleSave = useCallback(() => {
    console.log('💾 Manual save triggered');
    onNotesChange({
      ...notesState,
      lastUpdated: new Date().toISOString()
    });
    clearChanges();
  }, [notesState, onNotesChange, clearChanges]);

  const handleTabChange = (tab: 'dns' | 'access' | 'general' | 'security' | 'report') => {
    if (hasChanges) {
      const confirmSave = window.confirm('You have unsaved changes. Do you want to save them before switching tabs?');
      if (confirmSave) {
        handleSave();
      } else {
        clearChanges();
      }
    }
    setActiveTab(tab);
  };

  return (
    <div className="website-notes">
      <div className="notes-header">
        <h3>Website Notes & Documentation</h3>
        <div className="header-actions">
          {hasChanges && (
            <button className="save-btn" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          )}
          <span className="last-saved">
            Last updated: {new Date(notesState.lastUpdated).toLocaleString()}
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
        {activeTab === 'dns' && (
          <DNSHistoryTab
            dnsHistory={notesState.dnsHistory}
            onUpdate={(dnsHistory) => updateField('dnsHistory', dnsHistory)}
          />
        )}
        
        {activeTab === 'access' && (
          <ProjectAccessTab
            projectAccess={notesState.projectAccess}
            onUpdate={(projectAccess) => updateField('projectAccess', projectAccess)}
          />
        )}
        
        {activeTab === 'general' && (
          <GeneralNotesTab
            generalNotes={notesState.generalNotes}
            onUpdate={(generalNotes) => updateField('generalNotes', generalNotes)}
          />
        )}
        
        {activeTab === 'security' && (
          <SecurityTab
            security={notesState.security}
            onUpdate={(security) => updateField('security', security)}
          />
        )}
        
        {activeTab === 'report' && (
          <ReportTab
            report={notesState.report}
            onUpdate={(report) => updateField('report', report)}
          />
        )}
      </div>
    </div>
  );
};

export default WebsiteNotes;