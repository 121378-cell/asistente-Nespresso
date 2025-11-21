import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

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
): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/video/generate`, {
      prompt,
      image,
      aspectRatio
    }, {
      timeout: 120000 // 2 minutes for video generation
    });

    return response.data;

  } catch (error: any) {
    console.error('Error generating video:', error);

    if (error.response) {
      throw new Error(error.response.data?.error || 'Error al generar el vídeo');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.');
    } else {
      throw new Error('Error inesperado al generar el vídeo');
    }
  }
};

/**
 * Check video generation status using backend API
 */
export const checkVideoStatus = async (operation: any): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/video/status`, {
      operation
    }, {
      timeout: 30000 // 30 seconds
    });

    return response.data;

  } catch (error: any) {
    console.error('Error checking video status:', error);

    if (error.response) {
      throw new Error(error.response.data?.error || 'Error al verificar el estado del vídeo');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor.');
    } else {
      throw new Error('Error inesperado al verificar el estado');
    }
  }
};