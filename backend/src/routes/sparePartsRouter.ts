import { Router } from 'express';
import { searchParts, addPartToRepair, getAllParts } from '../controllers/sparePartsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllParts);
router.get('/search', authenticate, searchParts);
router.post('/add', authenticate, addPartToRepair);

export default router;
