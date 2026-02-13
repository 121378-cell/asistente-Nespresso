/**
 * Logger utility for development and production
 * Replaces console.log with environment-aware logging
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    // TODO: Send to error tracking service (e.g., Sentry)
  },
};
