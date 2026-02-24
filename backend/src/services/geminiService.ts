import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getCacheKey, getCachedResponse, setCachedResponse } from './cacheService.js';
import { LLMProvider, MessageContent, FileData, GenerateContentResponse } from './llm/types.js';
import { GeminiProvider } from './llm/geminiProvider.js';
import { OllamaProvider } from './llm/ollamaProvider.js';

// Re-export specific Google features
export { identifyMachineFromImage, generateVideo, checkVideoStatus } from './geminiLegacy.js';

// Factory Implementation
const getProvider = (): LLMProvider => {
  if (env.llmProvider === 'ollama') {
    return new OllamaProvider(env.ollamaModel);
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
  // Cache key includes provider to avoid mixing local/cloud responses
  const cacheKey = getCacheKey(message, {
    history: history.slice(-2),
    machineModel,
    useGoogleSearch,
    provider: env.llmProvider,
  });

  if (!file && !useGoogleSearch) {
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      logger.info({ cacheKey, provider: env.llmProvider }, 'Cache hit for AI response');
      return cached;
    }
  }

  try {
    const provider = getProvider();
    const response = await provider.generateResponse(
      history,
      message,
      file,
      useGoogleSearch,
      machineModel
    );

    if (!file && !useGoogleSearch) {
      await setCachedResponse(cacheKey, response);
    }

    return response;
  } catch (error) {
    logger.error({ err: error, provider: env.llmProvider }, 'Error generating AI response');
    throw error;
  }
}
