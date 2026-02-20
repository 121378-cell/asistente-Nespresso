import { Router } from 'express';
import { getUnifiedMetrics, getDlqItems, redriveJob } from '../controllers/jobsController.js';

const router = Router();

router.get('/metrics', getUnifiedMetrics);
router.get('/dlq', getDlqItems);
router.post('/redrive', redriveJob);

export default router;
