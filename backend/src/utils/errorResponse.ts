import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const getDevMessage = (error: unknown): string | undefined => {
  if (env.nodeEnv !== 'development') {
    return undefined;
  }

  return error instanceof Error ? error.message : String(error);
};

export const sendInternalError = (
  res: Response,
  error: unknown,
  publicMessage = 'Internal server error'
) => {
  const message = getDevMessage(error);
  return res.status(500).json({
    error: publicMessage,
    ...(message ? { message } : {}),
  });
};

export const logAndSendInternalError = (
  req: Request,
  res: Response,
  error: unknown,
  logMessage: string,
  publicMessage = 'Internal server error',
  extra: Record<string, unknown> = {}
) => {
  logger.error(
    {
      err: error,
      requestId: req.id,
      path: req.path,
      method: req.method,
      ...extra,
    },
    logMessage
  );

  return sendInternalError(res, error, publicMessage);
};
