# ☕ Nespresso Assistant - AI Repair Guide

## Project Overview

An intelligent assistant designed for Nespresso Professional technicians. It uses Google Gemini AI for diagnosis, PostgreSQL for data persistence, and features a modular architecture to handle intensive tasks (like video generation) asynchronously.

### Core Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, Axios, TanStack Query.
- **Backend:** Node.js (Express), TypeScript, Prisma ORM, PostgreSQL (via Supabase or local).
- **AI:** Google Gemini API.
- **Observability:** Custom request tracing (`x-request-id`), HTTP metrics (p50/p95/p99), and structured logging with Pino.
- **Security:** Helmet, CSP, CORS allowlisting, and Zod-based environment validation.

### Architecture

Following **ADR-0001**, the project is moving towards a modular architecture:

1. **Web App:** Frontend UI.
2. **App API:** Synchronous REST endpoints.
3. **Workers:** Asynchronous processing for heavy tasks (Video, Image Analysis).
4. **Job Queue:** Decoupling API and Workers with state persistence.

---

## 🛠️ Commands & Development

### Project Setup

- **Windows (Automatic):** Run `START.bat`.
- **Manual Setup:**
  - `npm install` (Root & Backend)
  - `cp .env.example .env.local` (Frontend)
  - `cp backend/.env.example backend/.env` (Backend)

### Building & Running

- **Development (Full Stack):** `.\START.bat` or run `npm run dev` in both root and `backend/`.
- **Production Build:**
  - Frontend: `npm run build`
  - Backend: `cd backend && npm run build`
- **Starting Production:** `cd backend && npm start`

### Testing & Validation

- **Unit/Integration (Frontend):** `npm test`
- **Unit/Integration (Backend):** `npm --prefix backend test`
- **E2E (Playwright):** `npm run test:e2e`
- **Linting:** `npm run lint`
- **Formatting:** `npm run format`
- **Security Audit:** `npm audit` (Root & Backend)

### Database Management (Prisma)

All commands should be run within the `backend/` directory:

- **Studio (GUI):** `npm run prisma:studio`
- **Migrate:** `npm run prisma:migrate`
- **Generate Client:** `npm run prisma:generate`

---

## 📏 Development Conventions

### Coding Standards

- **Strict Typing:** Avoid `any`. Use TypeScript interfaces/types defined in `types.ts`.
- **Error Handling:** Use `useErrorHandler` in frontend and global error middleware in backend.
- **Request Tracing:** All API calls must include `x-request-id` headers (handled by `apiService.ts` and `requestTracing.ts`).
- **Commits:** Follow the style observed in `docs/ESTADO_TAREAS.md`.

### Testing Standards

- **E2E Priority:** New features must have corresponding Playwright tests in `e2e/`.
- **Smoke Tests:** Run `npm run test:e2e` before any major change.
- **Backend Tests:** Use Vitest and `supertest` for API route testing.

### Security & Privacy

- **Secrets:** Never commit `.env` files. Use `backend/src/config/env.ts` for validation.
- **Data:** Handle PII with care, following guidelines in `docs/SECURITY_BASELINE.md`.

---

## 📁 Key Directories

- `backend/src/controllers/`: Business logic for API endpoints.
- `backend/src/workers/`: Background job processors.
- `components/`: Reusable React UI components.
- `hooks/`: Frontend business logic and state management.
- `services/`: API and AI service integrations.
- `docs/architecture/`: Architectural Decision Records (ADRs).
- `e2e/`: Playwright end-to-end test suites.
