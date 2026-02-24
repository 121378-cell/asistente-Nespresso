import { z } from 'zod';

/**
 * Schema para validar datos de imagen
 */
const imageDataSchema = z.object({
  imageBytes: z.string().min(1, 'Image bytes are required'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

/**
 * Schema para validar request de generación de video
 */
export const generateVideoSchema = z.object({
  jobId: z.string().uuid().optional(),
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  image: imageDataSchema,
  aspectRatio: z.enum(['16:9', '9:16'], {
    errorMap: () => ({ message: 'Aspect ratio must be either "16:9" or "9:16"' }),
  }),
});

/**
 * Schema para validar request de consulta de estado de video
 */
export const checkVideoStatusSchema = z.object({
  jobId: z.string().uuid().optional(),
  operation: z
    .object({
      name: z.string().min(1, 'Operation name is required'),
    })
    .passthrough()
    .optional(), // Permite propiedades adicionales
}).refine((data) => Boolean(data.jobId || data.operation), {
  message: 'Either jobId or operation is required',
});

// Exportar tipos TypeScript inferidos de los schemas
export type GenerateVideoInput = z.infer<typeof generateVideoSchema>;
export type CheckVideoStatusInput = z.infer<typeof checkVideoStatusSchema>;
