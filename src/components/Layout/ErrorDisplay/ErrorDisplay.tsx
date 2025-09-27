// components/ErrorDisplay/ErrorDisplay.tsx
import React from 'react';
import './ErrorDisplay.css';
import { AppError } from '../../../hooks/useErrorHandler';

interface ErrorDisplayProps {
  errors: AppError[];
  onRemoveError?: (error: AppError) => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, onRemoveError }) => {
  if (errors.length === 0) return null;

  return (
    <div className="error-container">
      {errors.map((error, index) => (
        <div 
          key={`${error.timestamp.getTime()}-${index}`} 
          className={`error-message error-${error.type}`}
        >
          <div className="error-content">
            <span className="error-icon">
              {error.type === 'error' && '❌'}
              {error.type === 'warning' && '⚠️'}
              {error.type === 'info' && 'ℹ️'}
            </span>
            <span className="error-text">{error.message}</span>
            <span className="error-time">
              {error.timestamp.toLocaleTimeString()}
            </span>
          </div>
          {onRemoveError && (
            <button 
              className="error-close"
              onClick={() => onRemoveError(error)}
              aria-label="Close error"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ErrorDisplay;