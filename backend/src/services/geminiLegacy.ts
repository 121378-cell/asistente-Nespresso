import { GoogleGenAI, Part, Type } from '@google/genai';
import { env } from '../config/env.js';

/**
 * Identify machine from image using backend API
 */
export async function identifyMachineFromImage(
  base64Image: string
): Promise<{ model: string; serialNumber: string }> {
  try {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in backend');
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePart: Part = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart: Part = {
      text: `Analiza esta imagen de una cafetera. Identifica el modelo exacto y el número de serie. El número de serie suele estar en una pegatina con un código de barras. Responde con un JSON que se ajuste al esquema proporcionado. Si no encuentras uno de los campos, déjalo como un string vacío.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [imagePart, textPart] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            model: {
              type: Type.STRING,
              description: 'El nombre del modelo de la cafetera. Por ejemplo: "Zenius ZN 100 PRO".',
            },
            serialNumber: {
              type: Type.STRING,
              description: 'El número de serie completo de la cafetera.',
            },
          },
          required: ['model', 'serialNumber'],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error('Empty response from Gemini');

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse JSON response from Gemini:', jsonText);
      throw new Error('Invalid JSON response from Gemini');
    }

    if (result && typeof result.model === 'string' && typeof result.serialNumber === 'string') {
      return result;
    } else {
      throw new Error('Unexpected response format from Gemini');
    }
  } catch (error) {
    console.error('Error identifying machine from image:', error);
    throw new Error('Failed to identify machine from image');
  }
}

/**
 * Generate video from image and prompt using Veo
 */
export async function generateVideo(
  prompt: string,
  image: { imageBytes: string; mimeType: string },
  aspectRatio: '16:9' | '9:16'
): Promise<unknown> {
  try {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in backend');
    }

    const ai = new GoogleGenAI({ apiKey });

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio,
      },
    });

    return operation;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error('Failed to generate video');
  }
}

/**
 * Check status of video generation operation
 */
export async function checkVideoStatus(operationData: { name: string }): Promise<unknown> {
  try {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in backend');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Type assertion required because Gemini SDK types are not fully typed
    const operation = await ai.operations.get(operationData as never);

    return operation;
  } catch (error) {
    console.error('Error checking video status:', error);
    throw new Error('Failed to check video status');
  }
}
