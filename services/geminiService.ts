import axios from 'axios';
import { Message, Role } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

interface GenerateContentResponse {
  text: string;
  groundingMetadata?: any;
}

interface FileData {
  mimeType: string;
  data: string; // base64
}

/**
 * Convert File to base64 data
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Generate AI response using backend API
 */
export async function generateResponse(
  history: Message[],
  message: string,
  file?: File,
  useGoogleSearch?: boolean,
  machineModel?: string | null
): Promise<GenerateContentResponse> {
  try {
    // Prepare file data if present
    let fileData: FileData | undefined;
    if (file) {
      const base64 = await fileToBase64(file);
      fileData = {
        mimeType: file.type,
        data: base64
      };
    }

    // Map history to backend format
    const historyData = history.map(msg => ({
      role: msg.role,
      text: msg.text
    }));

    // Call backend API
    const response = await axios.post(`${API_BASE_URL}/api/chat`, {
      history: historyData,
      message,
      file: fileData,
      useGoogleSearch,
      machineModel
    }, {
      timeout: 60000 // 60 seconds for AI responses
    });

    return {
      text: response.data.text,
      groundingMetadata: response.data.groundingMetadata
    };

  } catch (error: any) {
    console.error('Error calling chat API:', error);

    if (error.response) {
      // Backend returned an error
      throw new Error(error.response.data?.error || 'Error al contactar con el servidor');
    } else if (error.request) {
      // Request was made but no response
      throw new Error('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.');
    } else {
      // Something else happened
      throw new Error('Error inesperado al procesar la solicitud');
    }
  }
}

/**
 * Identify machine model from image using backend API
 */
export async function identifyMachineFromImage(base64Image: string): Promise<{ model: string; serialNumber: string }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat/identify-machine`, {
      image: base64Image
    }, {
      timeout: 30000 // 30 seconds
    });

    return response.data;

  } catch (error: any) {
    console.error('Error identifying machine:', error);

    if (error.response) {
      throw new Error(error.response.data?.error || 'Error al identificar la máquina');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.');
    } else {
      throw new Error('Error inesperado al identificar la máquina');
    }
  }
}

// Note: Speech generation and transcription features are not yet implemented in backend
// These functions are kept for future implementation

export async function generateSpeech(text: string): Promise<string> {
  throw new Error('Speech generation not yet implemented in backend');
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  throw new Error('Audio transcription not yet implemented in backend');
}
