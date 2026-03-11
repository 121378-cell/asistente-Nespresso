import axios from 'axios';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './types.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

const SYSTEM_INSTRUCTION = `Eres un experto senior en reparación de cafeteras Nespresso Profesional (Zenius, Gemini, Momento).
Tu objetivo es guiar a técnicos de campo con precisión técnica, seguridad y brevedad.
1. Prioriza la seguridad eléctrica y de presión.
2. Usa terminología técnica oficial.
3. Si el usuario describe un síntoma, ofrece un diagnóstico diferencial paso a paso.`;

export class DeepSeekProvider implements LLMProvider {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'deepseek-chat') {
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async generateResponse(
    history: MessageContent[],
    message: string,
    _file?: FileData,
    _useGoogleSearch?: boolean,
    machineModel?: string | null
  ): Promise<GenerateContentResponse> {
    try {
      const messages = [
        {
          role: 'system',
          content: SYSTEM_INSTRUCTION + (machineModel ? `\nModelo actual: ${machineModel}` : ''),
        },
        ...history.map((msg) => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text,
        })),
        { role: 'user', content: message },
      ];

      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: this.modelName,
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        text: response.data.choices[0].message.content,
      };
    } catch (error) {
      logger.error({ err: error }, 'DeepSeek API Error');
      throw new Error('Error al comunicar con DeepSeek. Verifica tu API Key.');
    }
  }
}
