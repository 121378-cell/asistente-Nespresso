# Estado de tareas del proyecto

Fecha de actualización: 17 de febrero de 2026

## Tareas realizadas

1. Reactivación y estabilización de suites E2E antes excluidas.
   - Commit: `34fbee7`
2. Reducción importante de warnings y limpieza de tipado (`any`) en frontend y servicios.
   - Commit: `e402f92`
3. Estabilización de pre-commit/lint y endurecimiento de checks de despliegue.
   - Commit: `003ce59`
4. Correcciones de build TypeScript y alineación de tipados en hooks/tests.
   - Commit: `7213b38`
5. Compleción de E2E de reparaciones y cámara que estaban en `test.skip`.
   - Commit: `f6415f3`
6. Estabilización de flujos E2E de navegación, chat y modales.
   - Commit: `18a41a1`
7. Actualización de `baseline-browser-mapping` para eliminar warning de Playwright.
   - Commit: `dfead6b`
8. Registro del estado del proyecto en documento de seguimiento.
   - Commit: `7e8dc17`
9. Validación E2E completa posterior a actualización de dependencias.
   - Resultado: `27/27` tests E2E en Chromium (`npx playwright test --project=chromium --workers=1 --reporter=line`).
10. Corrección de vulnerabilidad alta reportada por `npm audit`.
    - Acción: actualización de `axios` a la versión más reciente.
    - Resultado: `npm audit` con `0` vulnerabilidades.
11. Verificación de CI/CD remoto en GitHub Actions para `main`.
    - Runs recientes en verde:
      - `22065194576` (SHA `7e8dc17`) https://github.com/121378-cell/asistente-Nespresso/actions/runs/22065194576
      - `22064433493` (SHA `dfead6b`) https://github.com/121378-cell/asistente-Nespresso/actions/runs/22064433493
      - `22063013245` (SHA `18a41a1`) https://github.com/121378-cell/asistente-Nespresso/actions/runs/22063013245
12. Configuración explícita de identidad Git en el repositorio local.
    - `user.name`: `Sergio Marquez Brugal`
    - `user.email`: `SMarquez@femarec.cat`
13. Implementación de observabilidad base (Fase 1 - issue `#26`).
    - Request tracing con `x-request-id` en frontend y backend.
    - Métricas HTTP en `GET /metrics` (latencia p50/p95/p99, errores, throughput).
    - `GET /health` ahora incluye `requestId` para correlación.
    - Documentación operativa: `docs/OBSERVABILIDAD_BASELINE.md`.
14. Implementación de security baseline (Fase 1 - issue `#27`).
    - Validación centralizada de variables de entorno (`backend/src/config/env.ts`).
    - Hardening de cabeceras con `helmet` en API/health/metrics y CSP restrictiva.
    - CORS por allowlist (`ALLOWED_ORIGINS`) y desactivación de `x-powered-by`.
    - Dependencias backend saneadas: `npm audit` en `0` vulnerabilidades.
    - Documentación operativa: `docs/SECURITY_BASELINE.md`.
15. Implementación de quality gates CI/CD (Fase 1 - issue `#28`, parcial).
    - Workflow nuevo: `.github/workflows/quality-gates.yml`.
    - Jobs bloqueantes definidos: frontend lint/test/build, backend test/build, audit dependencias y E2E smoke.
    - Ajuste de tests frontend para compatibilidad con interceptores Axios (`tests/apiService.test.ts`).
    - Validaciones locales equivalentes en verde (lint, tests, build, audit, smoke).
    - Bloqueo externo: branch protection no configurable por plan actual del repositorio (GitHub API 403).

## Tareas pendientes

No hay tareas pendientes del bloque de estabilización inicial.

## Backlog de escalado (Fase 1, 30 días)

1. EPIC Fase 1 (seguimiento principal): `#25`
   - https://github.com/121378-cell/asistente-Nespresso/issues/25
2. Observabilidad base (logs, métricas, trazas): `#26` (completado)
   - https://github.com/121378-cell/asistente-Nespresso/issues/26
3. Security baseline de producción: `#27` (completado)
   - https://github.com/121378-cell/asistente-Nespresso/issues/27
4. CI/CD con quality gates bloqueantes: `#28` (en progreso, bloqueado en branch protection por plan)
   - https://github.com/121378-cell/asistente-Nespresso/issues/28
5. ADR v1 de arquitectura objetivo: `#29`
   - https://github.com/121378-cell/asistente-Nespresso/issues/29

## Estado general

- Rama actual: `main`
- Working tree: con cambios locales pendientes de commit (quality gates en curso de guardado)
- Remoto: `origin/main` actualizado hasta `1d21053`

## Próxima tarea recomendada

1. Completar el issue `#28` habilitando checks requeridos en merge cuando el repo tenga branch protection disponible (GitHub Pro o repositorio público).
