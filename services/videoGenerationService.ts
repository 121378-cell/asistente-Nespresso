import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

// Helper to access window.aistudio safely without TypeScript errors
const getAIStudio = () => {
  return (window as any).aistudio;
};

export const checkApiKey = async (): Promise<boolean> => {
  const aiStudio = getAIStudio();
  if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
    return await aiStudio.hasSelectedApiKey();
  }
  // Fallback for environments where aistudio is not available
  // Using try-catch to safely access process.env if it's not defined
  try {
    return !!process.env.API_KEY;
  } catch (e) {
    return false;
  }
};

export const requestApiKey = async (): Promise<void> => {
   const aiStudio = getAIStudio();
   if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
    await aiStudio.openSelectKey();
  }
};


export const generateVideo = async (
    prompt: string,
    image: { imageBytes: string; mimeType: string; },
    aspectRatio: '16:9' | '9:16'
): Promise<GenerateVideosOperation> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        }
    });
};

export const checkVideoStatus = async (operation: GenerateVideosOperation): Promise<GenerateVideosOperation> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.operations.getVideosOperation({ operation });
};