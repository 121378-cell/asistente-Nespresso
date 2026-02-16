/**
 * Logger utility for development and production
 * Replaces console.log with environment-aware logging
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
    // TODO: Send to error tracking service (e.g., Sentry)
  },
};
