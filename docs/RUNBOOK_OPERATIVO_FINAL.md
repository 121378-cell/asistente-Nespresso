# Runbook Operativo Final

Fecha: 24 de febrero de 2026

## Objetivo

Disponer de una guía única para operar el sistema en producción: validación previa, release, rollback y troubleshooting sin depender del equipo de desarrollo.

## Pre-release (checklist)

1. Sincronizar rama principal:
   - `git checkout main && git pull origin main`
2. Validar gates locales:
   - `npm run deploy:check`
   - `npm --prefix backend run test:video-async`
3. Revisar salud base:
   - `curl -i https://<api>/health`
   - `curl https://<api>/metrics`

## Procedimiento de release

1. Confirmar que los checks de CI en `main` estén en verde.
2. Publicar frontend/backend con pipeline habitual del entorno.
3. Verificación post-deploy (10-15 min):
   - `GET /health` responde `status: ok`.
   - `GET /metrics` sin errores de recolección.
   - Flujo crítico UI: navegación + chat + guardar reparación.
   - Flujo async: generar video y consultar estado.

## Procedimiento de rollback

1. Identificar commit estable anterior:
   - `git log --oneline -n 20`
2. Revertir el commit problemático en `main`:
   - `git revert <sha>`
   - `git push origin main`
3. Re-ejecutar verificación post-deploy:
   - `GET /health`
   - `GET /metrics`
   - smoke funcional UI/API

## Troubleshooting

1. API no saludable:
   - Revisar variables de entorno y arranque backend.
   - Revisar logs por `requestId`.
2. Errores de flujo async:
   - Revisar `videoAsync`/`imageAsync` en `/metrics`.
   - Usar `docs/RUNBOOK_VIDEO_ASYNC.md` para DLQ/redrive.
3. Problemas PWA/offline:
   - Confirmar registro SW en `index.tsx` (`/sw.js`).
   - Confirmar `manifest.json` e iconos presentes en `public/`.

## Referencias

- `docs/QUALITY_GATES.md`
- `docs/OBSERVABILIDAD_BASELINE.md`
- `docs/RUNBOOK_VIDEO_ASYNC.md`
- `docs/PWA_INSTALL_CHECKLIST.md`
