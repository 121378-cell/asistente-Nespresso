import { env } from '../../config/env.js';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './types.js';
import { logger } from '../../config/logger.js';

const SYSTEM_INSTRUCTION =
  'Eres un compañero experto en reparación de cafeteras Nespresso Profesional. Responde de forma técnica, clara y segura.';

interface KimiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface KimiChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

export class KimiProvider implements LLMProvider {
  private modelName: string;

  constructor(modelName: string = env.kimiModel) {
    this.modelName = modelName;
  }

  async generateResponse(
    history: MessageContent[],
    message: string,
    file?: FileData,
    _useGoogleSearch?: boolean,
    machineModel?: string | null
  ): Promise<GenerateContentResponse> {
    const apiKey = env.kimiApiKey;
    if (!apiKey) {
      throw new Error('KIMI_API_KEY required');
    }

    if (file) {
      throw new Error('Kimi provider does not support file attachments in this integration');
    }

    let systemPrompt = SYSTEM_INSTRUCTION;
    if (machineModel) {
      systemPrompt += ` Modelo actual: "${machineModel}".`;
    }

    const historyMessages: KimiChatMessage[] = history.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text,
    }));

    const messages: KimiChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: message },
    ];

    logger.debug(
      { model: this.modelName, messageLength: message.length },
      'Calling Kimi API (Moonshot)'
    );

    try {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: 0.3,
        }),
      });

      const raw = (await response.json()) as KimiChatResponse | { error?: { message?: string } };

      if (!response.ok) {
        const errorMsg =
          'error' in raw && raw.error?.message
            ? raw.error.message
            : `Kimi API error (${response.status})`;
        logger.error({ status: response.status, error: raw }, 'Kimi API responded with error');
        throw new Error(errorMsg);
      }

      const text = (raw as KimiChatResponse).choices?.[0]?.message?.content?.trim() || '';
      return { text };
    } catch (error) {
      logger.error({ err: error }, 'Kimi API connection failed');
      throw error;
    }
  }
}
