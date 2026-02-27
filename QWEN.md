# ☕ Nespresso Assistant - Project Context

## Project Overview

**Nespresso Assistant** is an intelligent repair assistant for Nespresso Professional coffee machines. It combines AI-powered diagnostics (Google Gemini), a PostgreSQL database for persistence, and a modular architecture supporting async job processing for heavy tasks like video generation and image analysis.

### Core Technologies

| Layer             | Technologies                                                                      |
| ----------------- | --------------------------------------------------------------------------------- |
| **Frontend**      | React 19, TypeScript, Vite, TailwindCSS, Axios, TanStack Query                    |
| **Backend**       | Node.js + Express, TypeScript, Prisma ORM, PostgreSQL                             |
| **AI/LLM**        | Google Gemini API, Ollama (local LLM support)                                     |
| **Testing**       | Vitest (unit/integration), Playwright (E2E)                                       |
| **Observability** | Custom request tracing (`x-request-id`), Pino logging, HTTP metrics (p50/p95/p99) |
| **Security**      | Helmet, CSP, CORS allowlisting, Zod env validation, JWT auth                      |

### Architecture

The project follows a modular architecture (per ADR-0001):

```
asistente-Nespresso/
├── Frontend (Vite + React)    # Web UI at http://localhost:3000
├── backend/
│   ├── src/controllers/       # Business logic
│   ├── src/routes/            # REST API endpoints
│   ├── src/workers/           # Async job processors (Video, Image)
│   ├── src/services/          # External integrations
│   └── prisma/                # Database schema & migrations
├── components/                # React UI components
├── hooks/                     # Custom React hooks
├── services/                  # Frontend API/AI clients
├── e2e/                       # Playwright E2E tests
└── tests/                     # Vitest unit/integration tests
```

---

## Building & Running

### Quick Start (Windows)

```bash
# Double-click START.bat for automatic setup
# Or run manually:
.\START.ps1
```

### Manual Development Setup

```bash
# Install dependencies (root + backend)
npm install
cd backend && npm install

# Configure environment
cp .env.example .env.local        # Frontend
cp backend/.env.example backend/.env  # Backend

# Start both servers
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Key Commands

| Command                             | Description                                |
| ----------------------------------- | ------------------------------------------ |
| `npm run dev`                       | Start frontend dev server (Vite)           |
| `npm --prefix backend run dev`      | Start backend in watch mode                |
| `npm run build`                     | Type-check + build frontend                |
| `npm --prefix backend run build`    | Compile backend TypeScript                 |
| `npm run lint` / `npm run lint:fix` | ESLint check/auto-fix                      |
| `npm run format`                    | Prettier formatting                        |
| `npm run test:run`                  | Run Vitest suite (frontend)                |
| `npm --prefix backend test`         | Run Vitest suite (backend)                 |
| `npm run test:e2e`                  | Run Playwright E2E tests                   |
| `npm run test:e2e:ui`               | Playwright UI mode                         |
| `npm run deploy:check`              | Pre-push validation (build + tests + lint) |

### Database Commands (run in `backend/`)

```bash
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:migrate   # Create/apply migrations
npm run prisma:generate  # Generate Prisma client
```

---

## Development Conventions

### Coding Standards

- **TypeScript-first**: Avoid `any`; use explicit types for public APIs
- **File naming**:
  - Components: `PascalCase.tsx` (e.g., `ChatMessage.tsx`)
  - Hooks: `camelCase.ts` with `use` prefix (e.g., `useChat.ts`)
- **Prettier**: 2-space indent, single quotes, semicolons, trailing commas
- **ESLint**: Required for both frontend and backend

### Testing Practices

- **Frontend**: Vitest + Testing Library in `tests/`
- **Backend**: Vitest + supertest in `backend/tests/`
- **E2E**: Playwright specs in `e2e/` (numbered: `01-*.spec.ts`)
- Add tests for every behavior change; run targeted tests before full suites

### Commit Conventions

Follow Conventional Commits:

```
feat: add video generation feature
fix: resolve database connection timeout
docs: update setup instructions
test: add E2E coverage for login flow
chore: upgrade dependencies
```

### Security

- Never commit `.env` files (use `.env.example` as template)
- API keys stored in `.env.local` (frontend) and `backend/.env`
- Request tracing via `x-request-id` header (handled by `services/requestTracing.ts`)

---

## Key Files & Directories

| Path                           | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `App.tsx`                      | Main React application entry        |
| `types.ts`                     | Shared TypeScript interfaces        |
| `constants.ts`                 | Application constants               |
| `components/`                  | Reusable React components           |
| `hooks/`                       | Custom React hooks (business logic) |
| `services/`                    | API/AI service integrations         |
| `backend/src/server.ts`        | Express server entry point          |
| `backend/prisma/schema.prisma` | Database schema                     |
| `e2e/`                         | Playwright E2E test suites          |
| `docs/`                        | Architecture docs, ADRs, guides     |

---

## Environment Variables

### Frontend (`.env.local`)

```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_api_key_here
```

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:pass@host:5432/database
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Testing Evidence & Debugging

When tests fail or you need to debug:

```bash
# Frontend test coverage
npm run test:coverage

# E2E with visible browser
npm run test:e2e:headed

# E2E debug mode
npm run test:e2e:debug

# Backend video async tests
npm --prefix backend run test:video-async
```

---

## Related Documentation

- `README.md` - User-facing setup guide
- `BACKLOG.md` - Task backlog and progress
- `AGENTS.md` - Repository guidelines
- `GEMINI.md` - AI integration guide
- `SETUP_GUIDE.md` - Backend database setup
- `MOBILE_DEPLOYMENT.md` - Mobile deployment options
- `docs/` - Architecture decisions, security baseline
