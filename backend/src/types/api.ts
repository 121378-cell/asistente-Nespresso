/**
 * Tipos Canónicos del Backend
 * 
 * Estos tipos definen el contrato canónico para la API del backend.
 * Deben coincidir con los tipos del frontend (services/apiTypes.ts).
 * 
 * @see {@link ../../services/apiTypes.ts} Frontend API types
 * @see {@link ../../../docs/API_CONTRACT.md} API Contract Documentation
 */

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

/**
 * Mensaje en el chat o reparación
 * Nota: El role usa mayúsculas para coincidir con el schema de Zod (USER/MODEL)
 */
export interface Message {
  role: 'USER' | 'MODEL';
  text: string;
  attachment?: {
    url: string;
    type: string;
  };
  groundingMetadata?: GroundingMetadata;
}

/**
 * Status de un job asíncrono
 */
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

/**
 * Response de error estándar
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  requestId?: string;
}
