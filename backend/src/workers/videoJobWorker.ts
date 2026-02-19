import { checkVideoStatus, generateVideo } from '../services/geminiService.js';
import {
  claimNextQueuedVideoJob,
  claimVideoJob,
  markVideoJobCompleted,
  markVideoJobFailed,
  markVideoJobOperation,
  VideoJob,
} from '../services/videoJobService.js';
import { logger } from '../config/logger.js';

const IDLE_WAIT_MS = 1_000;
const POLL_WAIT_MS = 2_000;
const OPERATION_TIMEOUT_MS = 10 * 60 * 1_000;

let workerActive = false;
let workerPromise: Promise<void> | null = null;

const wait = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const extractOperationName = (operation: unknown): string | undefined => {
  if (
    typeof operation === 'object' &&
    operation &&
    'name' in operation &&
    typeof (operation as { name?: string }).name === 'string'
  ) {
    return (operation as { name: string }).name;
  }

  return undefined;
};

const isDone = (operation: unknown): boolean =>
  typeof operation === 'object' &&
  operation !== null &&
  'done' in operation &&
  Boolean((operation as { done?: boolean }).done);

const processClaimedJob = async (job: VideoJob): Promise<VideoJob | null> => {
  try {
    const operation = await generateVideo(job.prompt, job.image, job.aspectRatio);
    const operationName = extractOperationName(operation);
    await markVideoJobOperation(job.id, operation, operationName);

    if (!operationName) {
      if (isDone(operation)) {
        return markVideoJobCompleted(job.id, operation, operation);
      }

      return markVideoJobFailed(job.id, 'Missing operation name in video generation response');
    }

    const startedAtMs = Date.now();
    while (Date.now() - startedAtMs < OPERATION_TIMEOUT_MS) {
      const currentOp = await checkVideoStatus({ name: operationName });

      if (isDone(currentOp)) {
        return markVideoJobCompleted(job.id, currentOp, currentOp);
      }

      await markVideoJobOperation(job.id, currentOp, operationName);
      await wait(POLL_WAIT_MS);
    }

    return markVideoJobFailed(job.id, 'Video operation timed out');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return markVideoJobFailed(job.id, message);
  }
};

export const processVideoJobById = async (jobId: string): Promise<VideoJob | null> => {
  const claimed = await claimVideoJob(jobId);
  if (!claimed) {
    return null;
  }

  return processClaimedJob(claimed);
};

export const processNextQueuedVideoJob = async (): Promise<boolean> => {
  const claimed = await claimNextQueuedVideoJob();
  if (!claimed) {
    return false;
  }

  await processClaimedJob(claimed);
  return true;
};

const workerLoop = async () => {
  while (workerActive) {
    try {
      const processed = await processNextQueuedVideoJob();
      if (!processed) {
        await wait(IDLE_WAIT_MS);
      }
    } catch (error) {
      logger.error({ err: error }, 'Video worker iteration failed');
      await wait(IDLE_WAIT_MS);
    }
  }
};

export const startVideoJobWorker = () => {
  if (workerActive) {
    return;
  }

  workerActive = true;
  workerPromise = workerLoop().catch((error) => {
    logger.error({ err: error }, 'Video worker crashed unexpectedly');
  });
  logger.info('Video worker started');
};

export const stopVideoJobWorker = async () => {
  workerActive = false;
  if (workerPromise) {
    await workerPromise;
  }
  workerPromise = null;
  logger.info('Video worker stopped');
};

export const getVideoWorkerHealth = async () => {
  return {
    active: workerActive,
  };
};
