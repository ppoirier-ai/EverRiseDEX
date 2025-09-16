import { useState, useCallback } from 'react';

export interface ErrorMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export const useErrorHandler = () => {
  const [message, setMessage] = useState<ErrorMessage | null>(null);

  const showError = useCallback((text: string) => {
    setMessage({ type: 'error', text });
  }, []);

  const showSuccess = useCallback((text: string) => {
    setMessage({ type: 'success', text });
  }, []);

  const showWarning = useCallback((text: string) => {
    setMessage({ type: 'warning', text });
  }, []);

  const showInfo = useCallback((text: string) => {
    setMessage({ type: 'info', text });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    message,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearMessage,
  };
};
