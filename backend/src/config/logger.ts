import pino from 'pino';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Centralized logger using Pino
 *
 * Features:
 * - Structured logging (JSON in production)
 * - Pretty printing in development
 * - Configurable log levels
 * - High performance (async logging)
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development for better readability
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,

  // Base configuration
  base: {
    env: process.env.NODE_ENV || 'development',
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Log levels:
 * - fatal (60): Application is unusable
 * - error (50): Error that needs attention
 * - warn (40): Warning message
 * - info (30): General information
 * - debug (20): Debug information
 * - trace (10): Very detailed tracing
 */

export default logger;
