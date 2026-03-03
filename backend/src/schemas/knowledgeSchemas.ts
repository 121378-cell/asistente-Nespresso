import { z } from 'zod';

export const knowledgeUploadSchema = z
  .object({
    title: z.string().min(3).max(200),
    pdfBase64: z.string().min(20).optional(),
    text: z.string().min(20).optional(),
  })
  .refine((data) => Boolean(data.pdfBase64) || Boolean(data.text), {
    message: 'Either pdfBase64 or text is required',
    path: ['pdfBase64'],
  });

export const knowledgeDocumentIdSchema = z.object({
  id: z.string().uuid('Invalid document id'),
});

export type KnowledgeUploadInput = z.infer<typeof knowledgeUploadSchema>;
