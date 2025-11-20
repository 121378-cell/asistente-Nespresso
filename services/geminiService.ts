
import { GoogleGenAI, GenerateContentResponse, Part, Content, Type, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { fileToBase64 } from "../utils/fileUtils";
import { Message, Role } from "../types";

function mapMessagesToContent(messages: Message[]): Content[] {
    return messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }] // Simplified for now, attachments are handled in the new message
    }));
}

export async function generateResponse(
  history: Message[],
  message: string, 
  file?: File,
  useGoogleSearch?: boolean,
  machineModel?: string | null
): Promise<GenerateContentResponse> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Determine model based on task complexity and inputs
    const modelName = useGoogleSearch ? 'gemini-2.5-flash'
      : file?.type.startsWith('image/') ? 'gemini-2.5-flash'
      : file?.type.startsWith('video/') ? 'gemini-2.5-pro'
      : 'gemini-2.5-pro'; 

    const parts: Part[] = [{ text: message }];

    if (file) {
      const base64Data = await fileToBase64(file);
      parts.unshift({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    }

    const contents = [...mapMessagesToContent(history), { role: 'user', parts }];

    let finalSystemInstruction = SYSTEM_INSTRUCTION;
    if (machineModel) {
      finalSystemInstruction += `\n\nIMPORTANTE: El usuario está trabajando con una cafetera modelo "${machineModel}". Asegúrate de que todas tus respuestas, diagnósticos y pasos de reparación sean específicos para este modelo. Si no conoces el modelo, dilo honestamente, pero intenta dar una respuesta general basada en principios comunes de las Nespresso Profesional.`;
    }

    // Configurar herramientas
    const tools: any[] = [];
    if (useGoogleSearch) {
        tools.push({ googleSearch: {} });
    }

    const config: any = {
        systemInstruction: finalSystemInstruction,
    };

    if (tools.length > 0) {
        config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });

    return response;

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Lo siento, ha ocurrido un error al contactar con Gemini. Por favor, inténtalo de nuevo.");
  }
}

export async function generateSpeech(text: string): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // Voice tailored for calm guidance
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw error;
    }
}

export async function transcribeAudio(audioFile: File): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = await fileToBase64(audioFile);
        const audioPart: Part = {
            inlineData: {
                mimeType: audioFile.type,
                data: base64Data,
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [audioPart, { text: "Transcribe el siguiente audio:" }] }],
        });

        return response.text ?? "";
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return "No se pudo transcribir el audio. Inténtalo de nuevo.";
    }
}

export async function identifyMachineFromImage(base64Image: string): Promise<{ model: string; serialNumber: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart: Part = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart: Part = {
      text: `Analiza esta imagen de una cafetera. Identifica el modelo exacto y el número de serie. El número de serie suele estar en una pegatina con un código de barras. Responde con un JSON que se ajuste al esquema proporcionado. Si no encuentras uno de los campos, déjalo como un string vacío.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [imagePart, textPart] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            model: {
              type: Type.STRING,
              description: 'El nombre del modelo de la cafetera. Por ejemplo: "Zenius ZN 100 PRO".'
            },
            serialNumber: {
              type: Type.STRING,
              description: 'El número de serie completo de la cafetera.'
            },
          },
          required: ['model', 'serialNumber'],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response");

    let result;
    try {
        result = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", jsonText);
        throw new Error("La respuesta de la IA no es un JSON válido.");
    }
    
    if (result && typeof result.model === 'string' && typeof result.serialNumber === 'string') {
        return result;
    } else {
        throw new Error("La respuesta de la IA no tiene el formato esperado.");
    }

  } catch (error) {
    console.error("Error identifying machine from image:", error);
    throw new Error("No se pudo identificar la máquina desde la imagen. Inténtalo de nuevo con una foto más clara.");
  }
}
