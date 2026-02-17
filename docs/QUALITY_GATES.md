# Quality Gates CI/CD

Fecha: 17 de febrero de 2026

## Workflow

- Archivo: `.github/workflows/quality-gates.yml`
- Disparadores:
  - `pull_request` hacia `main`
  - `push` en `main`

## Gates implementados

1. Frontend:

- `npm run lint`
- `npm run test:run`
- `npm run build`

2. Backend:

- `npm --prefix backend test`
- `npm --prefix backend run build`

3. Seguridad de dependencias:

- `npm audit --omit=dev --audit-level=high`
- `npm --prefix backend audit --omit=dev --audit-level=high`

4. E2E smoke:

- `npx playwright test e2e/01-navigation.spec.ts --project=chromium --workers=1 --reporter=line`

## Evidencia local (equivalente)

- Frontend lint: OK
- Frontend tests: OK
- Frontend build: OK
- Backend tests/build: OK
- Audit root/backend: 0 vulnerabilidades high/critical
- E2E smoke: 5/5 OK

## Bloqueo actual

No se puede activar branch protection obligatorio en `main` desde API en este repositorio por limitación de plan:

- Respuesta GitHub API: `403 Upgrade to GitHub Pro or make this repository public to enable this feature.`

Mientras exista esta restricción, los gates están definidos y ejecutables en Actions, pero no pueden marcarse como requisitos obligatorios de merge vía branch protection.
