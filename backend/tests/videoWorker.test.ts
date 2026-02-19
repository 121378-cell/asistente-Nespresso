import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

vi.mock('../src/services/geminiService.js', () => ({
  generateVideo: vi.fn(),
  checkVideoStatus: vi.fn(),
}));

import { checkVideoStatus, generateVideo } from '../src/services/geminiService.js';

const THIS_FILE_PATH = fileURLToPath(import.meta.url);
const TEST_DB_PATH = path.resolve(
  path.dirname(THIS_FILE_PATH),
  '..',
  'data',
  'video-jobs.worker-test.json'
);

const loadModules = async () => {
  vi.resetModules();
  const videoJobService = await import('../src/services/videoJobService.js');
  const videoJobWorker = await import('../src/workers/videoJobWorker.js');
  return { videoJobService, videoJobWorker };
};

describe('Video Worker', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.VIDEO_JOBS_DB_PATH = TEST_DB_PATH;
    process.env.VIDEO_JOB_RETRY_BASE_MS = '0';
    process.env.VIDEO_JOB_RETRY_MAX_MS = '0';

    try {
      await fs.unlink(TEST_DB_PATH);
    } catch {
      // File may not exist before test start.
    }
  });

  it('processes queued job and keeps idempotency by jobId', async () => {
    const { videoJobService, videoJobWorker } = await loadModules();

    vi.mocked(generateVideo).mockResolvedValue({ name: 'operations/video-123', done: false });
    vi.mocked(checkVideoStatus).mockResolvedValue({ done: true, response: { ok: true } });

    const fixedJobId = '4fd35841-b7ab-4381-a7d0-2be7008dcfd0';
    const created = await videoJobService.createVideoJob(
      {
        prompt: 'Create a repair video',
        image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
        aspectRatio: '16:9',
      },
      'req-test',
      fixedJobId
    );

    await videoJobWorker.processVideoJobById(created.id);
    await videoJobWorker.processVideoJobById(created.id);

    const stored = await videoJobService.getVideoJob(created.id);
    expect(stored?.status).toBe('completed');
    expect(generateVideo).toHaveBeenCalledTimes(1);
    expect(checkVideoStatus).toHaveBeenCalledTimes(1);
  });

  it('retries transient failures and completes without manual intervention', async () => {
    process.env.VIDEO_JOB_MAX_ATTEMPTS = '3';
    const { videoJobService, videoJobWorker } = await loadModules();

    vi.mocked(generateVideo)
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce({ name: 'operations/video-999', done: false });
    vi.mocked(checkVideoStatus).mockResolvedValue({ done: true, response: { ok: true } });

    const created = await videoJobService.createVideoJob(
      {
        prompt: 'Create a repair video',
        image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
        aspectRatio: '16:9',
      },
      'req-test'
    );

    await expect(videoJobWorker.processVideoJobById(created.id)).resolves.toBeTruthy();
    const afterFirstAttempt = await videoJobService.getVideoJob(created.id);
    expect(afterFirstAttempt?.status).toBe('queued');
    expect(afterFirstAttempt?.attempts).toBe(1);

    await expect(videoJobWorker.processNextQueuedVideoJob()).resolves.toBe(true);
    const stored = await videoJobService.getVideoJob(created.id);
    expect(stored?.status).toBe('completed');
    expect(stored?.attempts).toBe(2);
    expect(generateVideo).toHaveBeenCalledTimes(2);

    const dlqEntries = await videoJobService.listVideoDlqEntries();
    expect(dlqEntries).toHaveLength(0);
  });

  it('moves non-retryable failures to DLQ and allows manual redrive', async () => {
    process.env.VIDEO_JOB_MAX_ATTEMPTS = '2';
    const { videoJobService, videoJobWorker } = await loadModules();

    vi.mocked(generateVideo)
      .mockRejectedValueOnce(new Error('Invalid prompt format'))
      .mockResolvedValueOnce({ name: 'operations/video-1000', done: false });
    vi.mocked(checkVideoStatus).mockResolvedValue({ done: true, response: { ok: true } });

    const created = await videoJobService.createVideoJob(
      {
        prompt: 'Create a repair video',
        image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
        aspectRatio: '16:9',
      },
      'req-test'
    );

    await expect(videoJobWorker.processVideoJobById(created.id)).resolves.toBeTruthy();

    const failed = await videoJobService.getVideoJob(created.id);
    expect(failed?.status).toBe('failed');
    expect(failed?.error).toContain('Invalid prompt format');

    const dlqEntries = await videoJobService.listVideoDlqEntries();
    expect(dlqEntries).toHaveLength(1);
    expect(dlqEntries[0]?.jobId).toBe(created.id);

    const redriven = await videoJobService.redriveVideoJobFromDlq(created.id, 'req-redrive');
    expect(redriven?.status).toBe('queued');
    expect(redriven?.requestId).toBe('req-redrive');

    await expect(videoJobWorker.processVideoJobById(created.id)).resolves.toBeTruthy();
    const completed = await videoJobService.getVideoJob(created.id);
    expect(completed?.status).toBe('completed');
  });
});
