import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

interface UseErrorHandlerReturn {
  error: Error | null;
  handleError: (error: Error) => void;
  clearError: () => void;
  showError: (message: string) => void;
}

/**
 * Custom hook for error handling
 * Provides consistent error handling across components
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    logger.error('Error handled:', error);
    setError(error);

    // TODO: Show toast notification
    // toast.error(error.message);

    // TODO: Send to error tracking
    // Sentry.captureException(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showError = useCallback(
    (message: string) => {
      const error = new Error(message);
      handleError(error);
    },
    [handleError]
  );

  return {
    error,
    handleError,
    clearError,
    showError,
  };
};
