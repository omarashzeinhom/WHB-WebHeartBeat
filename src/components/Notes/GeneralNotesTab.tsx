// components/notes/GeneralNotesTab.tsx
import React from 'react';

interface GeneralNotesTabProps {
  generalNotes: string;
  onUpdate: (notes: string) => void;
}

export const GeneralNotesTab: React.FC<GeneralNotesTabProps> = ({
  generalNotes,
  onUpdate
}) => {
  return (
    <div className="notes-tab-content">
      <h3>General Website Notes</h3>
      <textarea
        className="general-notes-textarea"
        placeholder="Enter general notes about this website: client requirements, project scope, deadlines, etc."
        value={generalNotes}
        onChange={(e) => onUpdate(e.target.value)}
        rows={15}
      />
    </div>
  );
};