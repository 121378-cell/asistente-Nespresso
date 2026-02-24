import { Router } from 'express';
import {
  chat,
  identifyMachine,
  identifyMachineAsync,
  identifyMachineStatus,
} from '../controllers/chatController.js';
import { validateBody } from '../middleware/validate.js';
import { chatMessageSchema, identifyMachineSchema } from '../schemas/chatSchemas.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and machine identification endpoints
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Generate chat response
 *     description: Generate a response from the AI assistant based on chat history and message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - history
 *             properties:
 *               message:
 *                 type: string
 *                 description: User message
 *                 example: "¿Cómo reparo mi máquina Nespresso?"
 *               history:
 *                 type: array
 *                 description: Chat history
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [USER, MODEL]
 *                     text:
 *                       type: string
 *               file:
 *                 type: object
 *                 description: Optional file attachment
 *                 properties:
 *                   mimeType:
 *                     type: string
 *                   data:
 *                     type: string
 *                     format: base64
 *               useGoogleSearch:
 *                 type: boolean
 *                 description: Enable Google Search grounding
 *               machineModel:
 *                 type: string
 *                 nullable: true
 *                 description: Machine model for context
 *     responses:
 *       200:
 *         description: Chat response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: AI response text
 *                 groundingMetadata:
 *                   type: object
 *                   description: Grounding metadata if Google Search was used
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.post('/', chatLimiter, validateBody(chatMessageSchema), chat);

/**
 * @swagger
 * /api/chat/identify-machine:
 *   post:
 *     summary: Identify machine from image
 *     description: Identify Nespresso machine model and serial number from an image
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: base64
 *                 description: Base64 encoded image
 *     responses:
 *       200:
 *         description: Machine identified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 model:
 *                   type: string
 *                   description: Machine model
 *                 serialNumber:
 *                   type: string
 *                   description: Serial number
 *       400:
 *         description: Invalid input
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.post('/identify-machine', chatLimiter, validateBody(identifyMachineSchema), identifyMachine);

/**
 * @swagger
 * /api/chat/identify-machine/async:
 *   post:
 *     summary: Identify machine from image (Async)
 *     description: Start an asynchronous job to identify Nespresso machine model from an image
 *     tags: [Chat]
 */
router.post(
  '/identify-machine/async',
  chatLimiter,
  validateBody(identifyMachineSchema),
  identifyMachineAsync
);

/**
 * @swagger
 * /api/chat/identify-machine/status/{jobId}:
 *   get:
 *     summary: Check async identification status
 *     description: Check the status of an asynchronous machine identification job
 *     tags: [Chat]
 */
router.get('/identify-machine/status/:jobId', chatLimiter, identifyMachineStatus);

export default router;
