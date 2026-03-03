import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getCacheKey, getCachedResponse, setCachedResponse } from './cacheService.js';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './llm/types.js';
import { GeminiProvider } from './llm/geminiProvider.js';
import { OllamaProvider } from './llm/ollamaProvider.js';
import { GroqProvider } from './llm/groqProvider.js';
import { retrieveRelevantKnowledge } from './knowledgeService.js';

// Re-export specific Google features
export { identifyMachineFromImage, generateVideo, checkVideoStatus } from './geminiLegacy.js';

// Factory Implementation
const getProvider = (): LLMProvider => {
  if (env.llmProvider === 'ollama') {
    return new OllamaProvider(env.ollamaModel);
  }
  if (env.llmProvider === 'groq') {
    return new GroqProvider(env.groqModel);
  }
  return new GeminiProvider();
};

export async function generateResponse(
  history: MessageContent[],
  message: string,
  file?: FileData,
  useGoogleSearch?: boolean,
  machineModel?: string | null
): Promise<GenerateContentResponse> {
  const knowledge = !file ? await retrieveRelevantKnowledge(message) : { contextText: '', sources: [] };
  const effectiveMessage = knowledge.contextText
    ? `Contexto de documentación técnica (RAG):
${knowledge.contextText}

Instrucciones:
- Usa primero este contexto si es relevante.
- Si el contexto no alcanza, dilo explícitamente y pide más detalles.
- Cita el documento y chunk cuando uses datos concretos.

Pregunta del usuario:
${message}`
    : message;

  // Cache key includes provider to avoid mixing local/cloud responses
  const cacheKey = getCacheKey(effectiveMessage, {
    history: history.slice(-2),
    machineModel,
    useGoogleSearch,
    provider: env.llmProvider,
    knowledgeSourceIds: knowledge.sources.map((source) => source.chunkId),
  });

  if (!file && !useGoogleSearch) {
    const cached = await getCachedResponse<GenerateContentResponse>(cacheKey);
    if (cached) {
      logger.info({ cacheKey, provider: env.llmProvider }, 'Cache hit for AI response');
      return cached;
    }
  }

  try {
    const provider = getProvider();
    const response = await provider.generateResponse(
      history,
      effectiveMessage,
      file,
      useGoogleSearch,
      machineModel
    );

    response.knowledgeSources = knowledge.sources;

    if (!file && !useGoogleSearch) {
      await setCachedResponse(cacheKey, response);
    }

    return response;
  } catch (error) {
    logger.error({ err: error, provider: env.llmProvider }, 'Error generating AI response');
    throw error;
  }
}
