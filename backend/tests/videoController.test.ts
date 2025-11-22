import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { generate, status } from '../src/controllers/videoController.js';

// Mock Gemini service
vi.mock('../src/services/geminiService.js', () => ({
    generateVideo: vi.fn(),
    checkVideoStatus: vi.fn(),
}));

import { generateVideo, checkVideoStatus } from '../src/services/geminiService.js';

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
                    aspectRatio: '16:9'
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
                    aspectRatio: '16:9'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 if image data is missing', async () => {
            const response = await request(app)
                .post('/api/video/generate')
                .send({
                    prompt: 'Create a video',
                    aspectRatio: '16:9'
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
                    aspectRatio: '16:9'
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
                    aspectRatio: '4:3' // invalid
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('AspectRatio must be either "16:9" or "9:16"');
        });

        it('should successfully generate video with 16:9 aspect ratio', async () => {
            const mockOperation = {
                name: 'operations/video-123',
                metadata: { state: 'PROCESSING' }
            };

            vi.mocked(generateVideo).mockResolvedValue(mockOperation);

            const response = await request(app)
                .post('/api/video/generate')
                .send({
                    prompt: 'Show machine repair process',
                    image: { imageBytes: 'base64data', mimeType: 'image/jpeg' },
                    aspectRatio: '16:9'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockOperation);
            expect(generateVideo).toHaveBeenCalledWith(
                'Show machine repair process',
                { imageBytes: 'base64data', mimeType: 'image/jpeg' },
                '16:9'
            );
        });

        it('should successfully generate video with 9:16 aspect ratio', async () => {
            const mockOperation = {
                name: 'operations/video-456',
                metadata: { state: 'PROCESSING' }
            };

            vi.mocked(generateVideo).mockResolvedValue(mockOperation);

            const response = await request(app)
                .post('/api/video/generate')
                .send({
                    prompt: 'Vertical video tutorial',
                    image: { imageBytes: 'base64data', mimeType: 'image/png' },
                    aspectRatio: '9:16'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockOperation);
        });

        it('should handle generation errors', async () => {
            vi.mocked(generateVideo).mockRejectedValue(new Error('Video generation failed'));

            const response = await request(app)
                .post('/api/video/generate')
                .send({
                    prompt: 'Test',
                    image: { imageBytes: 'base64', mimeType: 'image/jpeg' },
                    aspectRatio: '16:9'
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to generate video');
        });
    });

    describe('POST /api/video/status', () => {
        it('should return 400 if operation is missing', async () => {
            const response = await request(app)
                .post('/api/video/status')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Operation data is required');
        });

        it('should successfully check video status - processing', async () => {
            const mockResult = {
                done: false,
                metadata: { state: 'PROCESSING', progressPercent: 50 }
            };

            vi.mocked(checkVideoStatus).mockResolvedValue(mockResult);

            const response = await request(app)
                .post('/api/video/status')
                .send({
                    operation: { name: 'operations/video-123' }
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResult);
            expect(checkVideoStatus).toHaveBeenCalledWith({ name: 'operations/video-123' });
        });

        it('should successfully check video status - completed', async () => {
            const mockResult = {
                done: true,
                response: {
                    generatedSamples: [{
                        video: { uri: 'https://example.com/video.mp4' }
                    }]
                }
            };

            vi.mocked(checkVideoStatus).mockResolvedValue(mockResult);

            const response = await request(app)
                .post('/api/video/status')
                .send({
                    operation: { name: 'operations/video-456' }
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResult);
        });

        it('should handle status check errors', async () => {
            vi.mocked(checkVideoStatus).mockRejectedValue(new Error('Status check failed'));

            const response = await request(app)
                .post('/api/video/status')
                .send({
                    operation: { name: 'operations/video-789' }
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to check video status');
        });
    });
});
