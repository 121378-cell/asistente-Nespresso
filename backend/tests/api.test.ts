import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock Prisma client
vi.mock('@prisma/client', () => ({
    PrismaClient: vi.fn(() => ({
        savedRepair: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        message: {
            createMany: vi.fn(),
        },
        $disconnect: vi.fn(),
    })),
}));

describe('Health Check Endpoint', () => {
    it('should return 200 and status ok', async () => {
        const app = express();
        app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
    });
});

describe('Analytics Endpoint - Predefined Queries', () => {
    it('should reject invalid query types', async () => {
        const app = express();
        app.use(express.json());
        app.post('/api/analytics/query', (req, res) => {
            const { queryType } = req.body;

            const validQueries = [
                'repairs_by_date_range',
                'repairs_by_model',
                'message_count_by_repair',
                'recent_repairs',
                'repairs_with_attachments'
            ];

            if (!queryType || !validQueries.includes(queryType)) {
                return res.status(400).json({
                    error: 'Invalid query type',
                    availableQueries: validQueries
                });
            }

            res.json({ result: [] });
        });

        const response = await request(app)
            .post('/api/analytics/query')
            .send({ queryType: 'invalid_query' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('availableQueries');
    });

    it('should accept valid query types', async () => {
        const app = express();
        app.use(express.json());
        app.post('/api/analytics/query', (req, res) => {
            const { queryType } = req.body;

            const validQueries = [
                'repairs_by_date_range',
                'repairs_by_model',
                'message_count_by_repair',
                'recent_repairs',
                'repairs_with_attachments'
            ];

            if (!queryType || !validQueries.includes(queryType)) {
                return res.status(400).json({ error: 'Invalid query type' });
            }

            res.json({ result: [] });
        });

        const response = await request(app)
            .post('/api/analytics/query')
            .send({ queryType: 'recent_repairs', params: { limit: 10 } });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('result');
    });
});
