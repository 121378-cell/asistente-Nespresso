/**
 * Tipos de la API - Contrato Canónico
 *
 * Estos tipos definen las estructuras de request/response de la API.
 * Ver: docs/API_CONTRACT.md para la especificación completa.
 */

import { Message, GroundingMetadata } from '../types';

// ═══════════════════════════════════════════════════════════════════════
// CHAT API
// ═══════════════════════════════════════════════════════════════════════

/**
 * Request para POST /api/chat
 */
export interface ChatRequest {
  message: string; // Requerido, mín 1 carácter
  history: Message[]; // Requerido, array de mensajes
  file?: FileData; // Opcional, archivo adjunto
  useGoogleSearch?: boolean; // Opcional, default: false
  machineModel?: string | null; // Opcional, contexto
}

/**
 * Response para POST /api/chat
 */
export interface ChatResponse {
  text: string;
  groundingMetadata?: GroundingMetadata | null;
}

/**
 * Datos de archivo adjunto
 */
export interface FileData {
  mimeType: string;
  data: string; // Base64
}

/**
 * Request para POST /api/chat/identify-machine
 */
export interface IdentifyMachineRequest {
  image: string; // Base64, requerido
}

/**
 * Response para POST /api/chat/identify-machine
 */
export interface IdentifyMachineResponse {
  model: string;
  serialNumber: string;
}

// ═══════════════════════════════════════════════════════════════════════
// ASYNC JOBS (Chat & Video)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Status de un job asíncrono
 */
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

/**
 * Response para endpoints async (job creado)
 * Ejemplos: POST /api/chat/identify-machine/async, POST /api/video/async
 */
export interface AsyncJobResponse {
  jobId: string; // UUID
  status: JobStatus;
  createdAt: number; // Unix timestamp en ms
}

/**
 * Response para endpoints de status por jobId
 * Ejemplos: GET /api/chat/identify-machine/status/:jobId, GET /api/video/status/:jobId
 */
export interface JobStatusResponse<T = unknown> {
  jobId: string;
  status: JobStatus;
  result?: T;
  error?: string;
  attempts: number;
  maxAttempts: number;
  updatedAt: number; // Unix timestamp en ms
}

// ═══════════════════════════════════════════════════════════════════════
// REPAIRS API
// ═══════════════════════════════════════════════════════════════════════

/**
 * Reparación (sin mensajes completos para listados)
 */
export interface RepairSummary {
  id: string;
  name: string;
  machineModel: string | null;
  serialNumber: string | null;
  timestamp: number;
  messages?: Array<{
    id: string;
    role: string;
    text: string;
  }>;
}

/**
 * Response para GET /api/repairs
 */
export interface GetRepairsResponse {
  repairs: RepairSummary[];
  total: number;
}

/**
 * Request para POST /api/repairs
 */
export interface CreateRepairRequest {
  name: string; // Requerido, mín 1 carácter
  machineModel: string | null; // Requerido (puede ser null)
  serialNumber: string | null; // Requerido (puede ser null)
  timestamp: number; // Requerido, Unix ms
  messages: Message[]; // Requerido, mín 1 mensaje
}

/**
 * Response para POST /api/repairs, GET /api/repairs/:id, PUT /api/repairs/:id
 */
export interface RepairResponse {
  id: string;
  name: string;
  machineModel: string | null;
  serialNumber: string | null;
  timestamp: number;
  messages: Message[];
}

/**
 * Request para PUT /api/repairs/:id
 */
export interface UpdateRepairRequest {
  name?: string;
  machineModel?: string | null;
  serialNumber?: string | null;
}

/**
 * Response para DELETE /api/repairs/:id
 */
export interface DeleteRepairResponse {
  message: string; // "Repair deleted successfully"
}

// ═══════════════════════════════════════════════════════════════════════
// ANALYTICS API
// ═══════════════════════════════════════════════════════════════════════

/**
 * Conteo por modelo
 */
export interface AnalyticsModelCount {
  model: string;
  count: number;
}

/**
 * Conteo por mes
 */
export interface AnalyticsMonthCount {
  month: string;
  count: number;
}

/**
 * Response para GET /api/analytics/stats
 */
export interface AnalyticsStatsResponse {
  totalRepairs: number;
  totalMessages: number;
  recentRepairs: number;
  repairsByModel: AnalyticsModelCount[];
  repairsByMonth: AnalyticsMonthCount[];
}

/**
 * Params para GET /api/analytics/search
 */
export interface SearchRepairsParams {
  query?: string;
  model?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response para GET /api/analytics/search
 */
export interface SearchRepairsResponse {
  repairs: RepairResponse[];
  total: number;
  limit: number;
  offset: number;
}

// ═══════════════════════════════════════════════════════════════════════
// ERROR RESPONSES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Response de error estándar
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  requestId?: string;
}
