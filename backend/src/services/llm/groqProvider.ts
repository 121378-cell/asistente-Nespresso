import { env } from '../../config/env.js';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './types.js';

const SYSTEM_INSTRUCTION =
  'Eres un compañero experto en reparación de cafeteras Nespresso Profesional. Responde de forma técnica, clara y segura.';

interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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

    if (file) {
      throw new Error('Groq provider does not support file attachments in this integration');
    }

    let systemPrompt = SYSTEM_INSTRUCTION;
    if (machineModel) {
      systemPrompt += ` Modelo actual: "${machineModel}".`;
    }

    const historyMessages: GroqChatMessage[] = history.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text,
    }));

    const messages: GroqChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    const raw = (await response.json()) as GroqChatResponse | { error?: { message?: string } };

    if (!response.ok) {
      const message =
        'error' in raw && raw.error?.message
          ? raw.error.message
          : `Groq API error (${response.status})`;
      throw new Error(message);
    }

    const text = (raw as GroqChatResponse).choices?.[0]?.message?.content?.trim() || '';
    return { text };
  }
}
