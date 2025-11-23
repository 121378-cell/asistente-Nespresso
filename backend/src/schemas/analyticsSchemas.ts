import { z } from 'zod';

/**
 * Tipos de consultas predefinidas permitidas
 */
const queryTypes = [
    'recent_repairs',
    'repairs_with_attachments',
    'repairs_by_model',
    'repairs_by_date_range',
] as const;

/**
 * Schema para validar consulta predefinida
 */
export const predefinedQuerySchema = z.object({
    queryType: z.enum(queryTypes, {
        errorMap: () => ({ message: `Query type must be one of: ${queryTypes.join(', ')}` }),
    }),
    params: z.record(z.any()).optional(),
});

/**
 * Schema para validar búsqueda de reparaciones
 */
export const searchSchema = z.object({
    query: z.string().optional(),
    model: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    offset: z.string().regex(/^\d+$/, 'Offset must be a number').optional(),
});

/**
 * Schema para validar exportación de datos
 */
export const exportSchema = z.object({
    format: z.enum(['json', 'csv'], {
        errorMap: () => ({ message: 'Format must be either "json" or "csv"' }),
    }),
    query: z.string().optional(),
    model: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

// Exportar tipos TypeScript inferidos de los schemas
export type PredefinedQueryInput = z.infer<typeof predefinedQuerySchema>;
export type SearchQuery = z.infer<typeof searchSchema>;
export type ExportQuery = z.infer<typeof exportSchema>;
