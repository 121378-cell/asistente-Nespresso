# Repository Guidelines

## Project Structure & Module Organization

This repository is split into a Vite + React frontend and a TypeScript Express backend.

- Frontend app entry: `App.tsx`, `index.tsx`
- Frontend code: `components/`, `context/`, `hooks/`, `services/`, `src/`, `utils/`, `data/`
- Backend API: `backend/src/` (routes, controllers, server), with Prisma schema in `backend/prisma/`
- Unit/integration tests: `tests/` (frontend) and `backend/tests/`
- End-to-end tests: `e2e/` (Playwright specs)
- Docs and operational notes: `docs/`

## Build, Test, and Development Commands

Use Node 20+ for consistency with CI.

- `npm run dev`: start frontend locally (Vite)
- `npm --prefix backend run dev`: start backend in watch mode
- `npm run build`: type-check and build frontend
- `npm --prefix backend run build`: compile backend TypeScript
- `npm run lint` / `npm run lint:fix`: run ESLint checks or auto-fix
- `npm run test:run`: run frontend Vitest suite once
- `npm --prefix backend test`: run backend Vitest suite
- `npm run test:e2e`: run Playwright E2E tests
- `npm run deploy:check`: pre-push validation (build + tests + lint)

## Coding Style & Naming Conventions

- TypeScript-first; prefer explicit types for public functions and service boundaries.
- Prettier rules: 2-space indent, single quotes, semicolons, trailing commas (`.prettierrc`).
- ESLint is required for both frontend and backend (`.eslintrc.json`, `backend/.eslintrc.json`).
- Component files use `PascalCase` (example: `RepairCard.tsx`); hooks use `camelCase` with `use` prefix.
- Keep feature logic near its domain folder, avoid large cross-cutting utility files.

## Testing Guidelines

- Frontend tests use Vitest + Testing Library; keep tests in `tests/` as `*.test.ts`/`*.test.tsx`.
- Backend tests use Vitest in `backend/tests/`.
- E2E coverage lives in `e2e/` with numbered specs (example: `06-video-async.spec.ts`).
- Add or update tests for every behavior change; run targeted tests before full suites.

## Commit & Pull Request Guidelines

- Follow Conventional Commits seen in history: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Keep commits focused and scoped by area when helpful (example: `feat(components): ...`).
- PRs should include: clear summary, linked issue/ticket, test evidence (command output), and UI screenshots for visual changes.
- Ensure CI checks pass (`Quality Gates`, E2E workflows) before requesting review.

## Security & Configuration Tips

- Never commit secrets; use `.env.local` (frontend) and `backend/.env` (backend).
- Start from `.env.example` files and document any new variables in `README.md` or `SETUP_GUIDE.md`.
