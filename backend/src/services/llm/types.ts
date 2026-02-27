export interface MessageContent {
  role: 'user' | 'model';
  text: string;
}

export interface FileData {
  mimeType: string;
  data: string; // base64
}

/**
 * Metadata de grounding para respuestas con Google Search
 */
export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
  groundingSupports?: unknown[];
  webSearchQueries?: string[];
}

export interface GenerateContentResponse {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export interface LLMProvider {
  generateResponse(
    history: MessageContent[],
    message: string,
    file?: FileData,
    useGoogleSearch?: boolean,
    machineModel?: string | null
  ): Promise<GenerateContentResponse>;
}
