import { Router } from 'express';
import { generate, status } from '../controllers/videoController.js';
import { validateBody } from '../middleware/validate.js';
import { generateVideoSchema, checkVideoStatusSchema } from '../schemas/videoSchemas.js';
import { videoLimiter, asyncStatusLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/video/generate - Generate video from image and prompt
router.post('/generate', videoLimiter, validateBody(generateVideoSchema), generate);

// POST /api/video/status - Check video generation status
router.post('/status', asyncStatusLimiter, validateBody(checkVideoStatusSchema), status);

export default router;
