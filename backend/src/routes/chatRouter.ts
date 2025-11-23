import { Router } from 'express';
import { chat, identifyMachine } from '../controllers/chatController.js';
import { validateBody } from '../middleware/validate.js';
import { chatMessageSchema, identifyMachineSchema } from '../schemas/chatSchemas.js';

const router = Router();

// POST /api/chat - Generate chat response
router.post('/', validateBody(chatMessageSchema), chat);

// POST /api/chat/identify-machine - Identify machine from image
router.post('/identify-machine', validateBody(identifyMachineSchema), identifyMachine);

export default router;
