import { env } from '../../config/env.js';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './types.js';
import { logger } from '../../config/logger.js';

const SYSTEM_INSTRUCTION =
  'Eres un compañero experto en reparación de cafeteras Nespresso Profesional. Responde de forma técnica, clara y segura.';

interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

export class GroqProvider implements LLMProvider {
  private modelName: string;

  constructor(modelName: string = env.groqModel) {
    this.modelName = modelName;
  }

  async generateResponse(
    history: MessageContent[],
    message: string,
    file?: FileData,
    _useGoogleSearch?: boolean,
    machineModel?: string | null
  ): Promise<GenerateContentResponse> {
    const apiKey = env.groqApiKey;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY required');
    }

    // Usar modelo de visión si hay un archivo o si el modelo solicitado es de visión
    let activeModel = this.modelName;
    const isVisionModel =
      activeModel.includes('vision') || (file && file.mimeType.startsWith('image/'));

    if (file && file.mimeType.startsWith('image/') && !isVisionModel) {
      activeModel = 'llama-3.2-11b-vision-preview';
    }

    let systemPrompt = SYSTEM_INSTRUCTION;
    if (machineModel) {
      systemPrompt += ` Modelo actual: "${machineModel}".`;
    }

    const historyMessages: GroqChatMessage[] = history.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text,
    }));

    // Construir contenido del mensaje de usuario (soporte multimoda)
    let userContent: any;
    if (file && file.mimeType.startsWith('image/')) {
      userContent = [
        { type: 'text', text: message },
        {
          type: 'image_url',
          image_url: {
            url: `data:${file.mimeType};base64,${file.data}`,
          },
        },
      ];
    } else {
      userContent = message;
    }

    const messages: GroqChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: userContent },
    ];

    logger.debug({ model: activeModel, hasImage: !!file }, 'Calling Groq API');

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: activeModel,
          messages,
          temperature: 0.3,
        }),
      });

      const raw = (await response.json()) as GroqChatResponse | { error?: { message?: string } };

      if (!response.ok) {
        const errorMsg =
          'error' in raw && raw.error?.message
            ? raw.error.message
            : `Groq API error (${response.status})`;
        logger.error({ status: response.status, error: raw }, 'Groq API responded with error');
        throw new Error(errorMsg);
      }

      const text = (raw as GroqChatResponse).choices?.[0]?.message?.content?.trim() || '';
      return { text };
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch from Groq');
      throw error;
    }
  }
}
