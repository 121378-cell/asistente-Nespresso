import { Router } from 'express';
import {
  getAllRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  deleteRepair,
  exportPdf,
} from '../controllers/repairsController.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createRepairSchema,
  updateRepairSchema,
  repairIdSchema,
} from '../schemas/repairsSchemas.js';
import { analyticsLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// GET /api/repairs - Get all saved repairs
router.get('/', getAllRepairs);

// GET /api/repairs/:id - Get a specific repair by ID
router.get('/:id', validateParams(repairIdSchema), getRepairById);

// POST /api/repairs - Create a new repair
router.post('/', analyticsLimiter, validateBody(createRepairSchema), createRepair);

// PUT /api/repairs/:id - Update a repair
router.put(
  '/:id',
  analyticsLimiter,
  validateParams(repairIdSchema),
  validateBody(updateRepairSchema),
  updateRepair
);

// DELETE /api/repairs/:id - Delete a repair
router.delete('/:id', analyticsLimiter, validateParams(repairIdSchema), deleteRepair);

// GET /api/repairs/:id/pdf - Export repair to PDF
router.get('/:id/pdf', validateParams(repairIdSchema), exportPdf);

export default router;
