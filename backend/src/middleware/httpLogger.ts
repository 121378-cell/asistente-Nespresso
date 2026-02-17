import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from '../config/logger.js';

/**
 * HTTP request logging middleware using pino-http
 *
 * Automatically logs:
 * - Request method, URL, headers
 * - Response status code, time
 * - Request/response body (in development)
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incomingHeader = req.headers['x-request-id'];
    const incomingRequestId = Array.isArray(incomingHeader) ? incomingHeader[0] : incomingHeader;
    const requestId = incomingRequestId?.trim() || randomUUID();
    res.setHeader('x-request-id', requestId);
    return requestId;
  },

  // Auto-log all HTTP requests
  autoLogging: true,

  // Custom log level based on response status
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'info';
    return 'info';
  },

  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed`;
  },

  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },

  // Custom attribute keys
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },

  // Serialize request
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customProps: (req) => ({
    requestId: req.id,
  }),
});

export default httpLogger;
