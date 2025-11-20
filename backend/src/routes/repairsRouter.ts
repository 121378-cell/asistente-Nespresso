import { Router } from 'express';
import {
    getAllRepairs,
    getRepairById,
    createRepair,
    updateRepair,
    deleteRepair
} from '../controllers/repairsController.js';

const router = Router();

// GET /api/repairs - Get all saved repairs
router.get('/', getAllRepairs);

// GET /api/repairs/:id - Get a specific repair by ID
router.get('/:id', getRepairById);

// POST /api/repairs - Create a new repair
router.post('/', createRepair);

// PUT /api/repairs/:id - Update a repair
router.put('/:id', updateRepair);

// DELETE /api/repairs/:id - Delete a repair
router.delete('/:id', deleteRepair);

export default router;
