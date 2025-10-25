// hooks/useWebsiteNotes.ts
import { useState, useCallback, useRef } from 'react';
import { DNSRecord, ProjectAccess, SecurityNotes, WebsiteReport } from '../models/website';

export interface WebsiteNotesData {
  dnsHistory: DNSRecord[];
  projectAccess: ProjectAccess;
  generalNotes: string;
  security: SecurityNotes;
  report: WebsiteReport;
  lastUpdated: string;
}

export const useWebsiteNotes = (initialNotes?: WebsiteNotesData) => {
  const [notes, setNotes] = useState<WebsiteNotesData>(() => 
    initialNotes || getDefaultNotes()
  );
  const [hasChanges, setHasChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDefaultNotes = (): WebsiteNotesData => ({
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

  // Simple field update function
  const updateField = useCallback(<K extends keyof WebsiteNotesData>(
    field: K,
    value: WebsiteNotesData[K]
  ) => {
    setNotes(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // Nested field update
  const updateNestedField = useCallback(<
    T extends keyof WebsiteNotesData,
    K extends keyof WebsiteNotesData[T]
  >(
    parent: T,
    field: K,
    value: WebsiteNotesData[T][K]
  ) => {
    setNotes(prev => ({
      ...prev,
      [parent]: {
        //...prev[parent],
        [field]: value
      }
    }));
    setHasChanges(true);
  }, []);

  // Array operations
  const updateArrayField = useCallback(<T extends keyof WebsiteNotesData>(
    field: T,
    updater: (current: WebsiteNotesData[T]) => WebsiteNotesData[T]
  ) => {
    setNotes(prev => ({
      ...prev,
      [field]: updater(prev[field] as any)
    }));
    setHasChanges(true);
  }, []);

  const clearChanges = useCallback(() => {
    setHasChanges(false);
  }, []);

  const resetAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);

  return {
    notes,
    hasChanges,
    updateField,
    updateNestedField,
    updateArrayField,
    clearChanges,
    resetAutoSave,
    setNotes
  };
};