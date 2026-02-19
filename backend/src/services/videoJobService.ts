import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { checkVideoStatus } from './geminiService.js';
import { logger } from '../config/logger.js';

export type VideoJobStatus = 'queued' | 'running' | 'failed' | 'completed';

export interface VideoJobPayload {
  prompt: string;
  image: {
    imageBytes: string;
    mimeType: string;
  };
  aspectRatio: '16:9' | '9:16';
}

export interface VideoJob {
  id: string;
  status: VideoJobStatus;
  requestId: string;
  prompt: string;
  image: {
    imageBytes: string;
    mimeType: string;
  };
  aspectRatio: '16:9' | '9:16';
  operationName?: string;
  operation?: unknown;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface VideoJobDb {
  jobs: VideoJob[];
}

const configuredDbPath = process.env.VIDEO_JOBS_DB_PATH;
const DB_PATH = configuredDbPath
  ? path.resolve(configuredDbPath)
  : path.resolve(process.cwd(), 'backend', 'data', 'video-jobs.json');
const DATA_DIR = path.dirname(DB_PATH);

let writeChain = Promise.resolve();

const enqueueWrite = async (operation: () => Promise<void>) => {
  writeChain = writeChain.then(operation).catch((error) => {
    logger.error({ err: error }, 'Failed to persist video jobs');
    throw error;
  });
  return writeChain;
};

const ensureDb = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: VideoJobDb = { jobs: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
};

const loadDb = async (): Promise<VideoJobDb> => {
  await ensureDb();
  const content = await fs.readFile(DB_PATH, 'utf-8');
  const parsed = JSON.parse(content) as Partial<VideoJobDb>;
  return parsed.jobs ? (parsed as VideoJobDb) : { jobs: [] };
};

const saveDb = async (db: VideoJobDb) => {
  await enqueueWrite(async () => {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  });
};

const findJob = (db: VideoJobDb, jobId: string) => db.jobs.find((job) => job.id === jobId);

const updateJobInDb = async (
  jobId: string,
  updater: (current: VideoJob) => VideoJob
): Promise<VideoJob | null> => {
  const db = await loadDb();
  const index = db.jobs.findIndex((job) => job.id === jobId);

  if (index < 0) {
    return null;
  }

  db.jobs[index] = updater({
    ...db.jobs[index],
    updatedAt: new Date().toISOString(),
  });

  await saveDb(db);
  return db.jobs[index];
};

export const createVideoJob = async (
  payload: VideoJobPayload,
  requestId: string,
  preferredJobId?: string
): Promise<VideoJob> => {
  const db = await loadDb();
  const now = new Date().toISOString();

  if (preferredJobId) {
    const existing = findJob(db, preferredJobId);
    if (existing) {
      return existing;
    }
  }

  const job: VideoJob = {
    id: preferredJobId || randomUUID(),
    status: 'queued',
    requestId,
    prompt: payload.prompt,
    image: payload.image,
    aspectRatio: payload.aspectRatio,
    createdAt: now,
    updatedAt: now,
  };

  db.jobs.push(job);
  await saveDb(db);
  return job;
};

export const getVideoJob = async (jobId: string): Promise<VideoJob | null> => {
  const db = await loadDb();
  return findJob(db, jobId) ?? null;
};

export const claimVideoJob = async (jobId: string): Promise<VideoJob | null> => {
  const current = await getVideoJob(jobId);
  if (!current || current.status !== 'queued') {
    return null;
  }

  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'running',
    startedAt: job.startedAt || new Date().toISOString(),
  }));
};

export const claimNextQueuedVideoJob = async (): Promise<VideoJob | null> => {
  const db = await loadDb();
  const nextQueued = db.jobs.find((job) => job.status === 'queued');

  if (!nextQueued) {
    return null;
  }

  return updateJobInDb(nextQueued.id, (job) => ({
    ...job,
    status: 'running',
    startedAt: job.startedAt || new Date().toISOString(),
  }));
};

export const markVideoJobOperation = async (
  jobId: string,
  operation: unknown,
  operationName?: string
): Promise<VideoJob | null> => {
  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'running',
    operation,
    operationName: operationName || job.operationName,
  }));
};

export const markVideoJobCompleted = async (
  jobId: string,
  result: unknown,
  operation?: unknown
): Promise<VideoJob | null> => {
  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'completed',
    result,
    operation: operation || job.operation,
    completedAt: new Date().toISOString(),
  }));
};

export const markVideoJobFailed = async (jobId: string, errorMessage: string): Promise<VideoJob | null> => {
  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'failed',
    error: errorMessage,
    completedAt: new Date().toISOString(),
  }));
};

export const refreshVideoJobStatus = async (jobId: string): Promise<VideoJob | null> => {
  const current = await getVideoJob(jobId);
  if (!current) {
    return null;
  }

  if (current.status !== 'running' || !current.operationName) {
    return current;
  }

  try {
    const operation = await checkVideoStatus({ name: current.operationName });
    const done =
      typeof operation === 'object' &&
      operation &&
      'done' in operation &&
      Boolean((operation as { done?: boolean }).done);

    const updated = await updateJobInDb(jobId, (job) => ({
      ...job,
      status: done ? 'completed' : 'running',
      result: done ? operation : job.result,
      operation,
      completedAt: done ? new Date().toISOString() : job.completedAt,
    }));

    return updated;
  } catch (error) {
    return markVideoJobFailed(
      jobId,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
