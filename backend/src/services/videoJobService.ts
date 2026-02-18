import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { checkVideoStatus, generateVideo } from './geminiService.js';
import { logger } from '../config/logger.js';

export type VideoJobStatus = 'queued' | 'running' | 'failed' | 'completed';

type VideoJobPayload = {
  prompt: string;
  image: {
    imageBytes: string;
    mimeType: string;
  };
  aspectRatio: '16:9' | '9:16';
};

export type VideoJob = {
  id: string;
  status: VideoJobStatus;
  requestId?: string;
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
};

type VideoJobDb = {
  jobs: VideoJob[];
};

const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data');
const DB_PATH = path.join(DATA_DIR, 'video-jobs.json');

const memoryQueue: string[] = [];
let queueRunning = false;
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
  const parsed = JSON.parse(content) as VideoJobDb;
  return parsed.jobs ? parsed : { jobs: [] };
};

const saveDb = async (db: VideoJobDb) => {
  await enqueueWrite(async () => {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  });
};

const findJob = (db: VideoJobDb, jobId: string) => db.jobs.find((job) => job.id === jobId);

const updateJobInDb = async (
  jobId: string,
  updater: (job: VideoJob) => VideoJob
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

const processJob = async (jobId: string) => {
  const started = await updateJobInDb(jobId, (job) => ({
    ...job,
    status: 'running',
    startedAt: new Date().toISOString(),
  }));

  if (!started) {
    return;
  }

  try {
    const operation = await generateVideo(started.prompt, started.image, started.aspectRatio);
    const operationName =
      typeof operation === 'object' &&
      operation &&
      'name' in operation &&
      typeof (operation as { name?: unknown }).name === 'string'
        ? (operation as { name: string }).name
        : undefined;

    await updateJobInDb(jobId, (job) => ({
      ...job,
      status: 'running',
      operationName,
      operation,
    }));
  } catch (error) {
    await updateJobInDb(jobId, (job) => ({
      ...job,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date().toISOString(),
    }));
  }
};

const processQueue = async () => {
  if (queueRunning) {
    return;
  }

  queueRunning = true;
  while (memoryQueue.length > 0) {
    const jobId = memoryQueue.shift();
    if (!jobId) {
      continue;
    }
    await processJob(jobId);
  }
  queueRunning = false;
};

export const createVideoJob = async (payload: VideoJobPayload, requestId?: string) => {
  const db = await loadDb();
  const now = new Date().toISOString();
  const job: VideoJob = {
    id: randomUUID(),
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

  memoryQueue.push(job.id);
  setImmediate(() => {
    void processQueue();
  });

  return job;
};

export const getVideoJob = async (jobId: string): Promise<VideoJob | null> => {
  const db = await loadDb();
  return findJob(db, jobId) ?? null;
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
      Boolean((operation as { done?: unknown }).done);

    const updated = await updateJobInDb(jobId, (job) => ({
      ...job,
      status: done ? 'completed' : 'running',
      result: done ? operation : job.result,
      operation,
      completedAt: done ? new Date().toISOString() : job.completedAt,
    }));

    return updated;
  } catch (error) {
    return updateJobInDb(jobId, (job) => ({
      ...job,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date().toISOString(),
    }));
  }
};
