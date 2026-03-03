import { Request, Response } from 'express';
import {
  deleteKnowledgeDocument,
  ingestPdfKnowledge,
  ingestTextKnowledge,
  listKnowledgeDocuments,
} from '../services/knowledgeService.js';
import { logAndSendInternalError } from '../utils/errorResponse.js';
import { KnowledgeUploadInput } from '../schemas/knowledgeSchemas.js';

export const uploadKnowledgeDocument = async (req: Request, res: Response) => {
  try {
    const { title, pdfBase64, text }: KnowledgeUploadInput = req.body;

    const result = pdfBase64
      ? await ingestPdfKnowledge({ title, pdfBase64 })
      : await ingestTextKnowledge({ title, text: text ?? '' });

    res.status(201).json(result);
  } catch (error) {
    return logAndSendInternalError(
      req,
      res,
      error,
      'Failed to upload knowledge document',
      'Failed to upload knowledge document'
    );
  }
};

export const getKnowledgeDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await listKnowledgeDocuments();
    res.json(documents);
  } catch (error) {
    return logAndSendInternalError(
      req,
      res,
      error,
      'Failed to list knowledge documents',
      'Failed to list knowledge documents'
    );
  }
};

export const removeKnowledgeDocument = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteKnowledgeDocument(req.params.id);
    res.json({
      id: deleted.id,
      title: deleted.title,
      deleted: true,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as Record<string, unknown>).code === 'P2025'
    ) {
      return res.status(404).json({ error: 'Knowledge document not found' });
    }

    return logAndSendInternalError(
      req,
      res,
      error,
      'Failed to delete knowledge document',
      'Failed to delete knowledge document'
    );
  }
};
