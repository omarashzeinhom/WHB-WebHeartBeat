import React, { useState } from 'react';
import { Globe, Plus, Loader2 } from 'lucide-react';
import './AddWebsiteForm.css';

interface AddWebsiteFormProps {
  onAdd: (url: string) => void;
  loading: boolean;
}

const AddWebsiteForm: React.FC<AddWebsiteFormProps> = ({ onAdd, loading }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
      <div className="form-header">
        <h2>Add New Website</h2>
        <p>Enter the URL of the website you want to monitor</p>
      </div>
      
      <div className="input-group">
        <div className={`input-wrapper ${isFocused ? 'focused' : ''} ${url ? 'has-value' : ''}`}>
          <Globe className="input-icon" size={20} />
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="url-input"
          />
          <div className="input-underline"></div>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={!url.trim() || loading} 
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="btn-icon spinner" size={18} />
              Adding Website...
            </>
          ) : (
            <>
              <Plus className="btn-icon" size={18} />
              Add Website
            </>
          )}
        </button>
      </div>

      <div className="form-footer">
        <div className="feature-tags">
          <span className="feature-tag">Real-time Monitoring</span>
          <span className="feature-tag">Performance Metrics</span>
          <span className="feature-tag">SEO Analysis</span>
        </div>
      </div>
    </div>
  );
};

export default AddWebsiteForm;