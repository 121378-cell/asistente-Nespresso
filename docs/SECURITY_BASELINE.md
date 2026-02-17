# Security Baseline (Fase 1)

Fecha: 17 de febrero de 2026

## Controles aplicados

1. Validación centralizada de entorno (`backend/src/config/env.ts`).

- Tipado y validación con `zod`.
- Variables críticas obligatorias en producción.
- Detección de placeholders inseguros (`your_*`, `example`, etc.).
- Compatibilidad temporal para `SUPABASE_SERVICE_ROLE_KEY` con aviso de deprecación.

2. Hardening HTTP en backend.

- `helmet` aplicado a `'/api'`, `'/health'` y `'/metrics'`.
- CSP restrictiva para endpoints API (`default-src 'none'`).
- `x-powered-by` deshabilitado.
- `trust proxy` configurable vía `TRUST_PROXY`.

3. CORS restringido por allowlist.

- Validación de origen contra `ALLOWED_ORIGINS`.
- Rechazo explícito de orígenes fuera de política.

4. Dependencias con vulnerabilidades altas mitigadas.

- `npm --prefix backend audit fix`.
- Resultado actual: `0` vulnerabilidades (`high/critical/moderate/low`).

## Variables de entorno relevantes

Backend (`backend/.env`):

- `NODE_ENV`
- `PORT`
- `TRUST_PROXY`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

## Validación operativa

1. Build backend:

```bash
npm --prefix backend run build
```

2. Tests backend:

```bash
npm --prefix backend test
```

3. Auditoría dependencias backend:

```bash
npm --prefix backend audit --json
```
