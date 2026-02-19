import { Request, Response } from 'express';
import { checkVideoStatus } from '../services/geminiService.js';
import { logger } from '../config/logger.js';
import { createVideoJob, refreshVideoJobStatus } from '../services/videoJobService.js';

interface GenerateVideoRequest {
  jobId?: string;
  prompt: string;
  image: {
    imageBytes: string;
    mimeType: string;
  };
  aspectRatio: '16:9' | '9:16';
}

interface CheckVideoStatusRequest {
  jobId?: string;
  operation?: any;
}

// POST /api/video/generate - Generate video from image and prompt
export const generate = async (req: Request, res: Response) => {
  try {
    const { prompt, image, aspectRatio }: GenerateVideoRequest = req.body;

    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    if (!image || !image.imageBytes || !image.mimeType) {
      return res.status(400).json({ error: 'Image data is required with imageBytes and mimeType' });
    }

    if (!aspectRatio || !['16:9', '9:16'].includes(aspectRatio)) {
      return res.status(400).json({ error: 'AspectRatio must be either "16:9" or "9:16"' });
    }

    const job = await createVideoJob(
      { prompt, image, aspectRatio },
      String(req.id),
      req.body.jobId
    );

    res.status(202).json({
      jobId: job.id,
      status: job.status,
      requestId: job.requestId,
    });
  } catch (error: any) {
    logger.error({ err: error, prompt: req.body.prompt }, 'Failed to generate video');
    res.status(500).json({
      error: 'Failed to generate video',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// POST /api/video/status - Check video generation status
export const status = async (req: Request, res: Response) => {
  try {
    const { operation, jobId }: CheckVideoStatusRequest = req.body;

    if (jobId) {
      const job = await refreshVideoJobStatus(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Video job not found' });
      }

      return res.json({
        jobId: job.id,
        status: job.status,
        requestId: job.requestId,
        operationName: job.operationName,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      });
    }

    if (!operation) {
      return res.status(400).json({ error: 'jobId or operation data is required' });
    }

    const result = await checkVideoStatus(operation);
    res.json({ ...result, deprecated: true });
  } catch (error: any) {
    logger.error(
      { err: error, operation: req.body.operation, jobId: req.body.jobId },
      'Failed to check video status'
    );
    res.status(500).json({
      error: 'Failed to check video status',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
