# Session Handoff - 2026-03-03

## Objetivo de la sesión
- Dejar el proyecto ejecutable en local sin depender de Gemini/Supabase.
- Migrar flujo de chat a Ollama local.

## Estado actual
- Base de datos local PostgreSQL creada: `nespresso_assistant`.
- Prisma sincronizado con DB local (`prisma db push` ejecutado correctamente).
- Backend compilando y validación de entorno OK.
- Frontend compilando OK.
- Ollama instalado y funcionando en Windows.
- Modelo disponible en Ollama:
  - `llama3:latest`

## Cambios aplicados en código/config
- `backend/.env`
  - `LLM_PROVIDER=ollama`
  - `OLLAMA_MODEL=llama3`
  - `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nespresso_assistant?schema=public"`
  - `FRONTEND_URL=http://localhost:3000`
  - `JWT_SECRET` generado (no placeholder).
- `backend/scripts/verifyEnv.mjs`
  - `SUPABASE_SERVICE_KEY` solo se exige si `SUPABASE_URL` está definido.
- CORS backend (`backend/src/server.ts`)
  - En `development`, permite `http://localhost:*` y `http://127.0.0.1:*`.
- Flujo DB local
  - Nuevo archivo: `docker-compose.local.yml` (Postgres local con Docker).
  - Scripts raíz en `package.json`: `db:up`, `db:down`, `db:logs`.
  - Scripts Prisma en `backend/package.json`: `prisma:push`, `prisma:generate`, `prisma:migrate`, `prisma:migrate:dev`, `prisma:migrate:reset`, `prisma:studio`.
- Tipado/controladores
  - Ajustes en `backend/src/controllers/chatController.ts` y `backend/src/controllers/repairsController.ts` para compilar con contrato canónico.

## Hallazgos importantes
- El puerto de frontend configurado en Vite es `3000` (`vite.config.ts`), no `5173`.
- El error 500 de `/api/chat` con Gemini era por cuota/keys inválidas; por eso se movió a Ollama.

## Cómo arrancar tras reinicio
1. Backend:
   - `cd C:\Users\Smarquez\asistente-Nespresso`
   - `npm --prefix backend run dev`
2. Frontend (otra terminal):
   - `cd C:\Users\Smarquez\asistente-Nespresso`
   - `npm run dev`
3. Abrir:
   - `http://localhost:3000`

## Opcional recomendado
- Para soporte de imágenes con Ollama:
  - `ollama pull llava`

## Verificaciones rápidas
- Health backend:
  - `http://localhost:3001/health`
- Modelos ollama:
  - `ollama list`

