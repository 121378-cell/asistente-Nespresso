# ☕ Nespresso Assistant - Asistente de Reparación

Asistente inteligente para reparación de cafeteras Nespresso Profesionales con IA, base de datos PostgreSQL y soporte para dispositivos móviles.

## 🚀 Inicio Rápido

### Windows (Doble Clic)

1. **Doble clic en `START.bat`**
2. La aplicación se abrirá automáticamente en tu navegador
3. ¡Listo para usar!

### Primera Vez

Si es la primera vez que ejecutas la aplicación:

1. **Ejecuta `START.ps1`** (clic derecho → "Ejecutar con PowerShell")
2. Sigue las instrucciones en pantalla para:
   - Configurar base de datos (Supabase recomendado)
   - Añadir tu API Key de Gemini
3. Las dependencias se instalarán automáticamente

## 📋 Requisitos

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **Base de datos PostgreSQL**:
  - Opción 1: [Supabase](https://supabase.com/) (gratis, en la nube) ⭐ Recomendado
  - Opción 2: PostgreSQL local ([Descargar](https://www.postgresql.org/download/))
- **API Key de Gemini** ([Obtener gratis](https://aistudio.google.com/apikey))

## 📁 Estructura del Proyecto

```
asistente-nespresso/
├── START.bat              # ⭐ Ejecutar aplicación (doble clic)
├── START.ps1              # Instalador completo con configuración
├── backend/               # API Backend (Express + Prisma)
│   ├── src/
│   │   ├── server.ts      # Servidor Express
│   │   ├── controllers/   # Lógica de negocio
│   │   └── routes/        # Rutas API
│   ├── prisma/
│   │   └── schema.prisma  # Esquema de base de datos
│   └── .env               # Configuración backend
├── components/            # Componentes React
├── services/              # Servicios (API, Gemini)
├── public/                # Archivos estáticos + PWA
│   ├── manifest.json      # Configuración PWA
│   └── sw.js              # Service Worker
├── App.tsx                # Aplicación principal
├── .env.local             # Configuración frontend
└── README.md              # Este archivo
```

## 🎯 Características

### ✅ Funcionalidades Principales

- 🤖 **Asistente IA con Gemini** - Diagnóstico y soluciones inteligentes
- 📸 **Identificación por cámara** - Detecta modelo por número de serie
- 📋 **Checklists personalizados** - Por modelo de cafetera
- 💾 **Guardar reparaciones** - Base de datos PostgreSQL
- 🔍 **Búsqueda en Google** - Información actualizada
- 📱 **PWA** - Instalar como app en móvil
- 🌐 **Acceso multiplataforma** - Windows, Mac, Linux, móviles

### ✅ Tecnologías

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- Axios

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- CORS habilitado

## 📱 Acceso desde Móvil

### Opción 1: Red Local (Mismo WiFi)

1. Obtén tu IP local:
   ```bash
   ipconfig
   ```
2. En tu móvil, abre: `http://TU-IP:3000`
3. Instala como app (PWA):
   - **Android**: Menú → "Añadir a pantalla de inicio"
   - **iOS**: Compartir → "Añadir a pantalla de inicio"

### Opción 2: Despliegue en la Nube

Ver [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) para instrucciones completas de despliegue en Vercel, Railway, etc.

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Iniciar todo (automático)
.\START.bat

# O manualmente:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Base de Datos

```bash
cd backend

# Ver base de datos (interfaz gráfica)
npm run prisma:studio

# Crear migración
npm run prisma:migrate

# Generar cliente Prisma
npm run prisma:generate
```

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

## 🔧 Configuración

### Variables de Entorno

**Frontend (`.env.local`):**
```env
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=tu_api_key_aqui
```

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://usuario:contraseña@host:5432/database
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📚 Documentación

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Guía completa de configuración
- [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) - Despliegue para móviles
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configurar Supabase
- [backend/README.md](./backend/README.md) - Documentación de la API

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (ejecutar `npm run prisma:studio`)
- **Health Check**: http://localhost:3001/health

## 📊 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/repairs` | Listar reparaciones |
| GET | `/api/repairs/:id` | Obtener reparación |
| POST | `/api/repairs` | Crear reparación |
| PUT | `/api/repairs/:id` | Actualizar reparación |
| DELETE | `/api/repairs/:id` | Eliminar reparación |

## ❓ Solución de Problemas

### "Node.js no está instalado"
- Descarga e instala desde: https://nodejs.org/

### "Error de conexión a la base de datos"
- Verifica que `backend/.env` tenga la URL correcta
- Si usas Supabase, verifica que la contraseña sea correcta
- Prueba la conexión en Prisma Studio

### "El frontend no conecta al backend"
- Verifica que ambos servidores estén corriendo
- Verifica que `VITE_API_URL` en `.env.local` sea correcta
- Revisa la consola del navegador (F12) para errores

### "Error al guardar reparación"
- Verifica que el backend esté corriendo
- Revisa los logs del backend en la terminal
- Verifica la conexión a la base de datos

## 🔒 Seguridad

- ✅ Las API keys están en archivos `.env` (no se suben a Git)
- ✅ CORS configurado para el frontend específico
- ✅ Variables de entorno separadas por ambiente
- ⚠️ Para producción, considera añadir autenticación

## 🚀 Próximos Pasos

- [ ] Añadir autenticación de usuarios
- [ ] Implementar notificaciones push
- [ ] Añadir más modelos de cafeteras
- [ ] Exportar reparaciones a PDF
- [ ] Modo offline completo

## 📝 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

---

**Hecho con ❤️ para técnicos de Nespresso Profesional**
