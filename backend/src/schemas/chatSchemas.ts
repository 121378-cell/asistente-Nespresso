import { z } from 'zod';

/**
 * Schema para validar un mensaje en el historial
 */
const messageSchema = z.object({
  role: z.enum(['USER', 'MODEL']),
  text: z.string(),
  attachment: z
    .object({
      url: z.string(),
      type: z.string(),
    })
    .optional(),
  groundingMetadata: z.any().optional(),
});

/**
 * Schema para validar un archivo adjunto
 */
const fileSchema = z
  .object({
    mimeType: z.string(),
    data: z.string(),
  })
  .optional();

/**
 * Schema para validar request de chat
 */
export const chatMessageSchema = z.object({
  history: z.array(messageSchema),
  message: z.string().min(1, 'Message cannot be empty'),
  file: fileSchema,
  useGoogleSearch: z.boolean().optional(),
  machineModel: z.string().nullable().optional(),
});

/**
 * Schema para validar request de identificación de máquina
 */
export const identifyMachineSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
});

// Exportar tipos TypeScript inferidos de los schemas
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type IdentifyMachineInput = z.infer<typeof identifyMachineSchema>;
