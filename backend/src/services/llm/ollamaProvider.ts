import ollama from 'ollama';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './types.js';
import { logger } from '../../config/logger.js';

const SYSTEM_INSTRUCTION = `Eres un compañero experto en reparación de cafeteras Nespresso Profesional. Tu especialidad abarca las gamas: **ZENIUS (ZN100)**, **GEMINI (CS203/CS223)** y **MOMENTO (80/100/200)**.
(Mantener instrucciones resumidas para modelos locales más pequeños...)
Actúas como un técnico senior guiando a un compañero.
1. SEGURIDAD PRIMERO.
2. Diagnóstico paso a paso.
3. Usa nombres técnicos correctos.`;

export class OllamaProvider implements LLMProvider {
  private modelName: string;

  constructor(modelName: string = 'llama3') {
    this.modelName = modelName;
  }

  async generateResponse(
    history: MessageContent[],
    message: string,
    file?: FileData,
    _useGoogleSearch?: boolean,
    machineModel?: string | null
  ): Promise<GenerateContentResponse> {
    try {
      // 1. Elegir modelo (Llava si hay imagen, sino el default)
      let model = this.modelName;
      let images: string[] | undefined;

      if (file && file.mimeType.startsWith('image/')) {
        model = 'llava'; // Fallback a modelo de visión común en Ollama
        images = [file.data]; // Ollama espera base64
        logger.info('Image detected, switching to llava model for Ollama');
      }

      // 2. Construir contexto
      let systemPrompt = SYSTEM_INSTRUCTION;
      if (machineModel) {
        systemPrompt += `
IMPORTANTE: Modelo de máquina actual: "${machineModel}".`;
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((msg) => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text,
        })),
        { role: 'user', content: message, images },
      ];

      // 3. Llamar a Ollama
      logger.info({ model, messageLength: message.length }, 'Calling Ollama API');
      const response = await ollama.chat({
        model: model,
        messages: messages,
        stream: false,
      });

      return {
        text: response.message.content,
        // Ollama no tiene grounding metadata nativo como Gemini
        groundingMetadata: undefined,
      };
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate response from Ollama');
      // Fallback amigable si el modelo no existe
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error(
          `El modelo '${this.modelName}' (o 'llava') no está instalado en Ollama. Ejecuta 'ollama pull ${this.modelName}' en tu terminal.`
        );
      }
      throw error;
    }
  }
}
