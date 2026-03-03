import { Router } from 'express';
import {
  getKnowledgeDocuments,
  removeKnowledgeDocument,
  uploadKnowledgeDocument,
} from '../controllers/knowledgeController.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { knowledgeDocumentIdSchema, knowledgeUploadSchema } from '../schemas/knowledgeSchemas.js';
import { analyticsLimiter, readLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Knowledge
 *   description: Knowledge base management for RAG context
 */

/**
 * @swagger
 * /api/knowledge/documents:
 *   post:
 *     summary: Upload a knowledge document (PDF base64 or plain text)
 *     tags: [Knowledge]
 */
router.post('/documents', analyticsLimiter, validateBody(knowledgeUploadSchema), uploadKnowledgeDocument);

/**
 * @swagger
 * /api/knowledge/documents:
 *   get:
 *     summary: List uploaded knowledge documents
 *     tags: [Knowledge]
 */
router.get('/documents', readLimiter, getKnowledgeDocuments);

/**
 * @swagger
 * /api/knowledge/documents/{id}:
 *   delete:
 *     summary: Delete a knowledge document
 *     tags: [Knowledge]
 */
router.delete('/documents/:id', analyticsLimiter, validateParams(knowledgeDocumentIdSchema), removeKnowledgeDocument);

export default router;
