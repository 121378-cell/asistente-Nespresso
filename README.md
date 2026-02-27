# ☕ Nespresso Assistant - Asistente de Reparación

[![E2E Tests](https://github.com/121378-cell/asistente-nespresso/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/121378-cell/asistente-nespresso/actions/workflows/e2e-tests.yml)
[![Quality Gates](https://github.com/121378-cell/asistente-nespresso/actions/workflows/quality-gates.yml/badge.svg)](https://github.com/121378-cell/asistente-nespresso/actions/workflows/quality-gates.yml)

Asistente inteligente para reparación de cafeteras Nespresso Profesionales con IA, base de datos PostgreSQL y soporte para dispositivos móviles.

---

## 🚀 Inicio Rápido

### Windows (Recomendado - Doble Clic)

1. **Doble clic en `START.bat`**
2. La aplicación se abrirá automáticamente en tu navegador
3. ¡Listo para usar!

> **Nota:** La primera vez, el script configurará todo automáticamente (1-2 minutos).

### Primera Vez - Configuración

Si es la primera vez que ejecutas la aplicación:

**Opción A: Configuración Automática (Recomendado)**

```powershell
.\START.ps1
```

El script te guiará para:

- Configurar la base de datos (Supabase recomendado)
- Obtener tu API Key de Gemini
- Instalar dependencias automáticamente

**Opción B: Configuración Manual**

1. Crea `backend\.env` con tu `DATABASE_URL`
2. Crea `.env.local` con tu `GEMINI_API_KEY`
3. Ejecuta `START.bat`

Ver [Configuración Detallada](#-configuración-detallada) más abajo.

---

## 📋 Requisitos

| Software       | Versión              | Enlace                                            | Necesario      |
| -------------- | -------------------- | ------------------------------------------------- | -------------- |
| **Node.js**    | v18+                 | [Descargar](https://nodejs.org/)                  | ✅ Requerido   |
| **npm**        | Incluido con Node.js |                                                   | ✅ Requerido   |
| **Git**        | Cualquier versión    | [Descargar](https://git-scm.com/)                 | ⚠️ Recomendado |
| **PostgreSQL** | 14+                  | [Descargar](https://www.postgresql.org/download/) | ⚠️ O Supabase  |

### Opciones de Base de Datos

**Opción 1: Supabase (Recomendado)** ⭐

- ✅ Gratis (500MB database, 2GB bandwidth)
- ✅ En la nube (sin instalación)
- ✅ Backup automático
- ✅ URL: https://supabase.com/

**Opción 2: PostgreSQL Local**

- ✅ Sin límites de datos
- ✅ Control total
- ⚠️ Requiere instalación
- ⚠️ Backup manual

---

## 📁 Estructura del Proyecto

```
asistente-nespresso/
├── START.bat              # ⭐ Launcher rápido (Windows)
├── START.ps1              # ⭐ Instalador completo con configuración
├── .env.example           # Plantilla de variables frontend
├── .env.local             # Configuración frontend (crear)
├── package.json           # Dependencias frontend
│
├── backend/
│   ├── .env.example       # Plantilla de variables backend
│   ├── .env               # Configuración backend (crear)
│   ├── package.json       # Dependencias backend
│   ├── prisma/
│   │   └── schema.prisma  # Esquema de base de datos
│   └── src/
│       ├── server.ts      # Servidor Express
│       ├── controllers/   # Lógica de negocio
│       └── routes/        # Rutas API REST
│
├── components/            # Componentes React
├── services/              # Servicios API y AI
├── hooks/                 # Custom React hooks
├── public/                # Archivos estáticos + PWA
│   ├── manifest.json      # Configuración PWA
│   └── sw.js              # Service Worker
├── e2e/                   # Tests E2E con Playwright
├── tests/                 # Tests unitarios frontend
└── docs/                  # Documentación técnica
```

---

## 🎯 Características

### ✅ Funcionalidades Principales

| Feature                          | Descripción                        | Estado    |
| -------------------------------- | ---------------------------------- | --------- |
| 🤖 **Asistente IA**              | Diagnóstico con Google Gemini      | ✅ Activo |
| 📸 **Identificación por cámara** | Detecta modelo por número de serie | ✅ Activo |
| 📋 **Checklists personalizados** | Por modelo de cafetera             | ✅ Activo |
| 💾 **Guardar reparaciones**      | Historial en PostgreSQL            | ✅ Activo |
| 🔍 **Búsqueda en Google**        | Información actualizada            | ✅ Activo |
| 📱 **PWA**                       | Instalar como app móvil            | ✅ Activo |
| 🌐 **Multiplataforma**           | Windows, Mac, Linux, móviles       | ✅ Activo |
| 📊 **Dashboard de Jobs**         | Monitor de procesos async          | ✅ Activo |
| 🔄 **Modo Offline**              | Sincronización automática          | ✅ Activo |
| 🎙️ **Dictado por voz**           | Manos libres                       | ✅ Activo |

### ✅ Tecnologías

**Frontend:**

- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS (estilos)
- Axios (HTTP client)
- TanStack Query (data fetching)

**Backend:**

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- Google Gemini AI
- JWT Authentication
- Helmet + CORS (security)

**Testing:**

- Vitest (unit tests)
- Playwright (E2E tests)
- GitHub Actions (CI/CD)

---

## 📱 Acceso desde Móvil

### Opción 1: Red Local (Mismo WiFi)

1. **Obtén tu IP local:**

   ```bash
   # Windows
   ipconfig
   # Busca "IPv4 Address" (ej: 192.168.1.100)
   ```

2. **En tu móvil, abre:**

   ```
   http://TU-IP:3000
   ```

3. **Instala como app (PWA):**
   - **Android (Chrome):** Menú → "Añadir a pantalla de inicio"
   - **iOS (Safari):** Compartir → "Añadir a pantalla de inicio"

### Opción 2: Despliegue en la Nube

Ver [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) para instrucciones completas de despliegue en:

- Vercel (frontend)
- Railway (backend + database)
- Render (alternativa)

---

## 🛠️ Comandos Útiles

### Desarrollo Diario

```bash
# Iniciar todo (automático - recomendado)
.\START.bat

# O manualmente:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Configuración Inicial

```bash
# Configuración guiada (primera vez)
.\START.ps1

# Solo backend
cd backend
npm install
npm run prisma:migrate
npm run dev
```

### Base de Datos

```bash
cd backend

# Ver base de datos (interfaz gráfica)
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate:dev

# Resetear base de datos
npm run prisma:migrate:reset

# Generar cliente Prisma
npm run prisma:generate
```

### Testing

```bash
# Tests unitarios frontend
npm test
npm run test:ui          # Modo interactivo
npm run test:coverage    # Con reporte de cobertura

# Tests unitarios backend
npm --prefix backend test

# Tests E2E con Playwright
npm run test:e2e              # Ejecutar todos
npm run test:e2e:ui           # Modo UI interactivo
npm run test:e2e:headed       # Con navegador visible
npm run test:e2e:debug        # Modo debug paso a paso
npm run test:e2e:codegen      # Generar tests automáticamente
```

### CI/CD

Los tests se ejecutan automáticamente en GitHub Actions:

- ✅ **En cada push** a `main` o `develop`
- ✅ **En cada pull request**
- ✅ **Reportes disponibles** como artifacts si fallan

Ver el estado en:

- [Actions Tab](https://github.com/121378-cell/asistente-nespresso/actions)
- Badge al inicio del README

### Producción

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Iniciar backend en producción
npm start
```

### Calidad de Código

```bash
# Linting
npm run lint
npm run lint:fix           # Auto-corregir

# Formateo
npm run format             # Prettier

# Type checking
npm run typecheck

# Pre-push validation
npm run deploy:check       # Build + tests + lint
```

---

## 🔧 Configuración Detallada

### Variables de Entorno

**Frontend (`.env.local`):**

```env
# ═══════════════════════════════════════════════════════════════════════
# Nespresso Assistant - Frontend Configuration
# ═══════════════════════════════════════════════════════════════════════

# Backend API URL (requerido)
VITE_API_URL=http://localhost:3001

# Google Gemini API Key (requerido)
# Obtén tu key en: https://aistudio.google.com/apikey
GEMINI_API_KEY=tu_api_key_aqui

# Opcional: Tema por defecto (dark/light)
# VITE_DEFAULT_THEME=dark
```

**Backend (`backend\.env`):**

```env
# ═══════════════════════════════════════════════════════════════════════
# Nespresso Assistant - Backend Configuration
# ═══════════════════════════════════════════════════════════════════════

# Database Connection (requerido)
# Supabase: postgresql://postgres.[xxxxx]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
# Local:    postgresql://postgres:postgres@localhost:5432/nespresso_assistant
DATABASE_URL=postgresql://...

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# AI Configuration
GEMINI_API_KEY=tu_gemini_api_key

# Optional: Supabase (si usas auth/storage)
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_SERVICE_KEY=tu_service_key

# Optional: JWT Secret (cambiar en producción)
JWT_SECRET=tu-secret-key-seguro

# Optional: LLM Provider (gemini o ollama)
LLM_PROVIDER=gemini
OLLAMA_MODEL=llama3
```

### Obtener API Keys

**Google Gemini API Key:**

1. Ve a https://aistudio.google.com/apikey
2. Inicia sesión con Google
3. Clic en "Create API Key"
4. Copia la clave
5. **Límites gratuitos:** 60 requests/min, 1500 requests/día

**Supabase Database URL:**

1. Ve a https://supabase.com/
2. Crea cuenta gratuita
3. "New Project" → Rellena datos
4. Espera 2-3 minutos
5. Settings (⚙️) → Database → Connection String
6. Copia la URL (modo URI)

---

## 🌐 URLs

| Servicio          | URL                           | Descripción             |
| ----------------- | ----------------------------- | ----------------------- |
| **Frontend**      | http://localhost:3000         | Aplicación web          |
| **Backend API**   | http://localhost:3001         | API REST                |
| **Health Check**  | http://localhost:3001/health  | Estado del servidor     |
| **Metrics**       | http://localhost:3001/metrics | Métricas HTTP           |
| **Prisma Studio** | http://localhost:5555         | Editor de base de datos |

---

## 📊 API Endpoints

| Método | Ruta                  | Descripción           | Auth |
| ------ | --------------------- | --------------------- | ---- |
| GET    | `/health`             | Health check          | ❌   |
| GET    | `/metrics`            | Métricas HTTP         | ❌   |
| GET    | `/api/repairs`        | Listar reparaciones   | ✅   |
| GET    | `/api/repairs/:id`    | Obtener reparación    | ✅   |
| POST   | `/api/repairs`        | Crear reparación      | ✅   |
| PUT    | `/api/repairs/:id`    | Actualizar reparación | ✅   |
| DELETE | `/api/repairs/:id`    | Eliminar reparación   | ✅   |
| POST   | `/api/chat`           | Enviar mensaje a IA   | ✅   |
| POST   | `/api/video/generate` | Generar video         | ✅   |
| GET    | `/api/jobs`           | Listar jobs async     | ✅   |
| POST   | `/api/auth/login`     | Login                 | ❌   |

---

## ❓ Solución de Problemas

### "Node.js no está instalado"

```bash
# Verifica instalación
node --version

# Si no existe, instala desde:
https://nodejs.org/
```

### "Error de conexión a la base de datos"

1. Verifica `backend\.env` tiene `DATABASE_URL` correcto
2. Si usas Supabase:
   - Verifica contraseña en la URL
   - Verifica proyecto activo en dashboard
3. Prueba conexión con Prisma Studio:
   ```bash
   cd backend
   npm run prisma:studio
   ```

### "El frontend no conecta al backend"

1. Verifica ambos servidores corriendo
2. Verifica `VITE_API_URL` en `.env.local`
3. Revisa consola del navegador (F12) para errores
4. Prueba health check: http://localhost:3001/health

### "Error al guardar reparación"

1. Verifica backend corriendo
2. Revisa logs del backend en terminal
3. Verifica conexión a base de datos
4. Ejecuta migrations:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

### "Tests E2E fallan"

```bash
# Reinstala Playwright browsers
npm run test:e2e -- --install-browsers

# Ejecuta en modo debug
npm run test:e2e:debug

# Ejecuta tests específicos
npm run test:e2e -- --grep "nombre del test"
```

### "Puerto 3000/3001 ya en uso"

```bash
# Windows - Matar procesos
taskkill /F /IM node.exe

# O cambia el puerto en .env
# Backend: PORT=3002 en backend\.env
# Frontend: VITE_API_URL=http://localhost:3002 en .env.local
```

---

## 🔒 Seguridad

### Implementado

- ✅ Variables de entorno en `.env` (no se suben a Git)
- ✅ CORS configurado por allowlist
- ✅ Helmet con cabeceras de seguridad
- ✅ Rate limiting por IP
- ✅ JWT authentication
- ✅ Validación de env con Zod
- ✅ CSP (Content Security Policy)

### Para Producción

- [ ] Cambiar `JWT_SECRET` a valor seguro
- [ ] Configurar `NODE_ENV=production`
- [ ] Usar HTTPS (certificado SSL)
- [ ] Ajustar rate limits según tráfico
- [ ] Habilitar logging de auditoría

Ver [SECURITY_BASELINE.md](./docs/SECURITY_BASELINE.md) para detalles.

---

## 📚 Documentación Adicional

| Documento                                      | Descripción                                 |
| ---------------------------------------------- | ------------------------------------------- |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md)             | Guía completa de configuración              |
| [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) | Despliegue para móviles                     |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)       | Configurar Supabase paso a paso             |
| [BACKLOG.md](./BACKLOG.md)                     | Tareas pendientes y roadmap                 |
| [docs/](./docs/)                               | Documentación técnica (ADR, runbooks, etc.) |
| [backend/README.md](./backend/README.md)       | Documentación específica de la API          |

---

## 🚀 Próximos Pasos (Roadmap)

Ver [BACKLOG.md](./BACKLOG.md) para detalles completos.

### Prioridad Alta

- [ ] **BL-16:** Activar `noUnusedLocals` y `noUnusedParameters` en TypeScript
- [ ] **BL-15:** Activar `strictNullChecks` en TypeScript
- [ ] **BL-14:** Reducir warnings `any` en componentes críticos

### Prioridad Media

- [ ] **BL-13:** Reducir warnings `any` en servicios API frontend
- [ ] **BL-08:** Actualizar setup scripts y documentación (en progreso)
- [ ] **BL-06:** Unificar nombres de variables en código

### Prioridad Baja

- [ ] **BL-05:** Crear matriz única de variables de entorno
- [ ] **BL-04:** Añadir tests de contrato API
- [ ] **BL-03:** Implementar contrato canónico en frontend
- [ ] **BL-02:** Implementar contrato canónico en backend
- [ ] **BL-01:** Definir contrato canónico de API

---

## 📝 Licencia

MIT License - Ver [LICENSE](./LICENSE) para detalles.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Abre un issue primero para discutir cambios
2. Crea una rama feature (`git checkout -b feature/mi-feature`)
3. Committea cambios (`git commit -m 'feat: añadir mi feature'`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

### Convención de Commits

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Formato (sin cambios de código)
refactor: Refactorización (sin cambios de funcionalidad)
test:     Añadir/modificar tests
chore:    Cambios en build/config
```

---

**Hecho con ❤️ para técnicos de Nespresso Profesional**

¿Preguntas o problemas? Abre un issue en GitHub.
