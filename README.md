# Nespresso Assistant - Asistente de Reparación

Backend y base de datos para el asistente de reparación de cafeteras Nespresso Profesionales.

## 🚀 Inicio Rápido

### Opción 1: Setup Automático (Recomendado)

```powershell
.\setup-backend.ps1
```

### Opción 2: Setup Manual

Ver [SETUP_GUIDE.md](./SETUP_GUIDE.md) para instrucciones detalladas.

## 📁 Estructura del Proyecto

```
asistente-nespresso/
├── backend/              # Backend API con Express y Prisma
│   ├── src/
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/       # Rutas de la API
│   │   └── server.ts     # Servidor Express
│   ├── prisma/
│   │   └── schema.prisma # Esquema de base de datos
│   └── package.json
├── components/           # Componentes React
├── services/            # Servicios (API, Gemini, etc.)
├── App.tsx              # Aplicación principal
└── package.json         # Frontend

```

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM

**Frontend:**
- React 19
- TypeScript
- Vite
- Axios

## 📚 Documentación

- [Guía de Configuración](./SETUP_GUIDE.md) - Setup completo paso a paso
- [Backend README](./backend/README.md) - Documentación de la API

## 🔗 Enlaces Útiles

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Prisma Studio: http://localhost:5555 (ejecutar `npm run prisma:studio` en backend/)

## 📝 Licencia

MIT
