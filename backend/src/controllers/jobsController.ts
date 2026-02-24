import { Request, Response } from 'express';
import {
  getVideoAsyncMetricsSnapshot,
  listVideoDlqEntries,
  redriveVideoJobFromDlq,
} from '../services/videoJobService.js';
import {
  getImageAsyncMetricsSnapshot,
  listImageDlqEntries,
  redriveImageJobFromDlq,
} from '../services/imageJobService.js';
import { logAndSendInternalError } from '../utils/errorResponse.js';

export const getUnifiedMetrics = async (req: Request, res: Response) => {
  try {
    const video = await getVideoAsyncMetricsSnapshot();
    const image = await getImageAsyncMetricsSnapshot();

    res.json({
      video,
      image,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return logAndSendInternalError(req, res, error, 'Failed to fetch unified metrics', 'Failed to fetch metrics');
  }
};

export const getDlqItems = async (req: Request, res: Response) => {
  try {
    const videoDlq = await listVideoDlqEntries();
    const imageDlq = await listImageDlqEntries();

    res.json({
      video: videoDlq,
      image: imageDlq,
    });
  } catch (error) {
    return logAndSendInternalError(req, res, error, 'Failed to fetch DLQ items', 'Failed to fetch DLQ items');
  }
};

export const redriveJob = async (req: Request, res: Response) => {
  try {
    const { type, jobId } = req.body;
    const requestId = String(req.id);

    if (type === 'video') {
      const result = await redriveVideoJobFromDlq(jobId, requestId);
      return res.json({ success: !!result, job: result });
    } else if (type === 'image') {
      const result = await redriveImageJobFromDlq(jobId, requestId);
      return res.json({ success: !!result, job: result });
    }

    res.status(400).json({ error: 'Invalid job type' });
  } catch (error) {
    return logAndSendInternalError(req, res, error, 'Failed to redrive job', 'Failed to redrive job', {
      jobId: req.body.jobId,
    });
  }
};
