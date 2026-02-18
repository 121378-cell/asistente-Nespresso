import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { generate, status } from '../src/controllers/videoController.js';

vi.mock('../src/services/geminiService.js', () => ({
  checkVideoStatus: vi.fn(),
}));

vi.mock('../src/services/videoJobService.js', () => ({
  createVideoJob: vi.fn(),
  refreshVideoJobStatus: vi.fn(),
}));

import { checkVideoStatus } from '../src/services/geminiService.js';
import { createVideoJob, refreshVideoJobStatus } from '../src/services/videoJobService.js';

describe('Video Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.post('/api/video/generate', generate);
    app.post('/api/video/status', status);
  });

  describe('POST /api/video/generate', () => {
    it('should return 400 if prompt is missing', async () => {
      const response = await request(app)
        .post('/api/video/generate')
        .send({
          image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
          aspectRatio: '16:9',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Prompt is required');
    });

    it('should return 400 if prompt is not a string', async () => {
      const response = await request(app)
        .post('/api/video/generate')
        .send({
          prompt: 123,
          image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
          aspectRatio: '16:9',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if image data is missing', async () => {
      const response = await request(app).post('/api/video/generate').send({
        prompt: 'Create a video',
        aspectRatio: '16:9',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Image data is required');
    });

    it('should return 400 if image is incomplete', async () => {
      const response = await request(app)
        .post('/api/video/generate')
        .send({
          prompt: 'Create a video',
          image: { imageBytes: 'base64' },
          aspectRatio: '16:9',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if aspectRatio is invalid', async () => {
      const response = await request(app)
        .post('/api/video/generate')
        .send({
          prompt: 'Create a video',
          image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
          aspectRatio: '4:3',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('AspectRatio must be either "16:9" or "9:16"');
    });

    it('should enqueue video job and return 202 with job id', async () => {
      vi.mocked(createVideoJob).mockResolvedValue({
        id: '8f22f7e8-7ded-4fb6-b5a3-0354e305994c',
        status: 'queued',
      } as any);

      const response = await request(app)
        .post('/api/video/generate')
        .send({
          prompt: 'Show machine repair process',
          image: { imageBytes: 'base64data', mimeType: 'image/jpeg' },
          aspectRatio: '16:9',
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('jobId', '8f22f7e8-7ded-4fb6-b5a3-0354e305994c');
      expect(response.body).toHaveProperty('status', 'queued');
      expect(createVideoJob).toHaveBeenCalledWith(
        {
          prompt: 'Show machine repair process',
          image: { imageBytes: 'base64data', mimeType: 'image/jpeg' },
          aspectRatio: '16:9',
        },
        expect.any(String)
      );
    });

    it('should handle enqueue errors', async () => {
      vi.mocked(createVideoJob).mockRejectedValue(new Error('Queue unavailable'));

      const response = await request(app)
        .post('/api/video/generate')
        .send({
          prompt: 'Test',
          image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
          aspectRatio: '16:9',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to generate video');
    });
  });

  describe('POST /api/video/status', () => {
    it('should return 400 if jobId and operation are missing', async () => {
      const response = await request(app).post('/api/video/status').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'jobId or operation data is required');
    });

    it('should return job status when jobId is provided', async () => {
      vi.mocked(refreshVideoJobStatus).mockResolvedValue({
        id: '8f22f7e8-7ded-4fb6-b5a3-0354e305994c',
        status: 'running',
        requestId: 'req-123',
        operationName: 'operations/video-123',
        createdAt: '2026-02-18T00:00:00.000Z',
        updatedAt: '2026-02-18T00:00:01.000Z',
      } as any);

      const response = await request(app).post('/api/video/status').send({
        jobId: '8f22f7e8-7ded-4fb6-b5a3-0354e305994c',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobId', '8f22f7e8-7ded-4fb6-b5a3-0354e305994c');
      expect(response.body).toHaveProperty('status', 'running');
      expect(refreshVideoJobStatus).toHaveBeenCalledWith('8f22f7e8-7ded-4fb6-b5a3-0354e305994c');
    });

    it('should return 404 when jobId does not exist', async () => {
      vi.mocked(refreshVideoJobStatus).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/video/status')
        .send({
          jobId: '8f22f7e8-7ded-4fb6-b5a3-0354e305994c',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Video job not found');
    });

    it('should support legacy operation status requests', async () => {
      const mockResult = { done: false, metadata: { state: 'PROCESSING' } };
      vi.mocked(checkVideoStatus).mockResolvedValue(mockResult as any);

      const response = await request(app)
        .post('/api/video/status')
        .send({
          operation: { name: 'operations/video-789' },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deprecated', true);
      expect(checkVideoStatus).toHaveBeenCalledWith({ name: 'operations/video-789' });
    });
  });
});
