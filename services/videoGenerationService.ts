import axios from 'axios';
import { buildTraceHeaders } from './requestTracing';

const API_BASE_URL =
  (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL ||
  'http://localhost:3001';

interface ApiErrorPayload {
  error?: string;
}

interface VideoOutput {
  video?: {
    uri?: string;
  };
}

interface VideoOperationResponse {
  generatedVideos?: VideoOutput[];
}

export interface VideoOperation {
  done?: boolean;
  response?: VideoOperationResponse;
  [key: string]: unknown;
}

export interface VideoJobStatusResponse {
  jobId: string;
  status: 'queued' | 'running' | 'failed' | 'completed';
  requestId?: string;
  operationName?: string;
  result?: VideoOperation;
  error?: string;
  [key: string]: unknown;
}

interface VideoGenerateResponse extends VideoOperation {
  jobId?: string;
  status?: string;
}

type VideoStatusRequest = VideoOperation | { jobId: string };

/**
 * Check if API key is configured (always true now since it's in backend)
 */
export const checkApiKey = async (): Promise<boolean> => {
  // API key is now in backend, so always return true
  return true;
};

/**
 * Request API key (no longer needed, kept for compatibility)
 */
export const requestApiKey = async (): Promise<void> => {
  // No-op: API key is managed in backend
  console.warn('requestApiKey is deprecated - API key is now managed in backend');
};

/**
 * Generate video from image and prompt using backend API
 */
export const generateVideo = async (
  prompt: string,
  image: { imageBytes: string; mimeType: string },
  aspectRatio: '16:9' | '9:16'
): Promise<VideoGenerateResponse> => {
  try {
    const response = await axios.post<VideoGenerateResponse>(
      `${API_BASE_URL}/api/video/generate`,
      {
        prompt,
        image,
        aspectRatio,
      },
      {
        timeout: 120000, // 2 minutes for video generation
        headers: buildTraceHeaders(),
      }
    );

    return response.data;
  } catch (error: unknown) {
    console.error('Error generating video:', error);
    if (axios.isAxiosError<ApiErrorPayload>(error) && error.response) {
      throw new Error(error.response.data?.error || 'Error al generar el vídeo');
    } else if (axios.isAxiosError<ApiErrorPayload>(error) && error.request) {
      throw new Error(
        'No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.'
      );
    } else {
      throw new Error('Error inesperado al generar el vídeo');
    }
  }
};

/**
 * Check video generation status using backend API
 */
export const checkVideoStatus = async (
  operation: VideoStatusRequest
): Promise<VideoOperation | VideoJobStatusResponse> => {
  try {
    const payload: Record<string, unknown> =
      'jobId' in operation && typeof (operation as { jobId?: unknown }).jobId === 'string'
        ? { jobId: (operation as { jobId: string }).jobId }
        : { operation };

    const response = await axios.post<VideoOperation | VideoJobStatusResponse>(
      `${API_BASE_URL}/api/video/status`,
      payload,
      {
        timeout: 30000, // 30 seconds
        headers: buildTraceHeaders(),
      }
    );

    return response.data as VideoOperation & VideoJobStatusResponse;
  } catch (error: unknown) {
    console.error('Error checking video status:', error);

    if (axios.isAxiosError<ApiErrorPayload>(error) && error.response) {
      throw new Error(error.response.data?.error || 'Error al verificar el estado del vídeo');
    } else if (axios.isAxiosError<ApiErrorPayload>(error) && error.request) {
      throw new Error('No se pudo conectar con el servidor.');
    } else {
      throw new Error('Error inesperado al verificar el estado');
    }
  }
};
