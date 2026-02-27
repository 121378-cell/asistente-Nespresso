# 🚀 Guía Completa de Configuración - Nespresso Assistant

Esta guía te ayudará a configurar **completamente** el Nespresso Assistant, desde cero, para desarrollo y producción.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#-requisitos-previos)
2. [Instalación Rápida](#-instalación-rápida)
3. [Configuración de Base de Datos](#-configuración-de-base-de-datos)
4. [Configuración de API Keys](#-configuración-de-api-keys)
5. [Instalación de Dependencias](#-instalación-de-dependencias)
6. [Iniciar la Aplicación](#-iniciar-la-aplicación)
7. [Verificación](#-verificación)
8. [Solución de Problemas](#-solución-de-problemas)

---

## 📋 Requisitos Previos

### Software Requerido

| Software       | Versión              | Enlace                                            | Estado         |
| -------------- | -------------------- | ------------------------------------------------- | -------------- |
| **Node.js**    | v18+                 | [Descargar](https://nodejs.org/)                  | ✅ Requerido   |
| **npm**        | Incluido con Node.js |                                                   | ✅ Requerido   |
| **Git**        | Cualquier versión    | [Descargar](https://git-scm.com/)                 | ⚠️ Recomendado |
| **PostgreSQL** | 14+                  | [Descargar](https://www.postgresql.org/download/) | ⚠️ O Supabase  |

### Verificar Instalación

```bash
# Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar npm
npm --version
# Debe mostrar: 9.x.x o superior

# Verificar Git (opcional)
git --version
```

---

## 🚀 Instalación Rápida

### Método Automático (Recomendado)

**Windows:**

```bash
# Doble clic en START.bat
# O desde PowerShell:
.\START.ps1
```

El script hará lo siguiente automáticamente:

1. ✅ Verifica Node.js y npm
2. ✅ Configura variables de entorno
3. ✅ Instala dependencias
4. ✅ Configura base de datos
5. ✅ Inicia la aplicación

### Método Manual

```bash
# 1. Clonar repositorio (si no lo has hecho)
git clone https://github.com/121378-cell/asistente-Nespresso.git
cd asistente-Nespresso

# 2. Instalar dependencias frontend
npm install

# 3. Instalar dependencias backend
cd backend
npm install

# 4. Configurar variables de entorno (ver siguientes secciones)
# 5. Iniciar aplicación (ver sección "Iniciar la Aplicación")
```

---

## 🗄️ Configuración de Base de Datos

Tienes **dos opciones** para la base de datos:

### Opción 1: Supabase (Recomendado) ⭐

**Ventajas:**

- ✅ Gratis (500MB database, 2GB bandwidth/mes)
- ✅ Sin instalación (en la nube)
- ✅ Backup automático incluido
- ✅ Panel de control web
- ✅ Conexión desde cualquier lugar

**Pasos:**

1. **Crear cuenta en Supabase:**
   - Ve a https://supabase.com/
   - Clic en "Start your project" o "Sign In"
   - Usa tu cuenta de Google/GitHub

2. **Crear nuevo proyecto:**
   - Clic en "New Project"
   - Rellena:
     - **Name:** `nespresso-assistant`
     - **Database Password:** Elige una contraseña segura (guárdala)
     - **Region:** Elige la más cercana a ti (ej: `East US (N. Virginia)`)
   - Clic en "Create new project"
   - ⏱️ Espera 2-3 minutos a que se cree

3. **Obtener URL de conexión:**
   - Ve a **Settings** (⚙️ en la barra lateral)
   - Clic en **Database**
   - Busca **Connection String**
   - Clic en **URI** tab
   - Copia la URL (se ve así):
     ```
     postgresql://postgres.[xxxxx]:[tu-password]@aws-0-[region].pooler.supabase.com:5432/postgres
     ```

4. **Configurar en el proyecto:**
   - Crea archivo `backend\.env`
   - Pega la URL:
     ```env
     DATABASE_URL="postgresql://postgres.[xxxxx]:[password]@...supabase.com:5432/postgres"
     ```

### Opción 2: PostgreSQL Local

**Ventajas:**

- ✅ Sin límites de datos
- ✅ Control total
- ✅ Sin internet necesario
- ⚠️ Requiere instalación
- ⚠️ Backup manual

**Pasos:**

1. **Instalar PostgreSQL:**

   **Windows:**
   - Descarga: https://www.postgresql.org/download/windows/
   - Ejecuta instalador
   - Configuración recomendada:
     - **Usuario:** `postgres`
     - **Contraseña:** `postgres` (o la que elijas - ¡guárdala!)
     - **Puerto:** `5432` (default)
     - **Componentes:** Marca "pgAdmin 4" (interfaz gráfica)

   **Verificar instalación:**

   ```bash
   psql --version
   # Debe mostrar: psql (PostgreSQL) 14.x.x
   ```

2. **Crear base de datos:**

   **Opción A: Usando pgAdmin (recomendado)**
   - Abre pgAdmin 4
   - Conéctate con tu usuario `postgres`
   - Clic derecho en "Databases" → "Create" → "Database"
   - Nombre: `nespresso_assistant`
   - Clic en "Save"

   **Opción B: Usando línea de comandos**

   ```bash
   # Windows (PowerShell como Administrador)
   cd "C:\Program Files\PostgreSQL\16\bin"
   .\psql -U postgres

   # En el prompt de psql:
   CREATE DATABASE nespresso_assistant;
   \q
   ```

3. **Configurar URL de conexión:**
   - Crea archivo `backend\.env`
   - Añade:
     ```env
     DATABASE_URL="postgresql://postgres:tu-contraseña@localhost:5432/nespresso_assistant?schema=public"
     ```

---

## 🔑 Configuración de API Keys

### Google Gemini API Key

**Requerido para:** Asistente de IA con Gemini

1. **Obtener API Key:**
   - Ve a https://aistudio.google.com/apikey
   - Inicia sesión con Google
   - Clic en **"Create API Key"**
   - Copia la clave generada

2. **Configurar en frontend:**
   - Crea archivo `.env.local` en la raíz del proyecto
   - Añade:
     ```env
     VITE_API_URL=http://localhost:3001
     GEMINI_API_KEY=tu-api-key-aqui
     ```

3. **Configurar en backend:**
   - Edita `backend\.env`
   - Añade:
     ```env
     GEMINI_API_KEY=tu-api-key-aqui
     ```

**Límites gratuitos de Gemini:**

- 60 requests por minuto
- 1500 requests por día
- Suficiente para uso personal/desarrollo

---

## 📦 Instalación de Dependencias

### Frontend

```bash
# En la raíz del proyecto
npm install
```

**Tiempo estimado:** 1-2 minutos (primera vez)

### Backend

```bash
cd backend
npm install
```

**Tiempo estimado:** 1-2 minutos (primera vez)

### Generar Cliente Prisma

```bash
cd backend
npx prisma generate
```

### Ejecutar Migraciones

```bash
cd backend
npx prisma migrate dev --name init
```

Esto creará las tablas en tu base de datos:

- `repairs` - Reparaciones guardadas
- `users` - Usuarios (autenticación)
- `video_jobs` - Jobs de video async
- `image_jobs` - Jobs de imagen async

---

## 🎯 Iniciar la Aplicación

### Método Automático (Recomendado)

```bash
# Windows - Doble clic en:
START.bat

# O desde PowerShell:
.\START.ps1
```

### Método Manual

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Deberías ver:

```
🚀 Server running on http://localhost:3001
📊 Environment: development
🌐 CORS enabled for: http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

Deberías ver:

```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Abrir Navegador

Ve a: **http://localhost:3000**

---

## ✅ Verificación

### Checklist de Verificación

- [ ] Backend corriendo en http://localhost:3001
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Health check responde: http://localhost:3001/health
- [ ] Base de datos conectada (sin errores en consola)
- [ ] API Key de Gemini configurada

### Tests de Verificación

**1. Health Check del Backend:**

Abre en tu navegador: http://localhost:3001/health

Deberías ver:

```json
{
  "status": "ok",
  "timestamp": "2026-02-27T..."
}
```

**2. Probar Chat con IA:**

1. Abre http://localhost:3000
2. Escribe un mensaje en el chat: "Hola, necesito ayuda con mi cafetera"
3. Deberías recibir una respuesta de la IA

**3. Ver Base de Datos:**

```bash
cd backend
npm run prisma:studio
```

Se abrirá en http://localhost:5555

---

## ❓ Solución de Problemas

### Error: "Node.js no está instalado"

**Síntoma:**

```
'node' is not recognized as an internal or external command
```

**Solución:**

1. Instala Node.js desde https://nodejs.org/
2. Descarga la versión LTS (Long Term Support)
3. Reinicia tu terminal después de instalar
4. Verifica: `node --version`

---

### Error: "Cannot connect to database"

**Síntoma:**

```
Error: Can't reach database server at `localhost:5432`
```

**Solución:**

1. **Verifica PostgreSQL:**

   ```bash
   # Windows
   services.msc
   # Busca "postgresql-x64-16" y verifica que esté "Running"
   ```

2. **Verifica DATABASE_URL:**
   - Abre `backend\.env`
   - Verifica que `DATABASE_URL` sea correcta
   - Si usas Supabase, verifica la URL completa

3. **Prueba conexión:**

   ```bash
   cd backend
   npm run prisma:studio
   ```

4. **Si usas Supabase:**
   - Verifica proyecto activo en dashboard
   - Verifica contraseña en la URL
   - Verifica firewall no bloquea conexión

---

### Error: "Port 3001 already in use"

**Síntoma:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solución:**

**Opción A: Matar proceso existente**

```bash
# Windows
taskkill /F /IM node.exe

# O encuentra el proceso específico:
netstat -ano | findstr :3001
taskkill /F /PID <PID>
```

**Opción B: Cambiar puerto**

```env
# En backend\.env
PORT=3002

# En .env.local (frontend)
VITE_API_URL=http://localhost:3002
```

---

### Error: "GEMINI_API_KEY not found"

**Síntoma:**

```
Error: Missing required environment variable: GEMINI_API_KEY
```

**Solución:**

1. Verifica `.env.local` existe en raíz del proyecto
2. Verifica `GEMINI_API_KEY` está presente
3. Reinicia el servidor frontend
4. Si usas backend, verifica también `backend\.env`

---

### Error: "Prisma schema not found"

**Síntoma:**

```
Error: Could not find Prisma schema
```

**Solución:**

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

---

### Error: Frontend no conecta al backend

**Síntoma:**

```
Network Error en consola del navegador
```

**Solución:**

1. **Verifica backend corriendo:**
   - Abre http://localhost:3001/health
   - Debería responder OK

2. **Verifica CORS:**

   ```env
   # En backend\.env
   FRONTEND_URL=http://localhost:3000
   ```

3. **Verifica URL en frontend:**

   ```env
   # En .env.local
   VITE_API_URL=http://localhost:3001
   ```

4. **Limpia caché del navegador:**
   - Ctrl + Shift + Supr
   - Limpia caché y cookies
   - Recarga página

---

### Error: "npm install falla"

**Síntoma:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solución:**

```bash
# Limpia caché
npm cache clean --force

# Borra node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstala
npm install
```

---

### Error: Tests E2E fallan

**Síntoma:**

```
Error: browserType.launch: Executable doesn't exist
```

**Solución:**

```bash
# Instala browsers de Playwright
npm run test:e2e -- --install-browsers

# O manualmente
npx playwright install
```

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar todo (automático)
.\START.bat

# Backend
cd backend
npm run dev              # Servidor desarrollo
npm run build            # Compilar TypeScript
npm start                # Servidor producción

# Frontend
npm run dev              # Servidor desarrollo
npm run build            # Compilar para producción
npm run preview          # Vista previa producción
```

### Base de Datos

```bash
cd backend

npm run prisma:studio    # Abrir Prisma Studio (UI)
npm run prisma:migrate   # Crear/aplicar migraciones
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:reset     # Resetear base de datos
```

### Testing

```bash
# Tests unitarios
npm test
npm run test:ui          # Modo interactivo
npm run test:coverage    # Con cobertura

# Tests E2E
npm run test:e2e         # Ejecutar todos
npm run test:e2e:ui      # Modo UI
npm run test:e2e:debug   # Modo debug
```

### Calidad

```bash
npm run lint             # Verificar código
npm run lint:fix         # Auto-corregir
npm run format           # Formatear con Prettier
npm run typecheck        # Verificar tipos TypeScript
```

---

## 📚 Recursos Adicionales

- [README.md](./README.md) - Documentación principal
- [BACKLOG.md](./BACKLOG.md) - Tareas pendientes
- [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) - Despliegue móvil
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Guía Supabase detallada
- [docs/](./docs/) - Documentación técnica

---

## 🎉 ¡Listo!

Si has seguido todos los pasos y las verificaciones son exitosas:

✅ **Tu entorno de desarrollo está configurado**

**Próximos pasos:**

1. Explora la aplicación en http://localhost:3000
2. Prueba el chat con IA
3. Guarda una reparación de prueba
4. Verifica en Prisma Studio que se guardó

---

**¿Problemas?** Abre un issue en GitHub o revisa la documentación adicional.
