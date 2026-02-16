import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type definitions matching frontend types
interface FileAttachment {
  url: string;
  type: string;
}

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

interface MessageInput {
  role: 'USER' | 'MODEL';
  text: string;
  attachment?: FileAttachment;
  groundingMetadata?: GroundingMetadata;
}

interface CreateRepairInput {
  name: string;
  machineModel: string | null;
  serialNumber: string | null;
  messages: MessageInput[];
  timestamp: number;
}

interface StoredMessage {
  role: string;
  text: string;
  attachment?: {
    url: string;
    type: string;
  } | null;
  groundingMetadata?: unknown;
}

// GET /api/repairs - Get all saved repairs (without full messages)
export const getAllRepairs = async (req: Request, res: Response) => {
  try {
    const repairs = await prisma.savedRepair.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        messages: {
          select: {
            id: true,
            role: true,
            text: true,
          },
          take: 1, // Only include first message for preview
        },
      },
    });

    res.json(repairs);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
};

// GET /api/repairs/:id - Get a specific repair with all messages
export const getRepairById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const repair = await prisma.savedRepair.findUnique({
      where: { id },
      include: {
        messages: {
          include: {
            attachment: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!repair) {
      return res.status(404).json({ error: 'Repair not found' });
    }

    // Transform to match frontend format
    const formattedRepair = {
      id: repair.id,
      name: repair.name,
      machineModel: repair.machineModel,
      serialNumber: repair.serialNumber,
      timestamp: repair.timestamp.getTime(),
      messages: repair.messages.map((msg: StoredMessage) => ({
        role: msg.role,
        text: msg.text,
        ...(msg.attachment && {
          attachment: {
            url: msg.attachment.url,
            type: msg.attachment.type,
          },
        }),
        ...(msg.groundingMetadata
          ? {
              groundingMetadata: msg.groundingMetadata,
            }
          : {}),
      })),
    };

    res.json(formattedRepair);
  } catch (error) {
    console.error('Error fetching repair:', error);
    res.status(500).json({ error: 'Failed to fetch repair' });
  }
};

// POST /api/repairs - Create a new repair
export const createRepair = async (req: Request, res: Response) => {
  try {
    const { name, machineModel, serialNumber, messages, timestamp }: CreateRepairInput = req.body;

    // Validation
    if (!name || !messages || messages.length === 0) {
      return res.status(400).json({ error: 'Name and messages are required' });
    }

    // Create repair with messages and attachments
    const repair = (await prisma.savedRepair.create({
      data: {
        name,
        machineModel,
        serialNumber,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        messages: {
          create: messages.map((msg) => ({
            role: msg.role,
            text: msg.text,
            groundingMetadata: (msg.groundingMetadata as any) || undefined,
            ...(msg.attachment && {
              attachment: {
                create: {
                  url: msg.attachment.url,
                  type: msg.attachment.type,
                },
              },
            }),
          })),
        },
      },
      include: {
        messages: {
          include: {
            attachment: true,
          },
        },
      },
    })) as any; // Type assertion needed due to Prisma complex types

    // Transform to match frontend format
    const formattedRepair = {
      id: repair.id,
      name: repair.name,
      machineModel: repair.machineModel,
      serialNumber: repair.serialNumber,
      timestamp: repair.timestamp.getTime(),
      messages: repair.messages.map((msg: any) => ({
        role: msg.role,
        text: msg.text,
        ...(msg.attachment && {
          attachment: {
            url: msg.attachment.url,
            type: msg.attachment.type,
          },
        }),
        ...(msg.groundingMetadata && {
          groundingMetadata: msg.groundingMetadata as any,
        }),
      })),
    };

    res.status(201).json(formattedRepair);
  } catch (error) {
    console.error('Error creating repair:', error);
    res.status(500).json({ error: 'Failed to create repair' });
  }
};

// PUT /api/repairs/:id - Update a repair
export const updateRepair = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, machineModel, serialNumber } = req.body;

    const repair = await prisma.savedRepair.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(machineModel !== undefined && { machineModel }),
        ...(serialNumber !== undefined && { serialNumber }),
      },
      include: {
        messages: {
          include: {
            attachment: true,
          },
        },
      },
    });

    res.json(repair);
  } catch (error: any) {
    console.error('Error updating repair:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Repair not found' });
    }
    res.status(500).json({ error: 'Failed to update repair' });
  }
};

// DELETE /api/repairs/:id - Delete a repair
export const deleteRepair = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.savedRepair.delete({
      where: { id },
    });

    res.json({ message: 'Repair deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting repair:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Repair not found' });
    }
    res.status(500).json({ error: 'Failed to delete repair' });
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
