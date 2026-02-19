import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { generate, status } from '../src/controllers/videoController.js';

// Mock services
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
          image: { imageBytes: 'base64' }, // missing mimeType
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
          aspectRatio: '4:3', // invalid
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('AspectRatio must be either "16:9" or "9:16"');
    });

    it('should queue video generation and return 202 with jobId', async () => {
      vi.mocked(createVideoJob).mockResolvedValue({
        id: '4fd35841-b7ab-4381-a7d0-2be7008dcfd0',
        status: 'queued',
        requestId: 'req-123',
      } as any);

      const response = await request(app)
        .post('/api/video/generate')
        .send({
          prompt: 'Show machine repair process',
          image: { imageBytes: 'base64data', mimeType: 'image/jpeg' },
          aspectRatio: '16:9',
        });

      expect(response.status).toBe(202);
      expect(response.body).toEqual({
        jobId: '4fd35841-b7ab-4381-a7d0-2be7008dcfd0',
        status: 'queued',
        requestId: 'req-123',
      });
      expect(createVideoJob).toHaveBeenCalledWith(
        {
          prompt: 'Show machine repair process',
          image: { imageBytes: 'base64data', mimeType: 'image/jpeg' },
          aspectRatio: '16:9',
        },
        expect.any(String),
        undefined
      );
    });

    it('should handle generation errors', async () => {
      vi.mocked(createVideoJob).mockRejectedValue(new Error('Video generation failed'));

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
    it('should return 400 if operation and jobId are missing', async () => {
      const response = await request(app).post('/api/video/status').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('jobId or operation data is required');
    });

    it('should return job status for jobId', async () => {
      vi.mocked(refreshVideoJobStatus).mockResolvedValue({
        id: '4fd35841-b7ab-4381-a7d0-2be7008dcfd0',
        status: 'running',
        requestId: 'req-123',
        operationName: 'operations/video-123',
        result: undefined,
        error: undefined,
        createdAt: '2026-02-19T00:00:00.000Z',
        updatedAt: '2026-02-19T00:01:00.000Z',
      } as any);
      const response = await request(app)
        .post('/api/video/status')
        .send({
          jobId: '4fd35841-b7ab-4381-a7d0-2be7008dcfd0',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        jobId: '4fd35841-b7ab-4381-a7d0-2be7008dcfd0',
        status: 'running',
        requestId: 'req-123',
        operationName: 'operations/video-123',
        result: undefined,
        error: undefined,
        createdAt: '2026-02-19T00:00:00.000Z',
        updatedAt: '2026-02-19T00:01:00.000Z',
      });
    });

    it('should return 404 for unknown jobId', async () => {
      vi.mocked(refreshVideoJobStatus).mockResolvedValue(null);
      const response = await request(app)
        .post('/api/video/status')
        .send({
          jobId: '4fd35841-b7ab-4381-a7d0-2be7008dcfd0',
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Video job not found' });
    });

    it('should support legacy operation status checks with deprecated flag', async () => {
      const mockResult = {
        done: false,
        metadata: { state: 'PROCESSING', progressPercent: 50 },
      };

      vi.mocked(checkVideoStatus).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/video/status')
        .send({
          operation: { name: 'operations/video-123' },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockResult, deprecated: true });
      expect(checkVideoStatus).toHaveBeenCalledWith({ name: 'operations/video-123' });
    });

    it('should handle status check errors', async () => {
      vi.mocked(checkVideoStatus).mockRejectedValue(new Error('Status check failed'));

      const response = await request(app)
        .post('/api/video/status')
        .send({
          operation: { name: 'operations/video-789' },
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to check video status');
    });
  });
});
