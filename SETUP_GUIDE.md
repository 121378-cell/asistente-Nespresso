# 🚀 Guía de Configuración - Backend Nespresso Assistant

Esta guía te ayudará a configurar el backend con base de datos PostgreSQL para tu aplicación Nespresso Assistant.

## 📋 Requisitos Previos

- ✅ Node.js (v18 o superior) - Ya instalado
- ⚠️ PostgreSQL (v14 o superior) - **Necesitas instalarlo**

## 🗄️ Instalación de PostgreSQL

### Opción 1: PostgreSQL Local (Recomendado para desarrollo)

**Windows:**
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Ejecuta el instalador
3. Durante la instalación:
   - Usuario: `postgres`
   - Contraseña: elige una (por ejemplo: `postgres`)
   - Puerto: `5432` (por defecto)
4. Marca la opción para instalar pgAdmin (interfaz gráfica)

**Verificar instalación:**
```bash
psql --version
```

### Opción 2: PostgreSQL en la Nube (Más fácil, sin instalación local)

Usa un servicio gratuito como:
- **[Supabase](https://supabase.com/)** - 500MB gratis
- **[Railway](https://railway.app/)** - Gratis con límites
- **[Render](https://render.com/)** - PostgreSQL gratis

## ⚙️ Configuración del Backend

### 1. Configurar Variables de Entorno

El archivo `.env` ya existe en `backend/.env.example`. Necesitas crear una copia:

**Si usas PostgreSQL local:**
```bash
cd backend
copy .env.example .env
```

Edita `backend/.env` y actualiza la línea `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/nespresso_assistant?schema=public"
```

**Si usas PostgreSQL en la nube:**
Copia la URL de conexión que te proporcione el servicio (Supabase, Railway, etc.) y pégala en `DATABASE_URL`.

### 2. Crear la Base de Datos (solo si usas PostgreSQL local)

Abre una terminal y ejecuta:
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE nespresso_assistant;

# Salir
\q
```

### 3. Ejecutar Migraciones de Prisma

Esto creará las tablas en tu base de datos:

```bash
cd backend
npm run prisma:migrate
```

Cuando te pregunte por el nombre de la migración, escribe: `init`

### 4. Generar el Cliente de Prisma

```bash
npm run prisma:generate
```

## 🎯 Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
🌐 CORS enabled for: http://localhost:5173
```

## 🧪 Probar el Backend

Abre otra terminal y prueba:

```bash
# Health check
curl http://localhost:3001/health
```

Deberías recibir: `{"status":"ok","timestamp":"..."}`

## 🎨 Ver la Base de Datos (Opcional)

Prisma Studio es una interfaz gráfica para ver tus datos:

```bash
cd backend
npm run prisma:studio
```

Se abrirá en http://localhost:5555

## 🚀 Iniciar Frontend + Backend Juntos

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

El frontend estará en: http://localhost:5173
El backend estará en: http://localhost:3001

## ❌ Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica tu `DATABASE_URL` en `backend/.env`
- Si usas PostgreSQL local, verifica usuario/contraseña

### Error: "Port 3001 already in use"
- Cambia el puerto en `backend/.env`: `PORT=3002`
- O mata el proceso: `npx kill-port 3001`

### Error: "Prisma schema not found"
- Asegúrate de estar en la carpeta `backend`
- Ejecuta: `npm run prisma:generate`

### Frontend no puede conectar al backend
- Verifica que el backend esté corriendo en http://localhost:3001
- Verifica que no haya errores en la consola del backend
- Verifica CORS en `backend/.env`: `FRONTEND_URL=http://localhost:5173`

## 📚 Comandos Útiles

```bash
# Backend
cd backend
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm start                # Iniciar servidor de producción
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:migrate   # Crear nueva migración

# Frontend
npm run dev              # Iniciar frontend
npm run build            # Compilar frontend
```

## 🎉 ¡Listo!

Una vez que ambos servidores estén corriendo:
1. Abre http://localhost:5173
2. Usa la aplicación normalmente
3. Guarda una reparación
4. Verifica que se guardó en la base de datos (Prisma Studio o pgAdmin)

---

**Nota:** Las reparaciones guardadas anteriormente en localStorage NO se migrarán automáticamente. Son sistemas de almacenamiento diferentes.
