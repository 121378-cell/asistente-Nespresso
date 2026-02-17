import { GoogleGenAI, GenerateContentResponse, Part, Content, Type } from '@google/genai';
import { env } from '../config/env.js';

const SYSTEM_INSTRUCTION = `Eres un compañero experto en reparación de cafeteras Nespresso Profesional. Tu especialidad abarca las gamas: **ZENIUS (ZN100)**, **GEMINI (CS203/CS223)** y **MOMENTO (80/100/200)**. Actúas como un técnico senior guiando a un compañero.

Tus Principios Fundamentales:

1.  **SEGURIDAD (PRIORIDAD #1):**
    *   **¡ALTO! 🛑**: Antes de abrir cualquier máquina (especialmente las Gemini que tienen 2 calderas o la Momento que tiene alto voltaje en placa), exige desconexión eléctrica.
    *   Advertencia: La CS223 tiene caldera de vapor a presión. Peligro de quemaduras graves.

2.  **LÓGICA DEDUCTIVA MULTI-MODELO:**
    *   **Zenius:** Compacta. Falla por bloqueos mecánicos y fusibles térmicos. Usa checklists estrictos de presión (19bar).
    *   **Gemini (CS203/223):** Doble cabezal. Si un lado funciona y el otro no, el problema es local (válvula de ese lado/bomba de ese lado). Si nada funciona, es central (Placa/Fuente).
        *   *CS223:* Problemas de leche = Pajas de aspiración fisuradas o boquillas sucias (99% de los casos).
    *   **Momento:** Electrónica avanzada. Se basa en códigos de error en pantalla y sensores de proximidad. El "Caudalímetro" (Flowmeter) y el Grupo Motorizado son los puntos de fallo críticos.

3.  **SOLUCIONES DE HARDWARE Y SOFTWARE:**
    *   Usa nombres técnicos: Bomba Fluid-o-Tech (Gemini), Bomba Ulka (Zenius), Módulo de Leche (Cappuccinatore), Unidad de Infusión (Brewing Unit), Thermoblock.

---

### MANUAL TÉCNICO: BASE DE DATOS EXPANDIDA

#### A. ZENIUS ZN 100 PRO (Resumen)
*   **Luces:** Rojo fijo = Error NTC/Placa. Descalcificación parpadeando = Modo activo.
*   **Checklist de Mantenimiento:** Revisa siempre la junta retenedora (color rojo/negro) y las 16 juntas tóricas internas.
*   **Reset:** Lungo + Ristretto + Power.

#### B. GEMINI CS 200 / CS 220 (CS203/CS223)
*   **Arquitectura:** Doble cabezal independiente. Depósito de agua doble (3L cada uno).
*   **Fallo Clásico - "Machine Locked / Descaling Needed":** Bloqueo por falta de descalcificación.
*   **Modo Técnico (Menu):** Presionar botón central (dial) durante 3 seg.
    *   **Modo Descalcificación:** Menú -> Care -> Descaling.
*   **Problemas de Leche (Solo CS223):**
    *   Si escupe vapor pero no espuma: Boquilla de aspiración (la paja) tiene una micro-fisura (efecto Venturi roto). Reemplazar.
    *   Si no sale nada: Bloqueo de cal en la caldera de vapor dedicada.

#### C. NESPRESSO MOMENTO (80/100/120/200)
*   **Interfaz:** Pantalla Táctil.
*   **Códigos de Error Comunes:**
    *   **Error 3xxx (301, 303):** Problemas de Grupo/Motor (El grupo no cierra/abre por obstrucción).
    *   **Error 1xxx (104, 106):** Problemas Hidráulicos (Caudalímetro calcificado o Bomba fatigada).
*   **Modo Técnico (Hidden Menu):**
    *   Tocar las 4 esquinas de la pantalla táctil en orden rápido: Arr-Izq -> Arr-Der -> Abj-Der -> Abj-Izq.
    *   Permite ver "Error Log" y hacer "I/O Test" de componentes.
*   **Sensores:** Si la máquina no despierta, limpiar el sensor IR bajo la pantalla.

Recuerda: Pregunta siempre el modelo si no lo sabes. Adapta tu lenguaje: Con una Gemini habla de "Cabezal Izquierdo/Derecho". Con una Momento habla de "Pantalla" y "Códigos".`;

interface MessageContent {
  role: 'user' | 'model';
  text: string;
}

interface FileData {
  mimeType: string;
  data: string; // base64
}

export async function generateResponse(
  history: MessageContent[],
  message: string,
  file?: FileData,
  useGoogleSearch?: boolean,
  machineModel?: string | null
): Promise<GenerateContentResponse> {
  try {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in backend');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Determine model based on task complexity and inputs
    const modelName = useGoogleSearch
      ? 'gemini-2.5-flash'
      : file?.mimeType.startsWith('image/')
        ? 'gemini-2.5-flash'
        : file?.mimeType.startsWith('video/')
          ? 'gemini-2.5-pro'
          : 'gemini-2.5-pro';

    const parts: Part[] = [{ text: message }];

    if (file) {
      parts.unshift({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      });
    }

    // Map history to Gemini format
    const contents: Content[] = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Add current message
    contents.push({ role: 'user', parts });

    let finalSystemInstruction = SYSTEM_INSTRUCTION;
    if (machineModel) {
      finalSystemInstruction += `\n\nIMPORTANTE: El usuario está trabajando con una cafetera modelo "${machineModel}". Asegúrate de que todas tus respuestas, diagnósticos y pasos de reparación sean específicos para este modelo. Si no conoces el modelo, dilo honestamente, pero intenta dar una respuesta general basada en principios comunes de las Nespresso Profesional.`;
    }

    // Configure tools
    const tools: { googleSearch?: Record<string, never> }[] = [];
    if (useGoogleSearch) {
      tools.push({ googleSearch: {} });
    }

    const config: {
      systemInstruction: string;
      tools?: { googleSearch?: Record<string, never> }[];
    } = {
      systemInstruction: finalSystemInstruction,
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config as never,
    });

    return response;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate response from Gemini');
  }
}

export async function identifyMachineFromImage(
  base64Image: string
): Promise<{ model: string; serialNumber: string }> {
  try {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in backend');
    }

    const ai = new GoogleGenAI({ apiKey });
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
              description: 'El nombre del modelo de la cafetera. Por ejemplo: "Zenius ZN 100 PRO".',
            },
            serialNumber: {
              type: Type.STRING,
              description: 'El número de serie completo de la cafetera.',
            },
          },
          required: ['model', 'serialNumber'],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error('Empty response from Gemini');

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse JSON response from Gemini:', jsonText);
      throw new Error('Invalid JSON response from Gemini');
    }

    if (result && typeof result.model === 'string' && typeof result.serialNumber === 'string') {
      return result;
    } else {
      throw new Error('Unexpected response format from Gemini');
    }
  } catch (error) {
    console.error('Error identifying machine from image:', error);
    throw new Error('Failed to identify machine from image');
  }
}

/**
 * Generate video from image and prompt using Veo
 */
export async function generateVideo(
  prompt: string,
  image: { imageBytes: string; mimeType: string },
  aspectRatio: '16:9' | '9:16'
): Promise<any> {
  try {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in backend');
    }

    const ai = new GoogleGenAI({ apiKey });

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio,
      },
    });

    return operation;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error('Failed to generate video');
  }
}

/**
 * Check status of video generation operation
 */
export async function checkVideoStatus(operationData: any): Promise<any> {
  try {
    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in backend');
    }

    const ai = new GoogleGenAI({ apiKey });

    const operation = await ai.operations.getVideosOperation({
      operation: operationData,
    });

    return operation;
  } catch (error) {
    console.error('Error checking video status:', error);
    throw new Error('Failed to check video status');
  }
}
