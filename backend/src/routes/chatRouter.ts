import { Router } from 'express';
import { chat, identifyMachine } from '../controllers/chatController.js';
import { validateBody } from '../middleware/validate.js';
import { chatMessageSchema, identifyMachineSchema } from '../schemas/chatSchemas.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/chat - Generate chat response
router.post('/', chatLimiter, validateBody(chatMessageSchema), chat);

// POST /api/chat/identify-machine - Identify machine from image
router.post('/identify-machine', chatLimiter, validateBody(identifyMachineSchema), identifyMachine);

export default router;

