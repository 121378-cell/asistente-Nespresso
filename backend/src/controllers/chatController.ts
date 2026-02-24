import { Request, Response } from 'express';
import { generateResponse, identifyMachineFromImage } from '../services/geminiService.js';
import { logger } from '../config/logger.js';
import { createImageJob, getImageJob } from '../services/imageJobService.js';
import { logAndSendInternalError } from '../utils/errorResponse.js';

interface MessageInput {
  role: 'user' | 'model';
  text: string;
}

interface FileInput {
  mimeType: string;
  data: string; // base64
}

interface ChatRequest {
  history: MessageInput[];
  message: string;
  file?: FileInput;
  useGoogleSearch?: boolean;
  machineModel?: string | null;
}

interface IdentifyMachineRequest {
  image: string; // base64
}

// POST /api/chat - Generate chat response
export const chat = async (req: Request, res: Response) => {
  try {
    const { history, message, file, useGoogleSearch, machineModel }: ChatRequest = req.body;

    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an array' });
    }

    // Call Gemini service
    const response = await generateResponse(history, message, file, useGoogleSearch, machineModel);

    // Extract response data
    const text = response.text ?? '';
    const groundingMetadata = response.groundingMetadata;

    res.json({
      text,
      groundingMetadata: groundingMetadata ?? null,
    });
  } catch (error) {
    return logAndSendInternalError(
      req,
      res,
      error,
      'Failed to generate chat response',
      'Failed to generate response',
      { message: req.body.message }
    );
  }
};

// POST /api/chat/identify-machine - Identify machine from image
export const identifyMachine = async (req: Request, res: Response) => {
  try {
    const { image }: IdentifyMachineRequest = req.body;

    // Validation
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required and must be a base64 string' });
    }

    // Call Gemini service
    const result = await identifyMachineFromImage(image);

    res.json(result);
  } catch (error) {
    return logAndSendInternalError(
      req,
      res,
      error,
      'Failed to identify machine from image',
      'Failed to identify machine'
    );
  }
};

// POST /api/chat/identify-machine/async - Start async identification
export const identifyMachineAsync = async (req: Request, res: Response) => {
  try {
    const { image }: IdentifyMachineRequest = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const job = await createImageJob(image, String(req.id));
    logger.info({ jobId: job.id, requestId: req.id }, 'Image identification job enqueued');

    res.status(202).json({
      jobId: job.id,
      status: job.status,
    });
  } catch (error) {
    return logAndSendInternalError(
      req,
      res,
      error,
      'Failed to enqueue image identification',
      'Failed to start identification'
    );
  }
};

// GET /api/chat/identify-machine/status/:jobId - Check async identification status
export const identifyMachineStatus = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await getImageJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      result: job.result,
      error: job.error,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
    });
  } catch (error) {
    return logAndSendInternalError(
      req,
      res,
      error,
      'Failed to check image job status',
      'Failed to check status',
      { jobId: req.params.jobId }
    );
  }
};
