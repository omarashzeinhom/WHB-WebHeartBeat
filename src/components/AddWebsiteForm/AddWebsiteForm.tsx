import React, { useState } from 'react';
import './AddWebsiteForm.css';

interface AddWebsiteFormProps {
  onAdd: (url: string) => void;
  loading: boolean;
}

const AddWebsiteForm: React.FC<AddWebsiteFormProps> = ({ onAdd, loading }) => {
  const [url, setUrl] = useState('');
  
  const handleSubmit = () => {
    if (url.trim()) {
      onAdd(url.trim());
      setUrl('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="add-website-form">
      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSubmit} disabled={!url.trim() || loading}>
        {loading ? 'Adding...' : 'Add Website'}
      </button>
    </div>
  );
};

export default AddWebsiteForm;