// components/notes/DNSHistoryTab.tsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DNSRecord } from '../../models/website';

interface DNSHistoryTabProps {
  dnsHistory: DNSRecord[] | undefined; // Allow undefined
  onUpdate: (dnsHistory: DNSRecord[]) => void;
}

export const DNSHistoryTab: React.FC<DNSHistoryTabProps> = ({ 
  dnsHistory, 
  onUpdate 
}) => {
  // Create a safe reference that's always an array
  const safeDnsHistory = dnsHistory || [];

  const addRecord = () => {
    const newRecord: DNSRecord = {
      type: 'A',
      value: '',
      ttl: 300,
      lastChecked: new Date().toISOString()
    };
    onUpdate([...safeDnsHistory, newRecord]);
  };

  const updateRecord = (index: number, updates: Partial<DNSRecord>) => {
    const updated = safeDnsHistory.map((record, i) => 
      i === index ? { ...record, ...updates } : record
    );
    onUpdate(updated);
  };

  const removeRecord = (index: number) => {
    onUpdate(safeDnsHistory.filter((_, i) => i !== index));
  };

  return (
    <div className="notes-tab-content">
      <div className="tab-header">
        <h3>DNS Records History</h3>
        <button className="add-btn" onClick={addRecord}>
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="dns-records">
        {safeDnsHistory.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">
              No DNS records added yet. Click "Add Record" to start tracking DNS changes.
            </p>
          </div>
        ) : (
          safeDnsHistory.map((record, index) => (
            <div key={index} className="dns-record">
              <select
                value={record.type}
                onChange={(e) => updateRecord(index, { 
                  type: e.target.value as DNSRecord['type'] 
                })}
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
                value={record.value}
                onChange={(e) => updateRecord(index, { 
                  value: e.target.value,
                  lastChecked: new Date().toISOString()
                })}
              />
              
              <input
                type="number"
                placeholder="TTL (seconds)"
                value={record.ttl || ''}
                onChange={(e) => updateRecord(index, { 
                  ttl: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
              
              <span className="last-checked">
                {record.lastChecked ? new Date(record.lastChecked).toLocaleDateString() : 'Not checked'}
              </span>
              
              <button
                className="remove-btn"
                onClick={() => removeRecord(index)}
                type="button"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};