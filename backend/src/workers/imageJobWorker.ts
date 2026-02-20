import { identifyMachineFromImage } from '../services/geminiService.js';
import {
  claimNextQueuedImageJob,
  markImageJobCompleted,
  scheduleImageJobRetry,
  moveImageJobToDlq,
  ImageJob,
} from '../services/imageJobService.js';
import { logger } from '../config/logger.js';

const IDLE_WAIT_MS = 2_000;
const RETRY_BASE_BACKOFF_MS = 2_000;
const RETRY_MAX_BACKOFF_MS = 30_000;

let workerActive = false;
let workerPromise: Promise<void> | null = null;

const wait = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isRetryableError = (message: string): boolean =>
  /(timeout|timed out|rate limit|429|5\d\d|unavailable|network|econn|etimedout|eai_again)/i.test(
    message
  );

const getBackoffMs = (attempt: number): number => {
  const factor = Math.max(0, attempt - 1);
  const baseBackoff = RETRY_BASE_BACKOFF_MS * 2 ** factor;
  const jitter = Math.random() * (baseBackoff * 0.1);
  const backoff = baseBackoff + jitter;
  return Math.min(backoff, RETRY_MAX_BACKOFF_MS);
};

const handleFailure = async (job: ImageJob, message: string): Promise<ImageJob | null> => {
  const retryable = isRetryableError(message);
  const exhausted = job.attempts >= job.maxAttempts;

  if (retryable && !exhausted) {
    const waitMs = getBackoffMs(job.attempts);
    logger.warn(
      {
        jobId: job.id,
        requestId: job.requestId,
        attempts: job.attempts,
        waitMs,
        error: message,
      },
      'Retrying image identification job'
    );
    return scheduleImageJobRetry(job.id, message, waitMs);
  }

  const reason = exhausted ? 'max-retries-exhausted' : 'non-retryable';
  logger.error(
    {
      jobId: job.id,
      requestId: job.requestId,
      reason,
      error: message,
    },
    'Moving image job to DLQ'
  );
  return moveImageJobToDlq(job.id, message, reason);
};

const processClaimedJob = async (job: ImageJob): Promise<ImageJob | null> => {
  try {
    logger.info({ jobId: job.id, requestId: job.requestId }, 'Processing image identification');
    const result = await identifyMachineFromImage(job.image);
    logger.info({ jobId: job.id, result }, 'Image identification completed');
    return markImageJobCompleted(job.id, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return handleFailure(job, message);
  }
};

const workerLoop = async () => {
  while (workerActive) {
    try {
      const claimed = await claimNextQueuedImageJob();
      if (claimed) {
        await processClaimedJob(claimed);
      } else {
        await wait(IDLE_WAIT_MS);
      }
    } catch (error) {
      logger.error({ err: error }, 'Image worker iteration failed');
      await wait(IDLE_WAIT_MS);
    }
  }
};

export const startImageJobWorker = () => {
  if (workerActive) return;
  workerActive = true;
  workerPromise = workerLoop().catch((error) => {
    logger.error({ err: error }, 'Image worker crashed');
  });
  logger.info('Image identification worker started');
};

export const stopImageJobWorker = async () => {
  workerActive = false;
  if (workerPromise) await workerPromise;
  workerPromise = null;
  logger.info('Image identification worker stopped');
};
