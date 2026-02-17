import pino from 'pino';
import { env } from './env.js';

// Determine if we're in development mode
const isDevelopment = env.nodeEnv !== 'production';

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
  level: env.logLevel || (isDevelopment ? 'debug' : 'info'),

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
    env: env.nodeEnv,
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
