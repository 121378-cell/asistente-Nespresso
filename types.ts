/**
 * Tipos Canónicos - Nespresso Assistant API
 *
 * Estos tipos definen el contrato canónico entre frontend y backend.
 * Ver: docs/API_CONTRACT.md para la especificación completa.
 */

/**
 * Role de un mensaje en el chat
 * @see {@link https://github.com/121378-cell/asistente-Nespresso/blob/main/docs/API_CONTRACT.md#message}
 */
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

/**
 * Metadata de grounding para respuestas con Google Search
 * @see {@link https://github.com/121378-cell/asistente-Nespresso/blob/main/docs/API_CONTRACT.md#groundingmetadata}
 */
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: unknown[];
  webSearchQueries?: string[];
}

/**
 * Adjunto de archivo (imagen, video, etc.)
 * @see {@link https://github.com/121378-cell/asistente-Nespresso/blob/main/docs/API_CONTRACT.md#message}
 */
export interface FileAttachment {
  url: string; // data URL para preview
  type: string; // Mime type e.g. 'image/jpeg'
}

/**
 * Mensaje en el chat o reparación
 * @see {@link https://github.com/121378-cell/asistente-Nespresso/blob/main/docs/API_CONTRACT.md#message}
 */
export interface Message {
  role: Role;
  text: string;
  attachment?: FileAttachment;
  groundingMetadata?: GroundingMetadata;
}

/**
 * Reparación guardada
 * @see {@link https://github.com/121378-cell/asistente-Nespresso/blob/main/docs/API_CONTRACT.md#repair}
 */
export interface SavedRepair {
  id: string; // UUID v4
  name: string;
  machineModel: string | null;
  serialNumber: string | null;
  messages: Message[];
  timestamp: number; // Unix timestamp en ms
  usedParts?: UsedPart[];
}

/**
 * Parte utilizada en una reparación
 */
export interface UsedPart {
  id: string;
  partNumber: string;
  name: string;
  quantity: number;
}

/**
 * Paso de solución
 */
export interface SolutionStep {
  step: number;
  description: string;
  imagePlaceholder?: string; // Descripción para una futura imagen o diagrama
}

/**
 * Falla con pasos de solución
 */
export interface Fault {
  id: string;
  symptom: string;
  causes: string[];
  solutionSteps: SolutionStep[];
  preventionTips: string[];
}

/**
 * Item de checklist
 */
export interface ChecklistItem {
  id: string;
  text: string;
  section?: string;
  requiresValue?: boolean;
  unit?: string;
  min?: number;
  max?: number;
}
