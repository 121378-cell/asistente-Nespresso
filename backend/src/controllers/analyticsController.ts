import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/analytics/stats - Obtener estadísticas generales
export const getStats = async (req: Request, res: Response) => {
    try {
        const [totalRepairs, totalMessages, recentRepairs] = await Promise.all([
            prisma.savedRepair.count(),
            prisma.message.count(),
            prisma.savedRepair.count({
                where: {
                    timestamp: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
                    },
                },
            }),
        ]);

        // Reparaciones por modelo
        const repairsByModel = await prisma.savedRepair.groupBy({
            by: ['machineModel'],
            _count: {
                machineModel: true,
            },
            orderBy: {
                _count: {
                    machineModel: 'desc',
                },
            },
        });

        // Reparaciones por mes (Procesado en JS para evitar errores de SQL raw)
        const allRepairs = await prisma.savedRepair.findMany({
            select: { timestamp: true }
        });

        const repairsByMonthMap = new Map<string, number>();
        allRepairs.forEach((r: any) => {
            try {
                const date = new Date(r.timestamp);
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01T00:00:00.000Z`;
                repairsByMonthMap.set(month, (repairsByMonthMap.get(month) || 0) + 1);
            } catch (e) {
                console.warn('Invalid date in repair:', r);
            }
        });

        const repairsByMonth = Array.from(repairsByMonthMap.entries())
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => b.month.localeCompare(a.month))
            .slice(0, 12);

        res.json({
            totalRepairs,
            totalMessages,
            recentRepairs,
            repairsByModel: repairsByModel.map((r: any) => ({
                model: r.machineModel || 'Sin modelo',
                count: r._count.machineModel,
            })),
            repairsByMonth,
        });
    } catch (error) {
        console.error('Error fetching stats:', JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
            console.error('Message:', error.message);
        }
        res.status(500).json({ error: 'Failed to fetch statistics', details: error instanceof Error ? error.message : String(error) });
    }
};

// GET /api/analytics/search - Buscar en reparaciones
export const searchRepairs = async (req: Request, res: Response) => {
    try {
        const {
            query,
            model,
            startDate,
            endDate,
            limit = 50,
            offset = 0
        } = req.query;

        const where: any = {};

        // Búsqueda por texto
        if (query) {
            where.OR = [
                { name: { contains: query as string, mode: 'insensitive' } },
                { machineModel: { contains: query as string, mode: 'insensitive' } },
                { serialNumber: { contains: query as string, mode: 'insensitive' } },
            ];
        }

        // Filtro por modelo
        if (model) {
            where.machineModel = model;
        }

        // Filtro por fecha
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                where.timestamp.gte = new Date(startDate as string);
            }
            if (endDate) {
                where.timestamp.lte = new Date(endDate as string);
            }
        }

        const [repairs, total] = await Promise.all([
            prisma.savedRepair.findMany({
                where,
                include: {
                    messages: {
                        select: {
                            id: true,
                            role: true,
                            text: true,
                        },
                    },
                },
                orderBy: { timestamp: 'desc' },
                take: Number(limit),
                skip: Number(offset),
            }),
            prisma.savedRepair.count({ where }),
        ]);

        res.json({
            repairs,
            total,
            limit: Number(limit),
            offset: Number(offset),
        });
    } catch (error) {
        console.error('Error searching repairs:', error);
        res.status(500).json({ error: 'Failed to search repairs' });
    }
};

// GET /api/analytics/export - Exportar datos
export const exportData = async (req: Request, res: Response) => {
    try {
        const { format = 'json', model, startDate, endDate } = req.query;

        const where: any = {};
        if (model) where.machineModel = model;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate as string);
            if (endDate) where.timestamp.lte = new Date(endDate as string);
        }

        const repairs = await prisma.savedRepair.findMany({
            where,
            include: {
                messages: {
                    include: {
                        attachment: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        if (format === 'csv') {
            // Generar CSV
            const csvRows = [
                ['ID', 'Nombre', 'Modelo', 'Número de Serie', 'Fecha', 'Mensajes'].join(','),
            ];

            repairs.forEach((repair: any) => {
                const row = [
                    repair.id,
                    `"${repair.name.replace(/"/g, '""')}"`,
                    repair.machineModel || '',
                    repair.serialNumber || '',
                    repair.timestamp.toISOString(),
                    repair.messages.length,
                ].join(',');
                csvRows.push(row);
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=repairs-${Date.now()}.csv`);
            res.send(csvRows.join('\n'));
        } else {
            // Generar JSON
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=repairs-${Date.now()}.json`);
            res.json(repairs);
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
};

// GET /api/analytics/models - Obtener lista de modelos
export const getModels = async (req: Request, res: Response) => {
    try {
        const models = await prisma.savedRepair.findMany({
            where: {
                machineModel: {
                    not: null,
                },
            },
            select: {
                machineModel: true,
            },
            distinct: ['machineModel'],
            orderBy: {
                machineModel: 'asc',
            },
        });

        res.json(models.map((m: any) => m.machineModel));
    } catch (error) {
        console.error('Error fetching models:', JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
            console.error('Message:', error.message);
        }
        res.status(500).json({ error: 'Failed to fetch models', details: error instanceof Error ? error.message : String(error) });
    }
};

// GET /api/analytics/repair/:id/full - Obtener reparación completa con todos los detalles
export const getFullRepair = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const repair = await prisma.savedRepair.findUnique({
            where: { id },
            include: {
                messages: {
                    include: {
                        attachment: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!repair) {
            return res.status(404).json({ error: 'Repair not found' });
        }

        res.json(repair);
    } catch (error) {
        console.error('Error fetching full repair:', error);
        res.status(500).json({ error: 'Failed to fetch repair details' });
    }
};

// POST /api/analytics/query - Consulta SQL personalizada (solo para desarrollo)
export const customQuery = async (req: Request, res: Response) => {
    try {
        // Solo permitir en desarrollo
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Custom queries not allowed in production' });
        }

        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Ejecutar query (PELIGROSO - solo para desarrollo)
        const result = await prisma.$queryRawUnsafe(query);

        res.json({ result });
    } catch (error: any) {
        console.error('Error executing custom query:', error);
        res.status(500).json({ error: error.message });
    }
};
