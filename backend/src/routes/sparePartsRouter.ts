import { Router } from 'express';
import { searchParts, addPartToRepair } from '../controllers/sparePartsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/search', authenticate, searchParts);
router.post('/add', authenticate, addPartToRepair);

export default router;
