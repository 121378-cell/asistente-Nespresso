import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

interface TestMessage {
  role: 'USER' | 'MODEL';
  text: string;
  id?: string;
  attachment?: { url: string; type: string } | null;
  groundingMetadata?: { groundingChunks: unknown[] } | null;
  createdAt?: Date;
}

// Create mock Prisma functions using vi.hoisted to ensure they're available before module imports
const { mockFindMany, mockFindUnique, mockCreate, mockUpdate, mockDelete, mockDisconnect } =
  vi.hoisted(() => ({
    mockFindMany: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockDisconnect: vi.fn(),
  }));

// Mock @prisma/client BEFORE importing the controller
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(function PrismaClientMock() {
    return {
      savedRepair: {
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
      },
      $disconnect: mockDisconnect,
    };
  }),
}));

// NOW import the controller - it will use our mocked Prisma
import {
  getAllRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  deleteRepair,
} from '../src/controllers/repairsController.js';

// Helper function to create Prisma errors with proper structure
class PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, any>;
  clientVersion: string;

  constructor(
    message: string,
    code: string,
    clientVersion: string = '5.0.0',
    meta?: Record<string, any>
  ) {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = code;
    this.clientVersion = clientVersion;
    this.meta = meta;
  }
}

describe('Repairs Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.get('/api/repairs', getAllRepairs);
    app.get('/api/repairs/:id', getRepairById);
    app.post('/api/repairs', createRepair);
    app.put('/api/repairs/:id', updateRepair);
    app.delete('/api/repairs/:id', deleteRepair);
  });

  describe('GET /api/repairs', () => {
    it('should return all repairs with first message preview', async () => {
      const mockRepairs = [
        {
          id: '1',
          name: 'Repair 1',
          machineModel: 'Gemini CS2',
          serialNumber: 'SN123',
          timestamp: new Date('2024-01-01'),
          messages: [{ id: 'm1', role: 'USER', text: 'First message' }],
        },
        {
          id: '2',
          name: 'Repair 2',
          machineModel: 'Momento 200',
          serialNumber: 'SN456',
          timestamp: new Date('2024-01-02'),
          messages: [{ id: 'm2', role: 'USER', text: 'Another message' }],
        },
      ];

      mockFindMany.mockResolvedValue(mockRepairs);

      const response = await request(app).get('/api/repairs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'Repair 1');
      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { timestamp: 'desc' },
        include: {
          messages: {
            select: { id: true, role: true, text: true },
            take: 1,
          },
        },
      });
    });

    it('should handle database errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/repairs');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch repairs');
    });
  });

  describe('GET /api/repairs/:id', () => {
    it('should return specific repair with all messages', async () => {
      const mockRepair: {
        id: string;
        name: string;
        machineModel: string;
        serialNumber: string;
        timestamp: Date;
        messages: TestMessage[];
      } = {
        id: '1',
        name: 'Test Repair',
        machineModel: 'Gemini CS2',
        serialNumber: 'SN123',
        timestamp: new Date('2024-01-01'),
        messages: [
          {
            role: 'USER',
            text: 'Machine not working',
            attachment: { url: 'image.jpg', type: 'image/jpeg' },
            groundingMetadata: null,
            createdAt: new Date('2024-01-01T10:00:00'),
          },
          {
            role: 'MODEL',
            text: 'Let me help you',
            attachment: null,
            groundingMetadata: { groundingChunks: [] },
            createdAt: new Date('2024-01-01T10:01:00'),
          },
        ],
      };

      mockFindUnique.mockResolvedValue(mockRepair);

      const response = await request(app).get('/api/repairs/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name', 'Test Repair');
      expect(response.body.messages).toHaveLength(2);
      expect(response.body.messages[0]).toHaveProperty('attachment');
      expect(response.body.timestamp).toBe(new Date('2024-01-01').getTime());
    });

    it('should return 404 if repair not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/repairs/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Repair not found');
    });

    it('should handle database errors', async () => {
      mockFindUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/repairs/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch repair');
    });
  });

  describe('POST /api/repairs', () => {
    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/repairs')
        .send({ messages: [{ role: 'USER', text: 'test' }] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if messages are missing', async () => {
      const response = await request(app).post('/api/repairs').send({ name: 'Test Repair' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if messages array is empty', async () => {
      const response = await request(app)
        .post('/api/repairs')
        .send({ name: 'Test Repair', messages: [] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should successfully create a repair', async () => {
      const newRepair: {
        name: string;
        machineModel: string;
        serialNumber: string;
        messages: TestMessage[];
        timestamp: number;
      } = {
        name: 'New Repair',
        machineModel: 'Gemini CS2',
        serialNumber: 'SN789',
        messages: [
          { role: 'USER', text: 'Help needed' },
          { role: 'MODEL', text: 'I can help' },
        ],
        timestamp: Date.now(),
      };

      const mockCreatedRepair = {
        id: 'new-id',
        ...newRepair,
        timestamp: new Date(newRepair.timestamp),
        messages: newRepair.messages.map((msg: TestMessage, i: number) => ({
          ...msg,
          id: `msg-${i}`,
          attachment: (msg.attachment ?? null) as TestMessage['attachment'],
          groundingMetadata: (msg.groundingMetadata ?? null) as TestMessage['groundingMetadata'],
        })),
      };

      mockCreate.mockResolvedValue(mockCreatedRepair);

      const response = await request(app).post('/api/repairs').send(newRepair);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'new-id');
      expect(response.body).toHaveProperty('name', 'New Repair');
      expect(response.body.messages).toHaveLength(2);
    });

    it('should create repair with attachments', async () => {
      const newRepair: {
        name: string;
        machineModel: string | null;
        serialNumber: string | null;
        messages: TestMessage[];
        timestamp: number;
      } = {
        name: 'Repair with Image',
        machineModel: null,
        serialNumber: null,
        messages: [
          {
            role: 'USER',
            text: 'See this issue',
            attachment: { url: 'photo.jpg', type: 'image/jpeg' },
          },
        ],
        timestamp: Date.now(),
      };

      const mockCreatedRepair = {
        id: 'new-id',
        ...newRepair,
        timestamp: new Date(newRepair.timestamp),
        messages: [
          {
            ...newRepair.messages[0],
            id: 'msg-1',
            groundingMetadata: null as TestMessage['groundingMetadata'],
          },
        ],
      };

      mockCreate.mockResolvedValue(mockCreatedRepair);

      const response = await request(app).post('/api/repairs').send(newRepair);

      expect(response.status).toBe(201);
      expect(response.body.messages[0]).toHaveProperty('attachment');
    });

    it('should handle creation errors', async () => {
      mockCreate.mockRejectedValue(new Error('Creation failed'));

      const response = await request(app)
        .post('/api/repairs')
        .send({
          name: 'Test',
          messages: [{ role: 'USER', text: 'test' }],
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create repair');
    });
  });

  describe('PUT /api/repairs/:id', () => {
    it('should successfully update repair name', async () => {
      const mockUpdatedRepair = {
        id: '1',
        name: 'Updated Name',
        machineModel: 'Gemini CS2',
        serialNumber: 'SN123',
        timestamp: new Date(),
        messages: [] as TestMessage[],
      };

      mockUpdate.mockResolvedValue(mockUpdatedRepair);

      const response = await request(app).put('/api/repairs/1').send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Name');
    });

    it('should return 404 if repair not found', async () => {
      const error = new PrismaClientKnownRequestError(
        'Record to update not found.',
        'P2025',
        '5.0.0',
        { cause: 'Record to update does not exist.' }
      );
      mockUpdate.mockRejectedValue(error);

      const response = await request(app).put('/api/repairs/999').send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Repair not found');
    });

    it('should handle update errors', async () => {
      mockUpdate.mockRejectedValue(new Error('Update failed'));

      const response = await request(app).put('/api/repairs/1').send({ name: 'New Name' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update repair');
    });
  });

  describe('DELETE /api/repairs/:id', () => {
    it('should successfully delete repair', async () => {
      mockDelete.mockResolvedValue({ id: '1' });

      const response = await request(app).delete('/api/repairs/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Repair deleted successfully');
    });

    it('should return 404 if repair not found', async () => {
      const error = new PrismaClientKnownRequestError(
        'Record to delete not found.',
        'P2025',
        '5.0.0',
        { cause: 'Record to delete does not exist.' }
      );
      mockDelete.mockRejectedValue(error);

      const response = await request(app).delete('/api/repairs/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Repair not found');
    });

    it('should handle deletion errors', async () => {
      mockDelete.mockRejectedValue(new Error('Delete failed'));

      const response = await request(app).delete('/api/repairs/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to delete repair');
    });
  });
});
