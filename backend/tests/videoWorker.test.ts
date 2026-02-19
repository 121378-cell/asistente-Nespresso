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

  it('marks failed jobs without throwing to caller', async () => {
    const { videoJobService, videoJobWorker } = await loadModules();

    vi.mocked(generateVideo).mockRejectedValue(new Error('Provider unavailable'));

    const created = await videoJobService.createVideoJob(
      {
        prompt: 'Create a repair video',
        image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
        aspectRatio: '16:9',
      },
      'req-test'
    );

    await expect(videoJobWorker.processVideoJobById(created.id)).resolves.toBeTruthy();
    const stored = await videoJobService.getVideoJob(created.id);
    expect(stored?.status).toBe('failed');
    expect(stored?.error).toContain('Provider unavailable');
  });
});
