# 📱 Guía de Despliegue para Acceso Móvil

## Opción 1: Despliegue en la Nube (Recomendado para Móviles)

Para que tu aplicación sea accesible desde cualquier dispositivo móvil, necesitas desplegarla en internet.

### 🚀 Despliegue Rápido con Vercel (Gratis)

**Frontend:**

1. **Crear cuenta en Vercel**
   - Ve a https://vercel.com/
   - Regístrate con GitHub

2. **Subir tu código a GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU-USUARIO/nespresso-assistant.git
   git push -u origin main
   ```

3. **Importar en Vercel**
   - En Vercel, haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno:
     - `VITE_API_URL`: URL de tu backend (ver abajo)
     - `GEMINI_API_KEY`: Tu API key de Gemini
   - Haz clic en "Deploy"

**Backend:**

1. **Desplegar en Railway** (https://railway.app/)
   - Crea una cuenta
   - Haz clic en "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Configura el directorio raíz: `backend`
   - Añade variables de entorno:
     - `DATABASE_URL`: Tu URL de Supabase
     - `PORT`: 3001
     - `NODE_ENV`: production
     - `FRONTEND_URL`: URL de tu frontend en Vercel
   - Railway te dará una URL pública (ej: https://tu-app.railway.app)

2. **Actualizar frontend**
   - En Vercel, actualiza `VITE_API_URL` con la URL de Railway
   - Redeploy

### 🌐 Alternativas de Despliegue

**Frontend:**

- **Netlify**: https://netlify.com/ (gratis)
- **Cloudflare Pages**: https://pages.cloudflare.com/ (gratis)
- **GitHub Pages**: Solo para sitios estáticos

**Backend:**

- **Render**: https://render.com/ (gratis con límites)
- **Fly.io**: https://fly.io/ (gratis con límites)
- **Heroku**: https://heroku.com/ (de pago)

---

## Opción 2: Acceso Local desde Móvil (Misma Red WiFi)

Si solo quieres acceder desde tu móvil cuando estás en casa:

### Configuración

1. **Obtén tu IP local**

   ```bash
   ipconfig
   ```

   Busca "IPv4 Address" (ej: 192.168.1.100)

2. **Actualiza backend/.env**

   ```env
   FRONTEND_URL=http://TU-IP:3000
   ```

3. **Actualiza .env.local**

   ```env
   VITE_API_URL=http://TU-IP:3001
   ```

4. **Inicia la aplicación**

   ```bash
   .\START.bat
   ```

5. **Accede desde tu móvil**
   - Abre el navegador en tu móvil
   - Ve a: `http://TU-IP:3000`
   - Ejemplo: `http://192.168.1.100:3000`

### Instalar como App (PWA)

Una vez que accedas desde el móvil:

**Android (Chrome):**

1. Abre la aplicación en Chrome
2. Toca el menú (⋮)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma

**iOS (Safari):**

1. Abre la aplicación en Safari
2. Toca el botón de compartir (⬆️)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma

---

## Opción 3: Túnel Temporal con ngrok

Para acceso temporal desde cualquier lugar sin desplegar:

1. **Instalar ngrok**
   - Descarga desde: https://ngrok.com/download
   - Crea una cuenta gratuita

2. **Iniciar túneles**

   Terminal 1 (Backend):

   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):

   ```bash
   npm run dev
   ```

   Terminal 3 (Túnel Backend):

   ```bash
   ngrok http 3001
   ```

   Copia la URL (ej: https://abc123.ngrok.io)

   Terminal 4 (Túnel Frontend):

   ```bash
   ngrok http 3000
   ```

   Copia la URL (ej: https://xyz789.ngrok.io)

3. **Actualizar configuración**
   - Actualiza `VITE_API_URL` en `.env.local` con la URL del túnel backend
   - Actualiza `FRONTEND_URL` en `backend/.env` con la URL del túnel frontend
   - Reinicia ambos servidores

4. **Acceder desde móvil**
   - Abre la URL del túnel frontend en tu móvil
   - ¡Funciona desde cualquier lugar!

**Nota:** Los túneles de ngrok gratuitos expiran después de 2 horas.

---

## 📊 Comparación de Opciones

| Opción               | Acceso          | Costo  | Dificultad | Permanente |
| -------------------- | --------------- | ------ | ---------- | ---------- |
| **Vercel + Railway** | Global          | Gratis | Media      | ✅ Sí      |
| **Red Local**        | Solo WiFi local | Gratis | Fácil      | ✅ Sí      |
| **ngrok**            | Global          | Gratis | Fácil      | ❌ 2 horas |

---

## 🎯 Recomendación

Para uso profesional y acceso desde cualquier lugar:

1. **Desplegar en Vercel + Railway** (15-30 minutos de configuración)
2. **Instalar como PWA** en tu móvil
3. **Usar desde cualquier dispositivo** con internet

Para uso personal en casa:

1. **Acceso por red local** (5 minutos de configuración)
2. **Instalar como PWA** en tu móvil
3. **Funciona solo cuando estás en casa**

---

## 🔒 Seguridad

Si despliegas en la nube:

- ✅ Usa HTTPS (Vercel y Railway lo proporcionan automáticamente)
- ✅ No compartas tu URL públicamente
- ✅ Considera añadir autenticación en el futuro
- ✅ Mantén tus API keys seguras (nunca en el código)

---

## 📱 Resultado Final

Una vez configurado, tendrás:

- ✅ App instalable en móvil (como una app nativa)
- ✅ Funciona offline (caché de PWA)
- ✅ Acceso desde cualquier dispositivo
- ✅ Datos sincronizados en la nube
- ✅ Notificaciones push (futuro)
