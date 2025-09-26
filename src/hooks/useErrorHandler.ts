

// hooks/useErrorHandler.ts
import { useState } from 'react';

export interface AppError {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const error: AppError = {
      message,
      type,
      timestamp: new Date(),
    };
    setErrors(prev => [...prev, error]);

    // Auto-remove errors after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== error));
    }, 5000);
  };

  const removeError = (error: AppError) => {
    setErrors(prev => prev.filter(e => e !== error));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      const message = errorMessage || (error as Error).message || 'An unexpected error occurred';
      addError(message);
      return null;
    }
  };

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleAsyncOperation,
  };
};