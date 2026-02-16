import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { chat, identifyMachine } from '../src/controllers/chatController.js';

// Mock Gemini service
vi.mock('../src/services/geminiService.js', () => ({
  generateResponse: vi.fn(),
  identifyMachineFromImage: vi.fn(),
}));

import { generateResponse, identifyMachineFromImage } from '../src/services/geminiService.js';

describe('Chat Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.post('/api/chat', chat);
    app.post('/api/chat/identify-machine', identifyMachine);
  });

  describe('POST /api/chat', () => {
    it('should return 400 if message is missing', async () => {
      const response = await request(app).post('/api/chat').send({ history: [] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Message is required');
    });

    it('should return 400 if message is not a string', async () => {
      const response = await request(app).post('/api/chat').send({ history: [], message: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if history is not an array', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ history: 'not-an-array', message: 'test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('History must be an array');
    });

    it('should successfully generate a response', async () => {
      const mockResponse = {
        text: 'Test response',
        candidates: [
          {
            groundingMetadata: {
              groundingChunks: [{ web: { uri: 'https://example.com', title: 'Example' } }],
            },
          },
        ],
      };

      vi.mocked(generateResponse).mockResolvedValue(mockResponse as any);

      const response = await request(app)
        .post('/api/chat')
        .send({
          history: [{ role: 'user', text: 'Hello' }],
          message: 'How do I fix my machine?',
          useGoogleSearch: true,
          machineModel: 'Gemini CS2',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('text', 'Test response');
      expect(response.body).toHaveProperty('groundingMetadata');
      expect(generateResponse).toHaveBeenCalledWith(
        [{ role: 'user', text: 'Hello' }],
        'How do I fix my machine?',
        undefined,
        true,
        'Gemini CS2'
      );
    });

    it('should handle file attachments', async () => {
      const mockResponse = {
        text: 'Image analyzed',
        candidates: [] as unknown[],
      };

      vi.mocked(generateResponse).mockResolvedValue(mockResponse as any);

      const response = await request(app)
        .post('/api/chat')
        .send({
          history: [],
          message: 'What is this part?',
          file: {
            mimeType: 'image/jpeg',
            data: 'base64encodeddata',
          },
        });

      expect(response.status).toBe(200);
      expect(generateResponse).toHaveBeenCalledWith(
        [],
        'What is this part?',
        { mimeType: 'image/jpeg', data: 'base64encodeddata' },
        undefined,
        undefined
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(generateResponse).mockRejectedValue(new Error('API Error'));

      const response = await request(app).post('/api/chat').send({
        history: [],
        message: 'test',
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to generate response');
    });
  });

  describe('POST /api/chat/identify-machine', () => {
    it('should return 400 if image is missing', async () => {
      const response = await request(app).post('/api/chat/identify-machine').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Image data is required');
    });

    it('should return 400 if image is not a string', async () => {
      const response = await request(app).post('/api/chat/identify-machine').send({ image: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should successfully identify machine', async () => {
      const mockResult = {
        model: 'Gemini CS2',
        serialNumber: 'SN123456',
      };

      vi.mocked(identifyMachineFromImage).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/chat/identify-machine')
        .send({ image: 'base64imagedata' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(identifyMachineFromImage).toHaveBeenCalledWith('base64imagedata');
    });

    it('should handle identification errors', async () => {
      vi.mocked(identifyMachineFromImage).mockRejectedValue(new Error('Cannot identify'));

      const response = await request(app)
        .post('/api/chat/identify-machine')
        .send({ image: 'base64imagedata' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to identify machine');
    });
  });
});
