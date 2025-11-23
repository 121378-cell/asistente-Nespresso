import { z } from 'zod';

/**
 * Schema para validar un mensaje en una reparación
 */
const repairMessageSchema = z.object({
    role: z.enum(['USER', 'MODEL']),
    text: z.string(),
    attachment: z.object({
        url: z.string(),
        type: z.string(),
    }).optional(),
    groundingMetadata: z.any().optional(),
});

/**
 * Schema para validar ID de reparación en params
 */
export const repairIdSchema = z.object({
    id: z.string().uuid('Invalid repair ID format'),
});

/**
 * Schema para validar creación de reparación
 */
export const createRepairSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    machineModel: z.string().nullable(),
    serialNumber: z.string().nullable(),
    messages: z.array(repairMessageSchema).min(1, 'At least one message is required'),
    timestamp: z.number().positive('Timestamp must be a positive number'),
});

/**
 * Schema para validar actualización de reparación
 */
export const updateRepairSchema = z.object({
    name: z.string().min(1).optional(),
    machineModel: z.string().nullable().optional(),
    serialNumber: z.string().nullable().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

// Exportar tipos TypeScript inferidos de los schemas
export type RepairIdParams = z.infer<typeof repairIdSchema>;
export type CreateRepairInput = z.infer<typeof createRepairSchema>;
export type UpdateRepairInput = z.infer<typeof updateRepairSchema>;
