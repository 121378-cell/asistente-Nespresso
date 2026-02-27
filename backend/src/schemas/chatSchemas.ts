import { z } from 'zod';

/**
 * Schema para validar metadata de grounding (Google Search)
 */
const groundingMetadataSchema = z
  .object({
    groundingChunks: z
      .array(
        z.object({
          web: z
            .object({
              uri: z.string().optional(),
              title: z.string().optional(),
            })
            .optional(),
        })
      )
      .optional(),
    groundingSupports: z.array(z.unknown()).optional(),
    webSearchQueries: z.array(z.string()).optional(),
  })
  .optional();

/**
 * Schema para validar un mensaje en el historial
 */
export const messageSchema = z.object({
  role: z.enum(['USER', 'MODEL']),
  text: z.string(),
  attachment: z
    .object({
      url: z.string(),
      type: z.string(),
    })
    .optional(),
  groundingMetadata: groundingMetadataSchema,
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
