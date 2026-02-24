export interface MessageContent {
  role: 'user' | 'model';
  text: string;
}

export interface FileData {
  mimeType: string;
  data: string; // base64
}

export interface GenerateContentResponse {
  text: string;
  groundingMetadata?: any;
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
