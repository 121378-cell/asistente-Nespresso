# Política de Logging y Sanitización

Fecha: 24 de febrero de 2026

## Objetivo

Garantizar logs estructurados útiles para operación sin exponer secretos, credenciales o datos sensibles.

## Reglas

1. No registrar payloads de usuario completos (mensajes, prompts, imágenes base64).
2. No registrar credenciales ni tokens.
3. Respuestas 5xx en producción sin detalles internos (`stack`, SQL, internals).
4. Correlación obligatoria por `requestId` y, en async, `jobId`.

## Redacción automática

El logger central (`backend/src/config/logger.ts`) aplica redacción (`pino.redact`) para:

- `authorization`, `cookie` en headers.
- Campos sensibles comunes: `password`, `token`, `jwt`, `apiKey`, `secret`.

## Implementación actual

- Logging HTTP estructurado por `pino-http` en `backend/src/middleware/httpLogger.ts`.
- Policy centralizada de 5xx en `backend/src/utils/errorResponse.ts`.
- Controladores backend migrados a helper único de error.
- Logs de workers ajustados para evitar exposición innecesaria de resultados sensibles.

## Verificación recomendada

1. Forzar errores 4xx/5xx y revisar logs.
2. Confirmar que no aparezcan secretos/PII en texto plano.
3. Verificar presencia de `requestId` en errores operativos.
