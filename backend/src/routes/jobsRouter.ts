import { Router } from 'express';
import { getUnifiedMetrics, getDlqItems, redriveJob } from '../controllers/jobsController.js';
import { readLimiter, analyticsLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/metrics', readLimiter, getUnifiedMetrics);
router.get('/dlq', readLimiter, getDlqItems);
router.post('/redrive', analyticsLimiter, redriveJob);

export default router;
