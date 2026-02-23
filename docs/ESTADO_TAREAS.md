# Estado de tareas del proyecto

Fecha de actualización: 18 de febrero de 2026

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
15. Implementación de quality gates CI/CD (Fase 1 - issue `#28`).
    - Workflow nuevo: `.github/workflows/quality-gates.yml`.
    - Jobs bloqueantes definidos: frontend lint/test/build, backend test/build, audit dependencias y E2E smoke.
    - Ajuste de tests frontend para compatibilidad con interceptores Axios (`tests/apiService.test.ts`).
    - Validaciones locales equivalentes en verde (lint, tests, build, audit, smoke).
    - Branch protection activada en `main` con checks requeridos y PR obligatorio (bloqueo resuelto).
16. Definición de ADR v1 de arquitectura objetivo (Fase 1 - issue `#29`).
    - Documento: `docs/architecture/ADR-0001-target-architecture.md`.
    - Incluye componentes objetivo (Web, API, Workers, Cola, Persistencia).
    - Define límites de dominio, contratos y trade-offs.
    - Plan de migración incremental por fases (sin big-bang), con riesgos y mitigaciones.
17. Diagnóstico y corrección de check fallido en PR `#30`.
    - Hallazgo: `Frontend Lint/Test/Build` fallaba al ejecutar tests de `backend/` desde la raíz sin dependencias de backend (`supertest`).
    - Acción: separación explícita de scope en Vitest raíz (`vite.config.ts`) para ejecutar solo `tests/**/*.test.ts`.
    - Validación local: `npm run lint`, `npm run test:run`, `npm --prefix backend test` y `npm run build` en verde.
18. Preparación operativa para cierre del pendiente de observabilidad (issue `#31`).
    - Script nuevo `scripts/observability-evidence.mjs` para recolectar evidencia (`/health` + `/metrics`) con evaluación de umbrales.
    - Script npm: `npm run ops:observability:evidence -- <base-url>`.
    - Documento `docs/OBSERVABILIDAD_BASELINE.md` ampliado con alertas mínimas y procedimiento de cierre.
19. Cierre de PR `#30` con checks verdes y policy de review satisfecha.
    - Merge commit: `2aa3b46`.
    - Ajustes integrados: scope frontend en Vitest y typecheck raíz sin backend.
20. Integración de flujo de evidencia operativa de observabilidad.
    - PR `#32` mergeada con script/documentación de evidencia.
    - PR `#33` mergeada con reporte real de producción:
      - `docs/observability-evidence-20260218.md`.
21. Cierre formal de Fase 1.
    - Issue `#31` cerrado (evidencia en entorno principal completada).
    - EPIC `#25` cerrado con checklist de Fase 1 completado.
22. Planificación de Fase 2 creada en GitHub.
    - Nuevo EPIC: `#34`.
    - Backlog base: `#35`, `#36`, `#37`, `#38`, `#39`.

## Tareas pendientes

No hay tareas pendientes del bloque de estabilización inicial.

## Backlog de escalado (Fase 2, 60 días)

1. EPIC Fase 2 (cola/workers async): `#34`
   - https://github.com/121378-cell/asistente-Nespresso/issues/34
2. Video async: encolar en API y persistir estado de job: `#35`
   - https://github.com/121378-cell/asistente-Nespresso/issues/35
3. Worker de video + idempotencia por `jobId`: `#36`
   - https://github.com/121378-cell/asistente-Nespresso/issues/36
4. Retry con backoff y DLQ para jobs async: `#37`
   - https://github.com/121378-cell/asistente-Nespresso/issues/37
5. Observabilidad de cola/workers y runbook operativo: `#38`
   - https://github.com/121378-cell/asistente-Nespresso/issues/38
6. Pruebas CI/E2E del flujo async de video: `#39`
   - https://github.com/121378-cell/asistente-Nespresso/issues/39

## Estado general

- Rama actual: `main`
- Working tree: limpio
- Remoto: `origin/main` actualizado hasta `1521aae`

## Próxima tarea recomendada

1. Iniciar implementación de `#35` (encolado async de video y estado de job persistente).
