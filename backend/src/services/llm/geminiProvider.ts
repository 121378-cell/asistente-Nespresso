import { GoogleGenAI, Part, Content } from '@google/genai';
import { env } from '../../config/env.js';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './types.js';

const SYSTEM_INSTRUCTION = `Eres un compañero experto en reparación de cafeteras Nespresso Profesional... (Mismo prompt que original)`;

export class GeminiProvider implements LLMProvider {
  async generateResponse(
    history: MessageContent[],
    message: string,
    file?: FileData,
    useGoogleSearch?: boolean,
    machineModel?: string | null
  ): Promise<GenerateContentResponse> {
    const apiKey = env.geminiApiKey;
    if (!apiKey) throw new Error('GEMINI_API_KEY required');

    const ai = new GoogleGenAI({ apiKey });
    // Determine model based on task complexity and inputs
    const modelName = useGoogleSearch
      ? 'gemini-2.0-flash'
      : file?.mimeType.startsWith('image/')
        ? 'gemini-2.0-flash'
        : file?.mimeType.startsWith('video/')
          ? 'gemini-1.5-pro'
          : 'gemini-2.0-flash';

    const parts: Part[] = [{ text: message }];
    if (file) {
      parts.unshift({
        inlineData: { mimeType: file.mimeType, data: file.data },
      });
    }

    const contents: Content[] = [
      ...history.map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] })),
      { role: 'user', parts },
    ];

    let systemInstruction = SYSTEM_INSTRUCTION;
    if (machineModel) {
      systemInstruction += `

IMPORTANTE: Modelo: "${machineModel}".`;
    }

    const tools: { googleSearch?: Record<string, never> }[] = [];
    if (useGoogleSearch) tools.push({ googleSearch: {} });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: { systemInstruction, tools: tools.length > 0 ? tools : undefined } as any,
    });

    return {
      text: response.text || '',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  }
}
