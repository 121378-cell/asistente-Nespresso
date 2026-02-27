# Contrato Canónico de API - Nespresso Assistant

Este documento define el contrato canónico (oficial) para la API del Nespresso Assistant. Sirve como fuente única de verdad para los endpoints de **Chat** y **Reparaciones**.

---

## 📋 Tabla de Contenidos

1. [Principios de Diseño](#-principios-de-diseño)
2. [Endpoints de Chat](#-endpoints-de-chat)
3. [Endpoints de Reparaciones](#-endpoints-de-reparaciones)
4. [Tipos de Datos Canónicos](#-tipos-de-datos-canónicos)
5. [Códigos de Error](#-códigos-de-error)
6. [Ejemplos de Request/Response](#-ejemplos-de-requestresponse)

---

## 🎯 Principios de Diseño

### Convenciones

| Aspecto          | Convención          | Ejemplo                                |
| ---------------- | ------------------- | -------------------------------------- |
| **Base URL**     | `/api`              | `/api/chat`, `/api/repairs`            |
| **Métodos HTTP** | RESTful             | `GET`, `POST`, `PUT`, `DELETE`         |
| **Formato**      | JSON                | `application/json`                     |
| **Nomenclatura** | camelCase           | `machineModel`, `serialNumber`         |
| **IDs**          | UUID v4             | `550e8400-e29b-41d4-a716-446655440000` |
| **Fechas**       | Unix timestamp (ms) | `1709049600000`                        |
| **Nullables**    | Explícitos          | `machineModel: string \| null`         |

### Versionado

- **Versión actual:** `v1` (implícita)
- **Estrategia:** URL versioning cuando sea necesario (`/api/v2/...`)

---

## 💬 Endpoints de Chat

### POST `/api/chat`

Generar respuesta de IA basada en historial y mensaje.

**Request:**

```typescript
interface ChatRequest {
  message: string; // Requerido, mín 1 carácter
  history: Message[]; // Requerido, array de mensajes
  file?: FileData; // Opcional, archivo adjunto
  useGoogleSearch?: boolean; // Opcional, default: false
  machineModel?: string | null; // Opcional, contexto
}

interface Message {
  role: 'USER' | 'MODEL';
  text: string;
  attachment?: {
    url: string;
    type: string;
  };
  groundingMetadata?: GroundingMetadata;
}

interface FileData {
  mimeType: string;
  data: string; // Base64
}
```

**Response (200 OK):**

```typescript
interface ChatResponse {
  text: string;
  groundingMetadata?: GroundingMetadata | null;
}
```

**Errores:**

| Código | Mensaje                                    | Causa                         |
| ------ | ------------------------------------------ | ----------------------------- |
| `400`  | `Message is required and must be a string` | `message` faltante o inválido |
| `400`  | `History must be an array`                 | `history` no es array         |
| `429`  | `Too many requests`                        | Rate limit excedido           |
| `500`  | `Failed to generate response`              | Error interno                 |

---

### POST `/api/chat/identify-machine`

Identificar modelo y número de serie desde imagen.

**Request:**

```typescript
interface IdentifyMachineRequest {
  image: string; // Base64, requerido
}
```

**Response (200 OK):**

```typescript
interface IdentifyMachineResponse {
  model: string;
  serialNumber: string;
}
```

**Errores:**

| Código | Mensaje                                 | Causa               |
| ------ | --------------------------------------- | ------------------- |
| `400`  | `Image data is required`                | `image` faltante    |
| `429`  | `Too many requests`                     | Rate limit excedido |
| `500`  | `Failed to identify machine from image` | Error en IA         |

---

### POST `/api/chat/identify-machine/async`

Iniciar job asíncrono para identificar máquina.

**Request:** (mismo que `identify-machine`)

**Response (202 Accepted):**

```typescript
interface AsyncJobResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: number;
}
```

---

### GET `/api/chat/identify-machine/status/:jobId`

Verificar estado de job asíncrono.

**Response (200 OK):**

```typescript
interface JobStatusResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: IdentifyMachineResponse;
  error?: string;
  attempts: number;
  maxAttempts: number;
  updatedAt: number;
}
```

---

## 🔧 Endpoints de Reparaciones

### GET `/api/repairs`

Obtener todas las reparaciones guardadas.

**Query Params (opcionales):**

| Param    | Tipo   | Descripción                         |
| -------- | ------ | ----------------------------------- |
| `limit`  | number | Máximo de resultados (default: 100) |
| `offset` | number | Offset para paginación (default: 0) |
| `model`  | string | Filtrar por modelo de máquina       |

**Response (200 OK):**

```typescript
interface GetRepairsResponse {
  repairs: Repair[];
  total: number;
}

interface Repair {
  id: string; // UUID
  name: string;
  machineModel: string | null;
  serialNumber: string | null;
  timestamp: number; // Unix ms
  messages: RepairMessage[];
}

interface RepairMessage {
  role: 'USER' | 'MODEL';
  text: string;
  attachment?: {
    url: string;
    type: string;
  };
  groundingMetadata?: GroundingMetadata;
}
```

---

### GET `/api/repairs/:id`

Obtener reparación específica por ID.

**Params:**

| Param | Tipo | Descripción         |
| ----- | ---- | ------------------- |
| `id`  | UUID | ID de la reparación |

**Response (200 OK):**

```typescript
interface GetRepairResponse extends Repair {}
```

**Errores:**

| Código | Mensaje                    | Causa               |
| ------ | -------------------------- | ------------------- |
| `400`  | `Invalid repair ID format` | UUID inválido       |
| `404`  | `Repair not found`         | ID no existe        |
| `429`  | `Too many requests`        | Rate limit excedido |

---

### POST `/api/repairs`

Crear nueva reparación.

**Request:**

```typescript
interface CreateRepairRequest {
  name: string; // Requerido, mín 1 carácter
  machineModel: string | null; // Requerido (puede ser null)
  serialNumber: string | null; // Requerido (puede ser null)
  timestamp: number; // Requerido, Unix ms
  messages: RepairMessage[]; // Requerido, mín 1 mensaje
}
```

**Response (201 Created):**

```typescript
interface CreateRepairResponse extends Repair {}
```

**Errores:**

| Código | Mensaje                               | Causa               |
| ------ | ------------------------------------- | ------------------- |
| `400`  | `Name is required`                    | `name` faltante     |
| `400`  | `At least one message is required`    | `messages` vacío    |
| `400`  | `Timestamp must be a positive number` | Timestamp inválido  |
| `429`  | `Too many requests`                   | Rate limit excedido |

---

### PUT `/api/repairs/:id`

Actualizar reparación existente.

**Params:**

| Param | Tipo | Descripción         |
| ----- | ---- | ------------------- |
| `id`  | UUID | ID de la reparación |

**Request:**

```typescript
interface UpdateRepairRequest {
  name?: string;
  machineModel?: string | null;
  serialNumber?: string | null;
}
// Al menos un campo es requerido
```

**Response (200 OK):**

```typescript
interface UpdateRepairResponse extends Repair {}
```

**Errores:**

| Código | Mensaje                               | Causa               |
| ------ | ------------------------------------- | ------------------- |
| `400`  | `Invalid repair ID format`            | UUID inválido       |
| `400`  | `At least one field must be provided` | Request vacío       |
| `404`  | `Repair not found`                    | ID no existe        |
| `429`  | `Too many requests`                   | Rate limit excedido |

---

### DELETE `/api/repairs/:id`

Eliminar reparación.

**Params:**

| Param | Tipo | Descripción         |
| ----- | ---- | ------------------- |
| `id`  | UUID | ID de la reparación |

**Response (200 OK):**

```typescript
interface DeleteRepairResponse {
  message: string; // "Repair deleted successfully"
}
```

**Errores:**

| Código | Mensaje                    | Causa               |
| ------ | -------------------------- | ------------------- |
| `400`  | `Invalid repair ID format` | UUID inválido       |
| `404`  | `Repair not found`         | ID no existe        |
| `429`  | `Too many requests`        | Rate limit excedido |

---

### GET `/api/repairs/:id/pdf`

Exportar reparación a PDF.

**Response (200 OK):**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="repair-{id}.pdf"`

**Errores:**

| Código | Mensaje                    | Causa         |
| ------ | -------------------------- | ------------- |
| `400`  | `Invalid repair ID format` | UUID inválido |
| `404`  | `Repair not found`         | ID no existe  |

---

## 📊 Tipos de Datos Canónicos

### GroundingMetadata

```typescript
interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  webSearchQueries?: string[];
}

interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

interface GroundingSupport {
  segment?: {
    startIndex?: number;
    endIndex?: number;
    text?: string;
  };
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}
```

### JobStatus

```typescript
type JobStatus =
  | 'queued' // Job en cola esperando procesamiento
  | 'running' // Job en procesamiento
  | 'completed' // Job completado exitosamente
  | 'failed'; // Job fallido (tras agotar reintentos)
```

---

## ❌ Códigos de Error

### Errores Estándar

```typescript
interface ErrorResponse {
  error: string;
  message?: string;
  requestId?: string;
}
```

### Códigos HTTP

| Código | Significado           | Uso                      |
| ------ | --------------------- | ------------------------ |
| `200`  | OK                    | Éxito en GET, PUT        |
| `201`  | Created               | Éxito en POST (creación) |
| `202`  | Accepted              | Job asíncrono aceptado   |
| `400`  | Bad Request           | Validación fallida       |
| `404`  | Not Found             | Recurso no existe        |
| `429`  | Too Many Requests     | Rate limit excedido      |
| `500`  | Internal Server Error | Error interno            |

---

## 📝 Ejemplos de Request/Response

### Ejemplo 1: Chat con historial

**Request:**

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cómo limpio mi cafetera?",
    "history": [
      {"role": "USER", "text": "Hola"},
      {"role": "MODEL", "text": "¡Hola! ¿En qué puedo ayudarte?"}
    ],
    "machineModel": "Zenius ZN100"
  }'
```

**Response:**

```json
{
  "text": "Para limpiar tu cafetera Zenius, sigue estos pasos...",
  "groundingMetadata": null
}
```

---

### Ejemplo 2: Crear reparación

**Request:**

```bash
curl -X POST http://localhost:3001/api/repairs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cafetera no enciende",
    "machineModel": "Gemini CS203",
    "serialNumber": "CS203-123456",
    "timestamp": 1709049600000,
    "messages": [
      {
        "role": "USER",
        "text": "Mi cafetera no enciende"
      },
      {
        "role": "MODEL",
        "text": "Verifica que esté conectada a la corriente"
      }
    ]
  }'
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Cafetera no enciende",
  "machineModel": "Gemini CS203",
  "serialNumber": "CS203-123456",
  "timestamp": 1709049600000,
  "messages": [
    { "role": "USER", "text": "Mi cafetera no enciende" },
    { "role": "MODEL", "text": "Verifica que esté conectada a la corriente" }
  ]
}
```

---

### Ejemplo 3: Identificar máquina (async)

**Request:**

```bash
curl -X POST http://localhost:3001/api/chat/identify-machine/async \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

**Response (202):**

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "createdAt": 1709049600000
}
```

**Polling:**

```bash
curl http://localhost:3001/api/chat/identify-machine/status/550e8400-e29b-41d4-a716-446655440000
```

**Response (completado):**

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result": {
    "model": "Zenius ZN100 PRO",
    "serialNumber": "ZN100-789012"
  },
  "attempts": 1,
  "maxAttempts": 3,
  "updatedAt": 1709049605000
}
```

---

## 🔗 Recursos Relacionados

- [OpenAPI/Swagger Spec](./API_SPEC.yaml) - Especificación OpenAPI completa
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Variables de entorno
- [Security Baseline](./SECURITY_BASELINE.md) - Seguridad y autenticación
- [Rate Limits](./RATE_LIMITS.md) - Límites de rate limiting

---

**Versión:** 1.0  
**Última actualización:** 2026-02-27  
**Estado:** ✅ Implementado en producción
