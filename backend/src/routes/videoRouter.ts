import { Router } from 'express';
import { generate, status } from '../controllers/videoController.js';

const router = Router();

// POST /api/video/generate - Generate video from image and prompt
router.post('/generate', generate);

// POST /api/video/status - Check video generation status
router.post('/status', status);

export default router;
