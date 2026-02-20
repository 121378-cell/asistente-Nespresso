import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

const prisma = new PrismaClient();

export const searchParts = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const parts = await prisma.sparePart.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { partNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });

    res.json(parts);
  } catch (error) {
    logger.error({ err: error }, 'Failed to search spare parts');
    res.status(500).json({ error: 'Failed to search parts' });
  }
};

export const addPartToRepair = async (req: Request, res: Response) => {
  try {
    const { repairId, partId, quantity } = req.body;

    const usedPart = await prisma.usedSparePart.upsert({
      where: {
        repairId_partId: { repairId, partId },
      },
      update: {
        quantity: { increment: quantity || 1 },
      },
      create: {
        repairId,
        partId,
        quantity: quantity || 1,
      },
    });

    res.json(usedPart);
  } catch (error) {
    logger.error({ err: error }, 'Failed to add part to repair');
    res.status(500).json({ error: 'Failed to add part' });
  }
};
