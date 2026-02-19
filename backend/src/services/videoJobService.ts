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
  attempts: number;
  maxAttempts: number;
  nextRunAt?: string;
  lastError?: string;
  lastErrorAt?: string;
}

export interface VideoDlqEntry {
  id: string;
  jobId: string;
  requestId: string;
  failedAt: string;
  attempts: number;
  maxAttempts: number;
  error: string;
  reason: 'non-retryable' | 'max-retries-exhausted';
  jobSnapshot: VideoJob;
}

export interface VideoAsyncMetricsSnapshot {
  queueDepth: number;
  oldestQueuedAgeMs: number | null;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  retriesTotal: number;
  throughputLast5m: number;
  throughputPerMinuteLast5m: number;
  dlqSize: number;
}

interface VideoJobDb {
  jobs: VideoJob[];
  dlq: VideoDlqEntry[];
}

const configuredDbPath = process.env.VIDEO_JOBS_DB_PATH;
const DB_PATH = configuredDbPath
  ? path.resolve(configuredDbPath)
  : path.resolve(process.cwd(), 'backend', 'data', 'video-jobs.json');
const DATA_DIR = path.dirname(DB_PATH);
const DEFAULT_MAX_ATTEMPTS = 3;

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
    const initial: VideoJobDb = { jobs: [], dlq: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
};

const loadDb = async (): Promise<VideoJobDb> => {
  await ensureDb();
  const content = await fs.readFile(DB_PATH, 'utf-8');
  const parsed = JSON.parse(content) as Partial<VideoJobDb>;
  return {
    jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
    dlq: Array.isArray(parsed.dlq) ? parsed.dlq : [],
  };
};

const saveDb = async (db: VideoJobDb) => {
  await enqueueWrite(async () => {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  });
};

const findJob = (db: VideoJobDb, jobId: string) => db.jobs.find((job) => job.id === jobId);
const findDlq = (db: VideoJobDb, jobId: string) => db.dlq.find((entry) => entry.jobId === jobId);

const getConfiguredMaxAttempts = (): number => {
  const parsed = Number(process.env.VIDEO_JOB_MAX_ATTEMPTS ?? DEFAULT_MAX_ATTEMPTS);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_MAX_ATTEMPTS;
  }
  return Math.floor(parsed);
};

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
    attempts: 0,
    maxAttempts: getConfiguredMaxAttempts(),
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

export const claimNextQueuedVideoJob = async (): Promise<VideoJob | null> => {
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

export const markVideoJobFailed = async (
  jobId: string,
  errorMessage: string
): Promise<VideoJob | null> => {
  return updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'failed',
    error: errorMessage,
    lastError: errorMessage,
    lastErrorAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }));
};

export const scheduleVideoJobRetry = async (
  jobId: string,
  errorMessage: string,
  waitMs: number
): Promise<VideoJob | null> => {
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

export const moveVideoJobToDlq = async (
  jobId: string,
  errorMessage: string,
  reason: VideoDlqEntry['reason']
): Promise<VideoJob | null> => {
  const db = await loadDb();
  const job = findJob(db, jobId);

  if (!job) {
    return null;
  }

  const failedAt = new Date().toISOString();
  const updatedJob: VideoJob = {
    ...job,
    status: 'failed',
    error: errorMessage,
    lastError: errorMessage,
    lastErrorAt: failedAt,
    completedAt: failedAt,
    updatedAt: failedAt,
  };

  const entry: VideoDlqEntry = {
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

  const existingEntryIndex = db.dlq.findIndex((dlq) => dlq.jobId === jobId);
  if (existingEntryIndex >= 0) {
    db.dlq[existingEntryIndex] = entry;
  } else {
    db.dlq.push(entry);
  }

  const jobIndex = db.jobs.findIndex((current) => current.id === jobId);
  if (jobIndex >= 0) {
    db.jobs[jobIndex] = updatedJob;
  }

  await saveDb(db);
  return updatedJob;
};

export const listVideoDlqEntries = async (): Promise<VideoDlqEntry[]> => {
  const db = await loadDb();
  return db.dlq;
};

export const getVideoAsyncMetricsSnapshot = async (): Promise<VideoAsyncMetricsSnapshot> => {
  const db = await loadDb();
  const now = Date.now();
  const windowMs = 5 * 60 * 1_000;
  const queuedJobs = db.jobs.filter((job) => job.status === 'queued');
  const oldestQueued = queuedJobs.reduce<number | null>((min, job) => {
    const createdAtMs = Date.parse(job.createdAt);
    if (!Number.isFinite(createdAtMs)) {
      return min;
    }
    if (min === null) {
      return createdAtMs;
    }
    return Math.min(min, createdAtMs);
  }, null);

  const throughputLast5m = db.jobs.filter((job) => {
    if (job.status !== 'completed' || !job.completedAt) {
      return false;
    }
    const completedAtMs = Date.parse(job.completedAt);
    return Number.isFinite(completedAtMs) && completedAtMs >= now - windowMs;
  }).length;

  const retriesTotal = db.jobs.reduce((acc, job) => acc + Math.max(0, job.attempts - 1), 0);

  return {
    queueDepth: queuedJobs.length,
    oldestQueuedAgeMs: oldestQueued === null ? null : Math.max(0, now - oldestQueued),
    runningJobs: db.jobs.filter((job) => job.status === 'running').length,
    completedJobs: db.jobs.filter((job) => job.status === 'completed').length,
    failedJobs: db.jobs.filter((job) => job.status === 'failed').length,
    retriesTotal,
    throughputLast5m,
    throughputPerMinuteLast5m: Number((throughputLast5m / 5).toFixed(2)),
    dlqSize: db.dlq.length,
  };
};

export const redriveVideoJobFromDlq = async (
  jobId: string,
  requestId: string
): Promise<VideoJob | null> => {
  const db = await loadDb();
  const dlq = findDlq(db, jobId);
  if (!dlq) {
    return null;
  }

  const index = db.jobs.findIndex((job) => job.id === jobId);
  if (index < 0) {
    return null;
  }

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
    return markVideoJobFailed(jobId, error instanceof Error ? error.message : 'Unknown error');
  }
};
