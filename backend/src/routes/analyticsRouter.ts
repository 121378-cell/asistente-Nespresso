import { Router } from 'express';
import {
    getStats,
    searchRepairs,
    exportData,
    getModels,
    getFullRepair,
    customQuery,
} from '../controllers/analyticsController.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { predefinedQuerySchema, searchSchema, exportSchema } from '../schemas/analyticsSchemas.js';

const router = Router();

// GET /api/analytics/stats - Estadísticas generales
router.get('/stats', getStats);

// GET /api/analytics/search - Buscar reparaciones
router.get('/search', validateQuery(searchSchema), searchRepairs);

// GET /api/analytics/export - Exportar datos (CSV o JSON)
router.get('/export', validateQuery(exportSchema), exportData);

// GET /api/analytics/models - Lista de modelos
router.get('/models', getModels);

// GET /api/analytics/repair/:id/full - Reparación completa
router.get('/repair/:id/full', getFullRepair);

// POST /api/analytics/query - Consulta personalizada (solo desarrollo)
router.post('/query', validateBody(predefinedQuerySchema), customQuery);

export default router;
