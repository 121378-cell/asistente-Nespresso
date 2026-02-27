# Matriz de Variables de Entorno

Este documento centraliza todas las variables de entorno utilizadas en el proyecto Nespresso Assistant.

---

## 📋 Resumen Ejecutivo

| Área         | Variables | Requeridas | Opcionales |
| ------------ | --------- | ---------- | ---------- |
| **Frontend** | 2         | 2          | 0          |
| **Backend**  | 13        | 4          | 9          |
| **Total**    | 15        | 6          | 9          |

---

## 🎨 Frontend (.env.local)

Todas las variables del frontend deben prefixarse con `VITE_` para estar disponibles en el cliente.

### Variables Requeridas

| Variable              | Descripción               | Ejemplo                 | Validación        |
| --------------------- | ------------------------- | ----------------------- | ----------------- |
| `VITE_API_URL`        | URL de la API del backend | `http://localhost:3001` | URL válida        |
| `VITE_GEMINI_API_KEY` | API Key de Google Gemini  | `AIzaSy...`             | String > 20 chars |

### Variables Opcionales

| Variable             | Descripción               | Valores         | Default |
| -------------------- | ------------------------- | --------------- | ------- |
| `VITE_DEFAULT_THEME` | Tema por defecto de la UI | `dark`, `light` | `light` |

### Archivo de Ejemplo

```env
# Frontend Configuration
VITE_API_URL=http://localhost:3001
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional
# VITE_DEFAULT_THEME=dark
```

---

## 🔧 Backend (backend/.env)

### Variables Requeridas (Producción)

| Variable               | Descripción                  | Ejemplo                               | Validación            |
| ---------------------- | ---------------------------- | ------------------------------------- | --------------------- |
| `DATABASE_URL`         | URL de conexión a PostgreSQL | `postgresql://user:pass@host:5432/db` | URL PostgreSQL válida |
| `GEMINI_API_KEY`       | API Key de Google Gemini     | `AIzaSy...`                           | String > 20 chars     |
| `SUPABASE_URL`         | URL del proyecto Supabase    | `https://xxx.supabase.co`             | URL válida            |
| `SUPABASE_SERVICE_KEY` | Key de servicio Supabase     | `eyJhbG...`                           | JWT válido            |

### Variables Opcionales

| Variable          | Descripción                         | Valores                                            | Default                      |
| ----------------- | ----------------------------------- | -------------------------------------------------- | ---------------------------- |
| `PORT`            | Puerto del servidor HTTP            | `3001`, `8080`                                     | `3001`                       |
| `NODE_ENV`        | Entorno de ejecución                | `development`, `test`, `production`                | `development`                |
| `FRONTEND_URL`    | URL del frontend para CORS          | `http://localhost:3000`                            | `http://localhost:3000`      |
| `ALLOWED_ORIGINS` | Lista de orígenes permitidos (CORS) | `http://a.com,http://b.com`                        | `FRONTEND_URL`               |
| `TRUST_PROXY`     | Confiar en proxy inverso            | `true`, `false`, `1`                               | `false` (dev), `true` (prod) |
| `JWT_SECRET`      | Secreto para JWT tokens             | Cualquier string seguro                            | `your-secret-key-change-me`  |
| `LLM_PROVIDER`    | Proveedor de LLM                    | `gemini`, `ollama`                                 | `gemini`                     |
| `OLLAMA_MODEL`    | Modelo de Ollama                    | `llama3`, `mistral`                                | `llama3`                     |
| `LOG_LEVEL`       | Nivel de logging                    | `fatal`, `error`, `warn`, `info`, `debug`, `trace` | `info` (prod), `debug` (dev) |

### Archivo de Ejemplo

```env
# ═══════════════════════════════════════════════════════════════════════
# Database Configuration (Required)
# ═══════════════════════════════════════════════════════════════════════

DATABASE_URL="postgresql://postgres:password@localhost:5432/nespresso_assistant"

# ═══════════════════════════════════════════════════════════════════════
# AI / LLM Configuration (Required)
# ═══════════════════════════════════════════════════════════════════════

GEMINI_API_KEY=your_gemini_api_key_here

# LLM Provider: 'gemini' | 'ollama'
LLM_PROVIDER=gemini
OLLAMA_MODEL=llama3

# ═══════════════════════════════════════════════════════════════════════
# Server Configuration (Optional)
# ═══════════════════════════════════════════════════════════════════════

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
TRUST_PROXY=false

# CORS
# ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ═══════════════════════════════════════════════════════════════════════
# Security (Optional - Change in Production)
# ═══════════════════════════════════════════════════════════════════════

JWT_SECRET=your-secret-key-change-in-production

# ═══════════════════════════════════════════════════════════════════════
# Logging (Optional)
# ═══════════════════════════════════════════════════════════════════════

# LOG_LEVEL=debug
```

---

## 📊 Mapa de Variables por Módulo

### Autenticación

| Variable     | Módulo                         | Uso                 |
| ------------ | ------------------------------ | ------------------- |
| `JWT_SECRET` | backend/src/middleware/auth.ts | Firma de tokens JWT |

### Base de Datos

| Variable       | Módulo                       | Uso                 |
| -------------- | ---------------------------- | ------------------- |
| `DATABASE_URL` | backend/prisma/schema.prisma | Conexión PostgreSQL |

### IA / LLM

| Variable         | Módulo                                     | Uso                   |
| ---------------- | ------------------------------------------ | --------------------- |
| `GEMINI_API_KEY` | backend/src/services/gemini\*.ts           | API Gemini            |
| `LLM_PROVIDER`   | backend/src/services/geminiService.ts      | Selector de proveedor |
| `OLLAMA_MODEL`   | backend/src/services/llm/ollamaProvider.ts | Modelo Ollama         |

### Storage

| Variable               | Módulo                         | Uso                    |
| ---------------------- | ------------------------------ | ---------------------- |
| `SUPABASE_URL`         | backend/src/config/supabase.ts | Cliente Supabase       |
| `SUPABASE_SERVICE_KEY` | backend/src/config/supabase.ts | Autenticación Supabase |

### CORS

| Variable          | Módulo                | Uso                            |
| ----------------- | --------------------- | ------------------------------ |
| `FRONTEND_URL`    | backend/src/server.ts | Origen CORS principal          |
| `ALLOWED_ORIGINS` | backend/src/server.ts | Lista de orígenes permitidos   |
| `TRUST_PROXY`     | backend/src/server.ts | Configuración de proxy inverso |

### Server

| Variable    | Módulo                       | Uso                  |
| ----------- | ---------------------------- | -------------------- |
| `PORT`      | backend/src/server.ts        | Puerto HTTP          |
| `NODE_ENV`  | backend/src/config/env.ts    | Entorno de ejecución |
| `LOG_LEVEL` | backend/src/config/logger.ts | Nivel de logging     |

---

## 🔒 Seguridad

### Variables Sensibles (NUNCA commitear)

- ✅ `GEMINI_API_KEY`
- ✅ `DATABASE_URL` (en producción)
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `JWT_SECRET`
- ✅ `SUPABASE_URL` (en producción)

### Archivos .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Backend environment
backend/.env
backend/.env.local
backend/.env.*.local
```

---

## 🧪 Validación

### Frontend

Las variables del frontend se validan en tiempo de ejecución:

```typescript
// services/apiService.ts
const API_BASE_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:3001';
```

### Backend

Las variables del backend se validan al inicio con Zod:

```typescript
// backend/src/config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  // ...
});
```

**En producción**, el servidor falla si faltan variables requeridas.

---

## 📝 Comandos Útiles

### Verificar variables (Backend)

```bash
cd backend
node -e "console.log(process.env.DATABASE_URL ? '✅ DB configured' : '❌ DB missing')"
```

### Verificar variables (Frontend)

```bash
# En desarrollo
echo $VITE_API_URL

# Verificar en build
npm run build
```

### Validar configuración completa

```bash
# Frontend
npm run lint

# Backend
npm --prefix backend run build

# Tests
npm test
npm --prefix backend test
```

---

## 🚨 Solución de Problemas

### Error: "GEMINI_API_KEY not configured"

**Causa:** Variable faltante en backend/.env

**Solución:**

```bash
# Backend
echo "GEMINI_API_KEY=tu_key" >> backend/.env
```

### Error: "DATABASE_URL not configured"

**Causa:** Variable faltante en backend/.env

**Solución:**

```bash
# Backend
echo "DATABASE_URL=postgresql://..." >> backend/.env
```

### Error: "VITE_API_URL undefined"

**Causa:** Variable faltante en .env.local

**Solución:**

```bash
# Frontend
echo "VITE_API_URL=http://localhost:3001" >> .env.local
```

---

## 📚 Recursos Adicionales

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Zod Documentation](https://zod.dev/)
- [12 Factor App - Config](https://12factor.net/config)
- [Supabase Configuration](./SUPABASE_SETUP.md)
- [Setup Guide](./SETUP_GUIDE.md)

---

**Última actualización:** 2026-02-27
**Versión:** 1.0
