import { Router } from 'express';
import { chat, identifyMachine } from '../controllers/chatController.js';

const router = Router();

// POST /api/chat - Generate chat response
router.post('/', chat);

// POST /api/chat/identify-machine - Identify machine from image
router.post('/identify-machine', identifyMachine);

export default router;
