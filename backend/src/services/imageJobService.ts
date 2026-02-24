import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger.js';

export type JobStatus = 'queued' | 'running' | 'failed' | 'completed';

export interface ImageJob {
  id: string;
  status: JobStatus;
  requestId: string;
  image: string; // base64
  result?: {
    model: string;
    serialNumber: string;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  attempts: number;
  maxAttempts: number;
  nextRunAt?: string;
  lastError?: string;
  lastErrorAt?: string;
}

export interface ImageDlqEntry {
  id: string;
  jobId: string;
  requestId: string;
  failedAt: string;
  attempts: number;
  maxAttempts: number;
  error: string;
  reason: 'non-retryable' | 'max-retries-exhausted';
  jobSnapshot: ImageJob;
}

interface ImageJobDb {
  jobs: ImageJob[];
  dlq: ImageDlqEntry[];
}

const configuredDbPath = process.env.IMAGE_JOBS_DB_PATH;
const DB_PATH = configuredDbPath
  ? path.resolve(configuredDbPath)
  : path.resolve(process.cwd(), 'backend', 'data', 'image-jobs.json');
const DATA_DIR = path.dirname(DB_PATH);
const DEFAULT_MAX_ATTEMPTS = 3;

let writeChain = Promise.resolve();

const enqueueWrite = async (operation: () => Promise<void>) => {
  writeChain = writeChain.then(operation).catch((error) => {
    logger.error({ err: error }, 'Failed to persist image jobs');
    throw error;
  });
  return writeChain;
};

const ensureDb = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: ImageJobDb = { jobs: [], dlq: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
};

const loadDb = async (): Promise<ImageJobDb> => {
  await ensureDb();
  const content = await fs.readFile(DB_PATH, 'utf-8');
  const parsed = JSON.parse(content) as Partial<ImageJobDb>;
  return {
    jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
    dlq: Array.isArray(parsed.dlq) ? parsed.dlq : [],
  };
};

const saveDb = async (db: ImageJobDb) => {
  await enqueueWrite(async () => {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  });
};

const findJob = (db: ImageJobDb, jobId: string) => db.jobs.find((job) => job.id === jobId);

const updateJobInDb = async (
  jobId: string,
  updater: (current: ImageJob) => ImageJob
): Promise<ImageJob | null> => {
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

export const createImageJob = async (image: string, requestId: string): Promise<ImageJob> => {
  const db = await loadDb();
  const now = new Date().toISOString();

  const job: ImageJob = {
    id: randomUUID(),
    status: 'queued',
    requestId,
    image,
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
  };

  db.jobs.push(job);
  await saveDb(db);
  return job;
};

export const getImageJob = async (jobId: string): Promise<ImageJob | null> => {
  const db = await loadDb();
  return findJob(db, jobId) ?? null;
};

export const claimImageJob = async (jobId: string): Promise<ImageJob | null> => {
  const current = await getImageJob(jobId);
  if (!current || current.status !== 'queued') {
    return null;
  }
  if (current.nextRunAt && Date.parse(current.nextRunAt) > Date.now()) {
    return null;
  }

  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'running',
    startedAt: job.startedAt || new Date().toISOString(),
    attempts: job.attempts + 1,
    nextRunAt: undefined,
  }));
};

export const claimNextQueuedImageJob = async (): Promise<ImageJob | null> => {
  const db = await loadDb();
  const now = Date.now();
  const nextQueued = db.jobs
    .filter((job) => job.status === 'queued')
    .find((job) => !job.nextRunAt || Date.parse(job.nextRunAt) <= now);

  if (!nextQueued) {
    return null;
  }

  return updateJobInDb(nextQueued.id, (job) => ({
    ...job,
    status: 'running',
    startedAt: job.startedAt || new Date().toISOString(),
    attempts: job.attempts + 1,
    nextRunAt: undefined,
  }));
};

export const markImageJobCompleted = async (
  jobId: string,
  result: { model: string; serialNumber: string }
): Promise<ImageJob | null> => {
  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'completed',
    result,
    completedAt: new Date().toISOString(),
  }));
};

export const markImageJobFailed = async (
  jobId: string,
  errorMessage: string
): Promise<ImageJob | null> => {
  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'failed',
    error: errorMessage,
    lastError: errorMessage,
    lastErrorAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }));
};

export const scheduleImageJobRetry = async (
  jobId: string,
  errorMessage: string,
  waitMs: number
): Promise<ImageJob | null> => {
  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'queued',
    error: undefined,
    completedAt: undefined,
    nextRunAt: new Date(Date.now() + waitMs).toISOString(),
    lastError: errorMessage,
    lastErrorAt: new Date().toISOString(),
  }));
};

export const moveImageJobToDlq = async (
  jobId: string,
  errorMessage: string,
  reason: ImageDlqEntry['reason']
): Promise<ImageJob | null> => {
  const db = await loadDb();
  const job = findJob(db, jobId);

  if (!job) {
    return null;
  }

  const failedAt = new Date().toISOString();
  const updatedJob: ImageJob = {
    ...job,
    status: 'failed',
    error: errorMessage,
    lastError: errorMessage,
    lastErrorAt: failedAt,
    completedAt: failedAt,
    updatedAt: failedAt,
  };

  const entry: ImageDlqEntry = {
    id: randomUUID(),
    jobId: updatedJob.id,
    requestId: updatedJob.requestId,
    failedAt,
    attempts: updatedJob.attempts,
    maxAttempts: updatedJob.maxAttempts,
    error: errorMessage,
    reason,
    jobSnapshot: updatedJob,
  };

  db.dlq.push(entry);
  const jobIndex = db.jobs.findIndex((current) => current.id === jobId);
  if (jobIndex >= 0) db.jobs[jobIndex] = updatedJob;

  await saveDb(db);
  return updatedJob;
};

export const listImageJobs = async (): Promise<ImageJob[]> => {
  const db = await loadDb();
  return db.jobs;
};

export const listImageDlqEntries = async (): Promise<ImageDlqEntry[]> => {
  const db = await loadDb();
  return db.dlq;
};

export const redriveImageJobFromDlq = async (
  jobId: string,
  requestId: string
): Promise<ImageJob | null> => {
  const db = await loadDb();
  const index = db.jobs.findIndex((job) => job.id === jobId);
  if (index < 0) return null;

  const now = new Date().toISOString();
  db.jobs[index] = {
    ...db.jobs[index],
    status: 'queued',
    requestId,
    updatedAt: now,
    error: undefined,
    completedAt: undefined,
    nextRunAt: undefined,
    lastError: undefined,
    lastErrorAt: undefined,
    attempts: 0,
  };
  db.dlq = db.dlq.filter((entry) => entry.jobId !== jobId);

  await saveDb(db);
  return db.jobs[index];
};

export const getImageAsyncMetricsSnapshot = async (): Promise<any> => {
  const db = await loadDb();
  return {
    queueDepth: db.jobs.filter((j) => j.status === 'queued').length,
    runningJobs: db.jobs.filter((j) => j.status === 'running').length,
    completedJobs: db.jobs.filter((j) => j.status === 'completed').length,
    failedJobs: db.jobs.filter((j) => j.status === 'failed').length,
    dlqSize: db.dlq.length,
  };
};
