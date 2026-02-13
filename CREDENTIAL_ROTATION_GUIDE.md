# 🔐 Guía Completa de Rotación de Credenciales

**Fecha:** 2025-11-24  
**Motivo:** Credenciales expuestas en repositorio  
**Urgencia:** 🔴 CRÍTICA

---

## ⚠️ IMPORTANTE

Las siguientes credenciales fueron expuestas y **DEBEN** ser rotadas:

- ✅ Password de Supabase (en `password supabase.txt` - ya eliminado)
- ⚠️ Posiblemente API keys de Supabase
- ⚠️ Posiblemente API key de Gemini

---

## 📋 Checklist de Rotación

### Fase 1: Preparación (5 minutos)

- [ ] **Backup de configuración actual**

  ```bash
  # Guardar .env actual (por si acaso)
  cp .env .env.backup.old
  cp backend/.env backend/.env.backup.old
  ```

- [ ] **Verificar acceso a Supabase Dashboard**
  - URL: https://supabase.com/dashboard
  - Asegúrate de poder iniciar sesión

- [ ] **Tener a mano un gestor de contraseñas**
  - 1Password, LastPass, Bitwarden, etc.
  - Para guardar las nuevas credenciales de forma segura

---

### Fase 2: Rotar Credenciales de Supabase (10 minutos)

#### 2.1 Acceder al Dashboard

1. Ve a https://supabase.com/dashboard
2. Inicia sesión
3. Selecciona tu proyecto

#### 2.2 Rotar API Keys

**Settings → API:**

1. **Anon Key (pública):**
   - Copia la key actual (por si acaso)
   - Click en "Regenerate anon key"
   - **Copia la nueva key inmediatamente**
   - Guárdala en tu gestor de contraseñas

2. **Service Role Key (privada):**
   - Copia la key actual (por si acaso)
   - Click en "Regenerate service_role key"
   - **Copia la nueva key inmediatamente**
   - Guárdala en tu gestor de contraseñas
   - ⚠️ **NUNCA uses esta key en el frontend**

#### 2.3 Cambiar Password de Base de Datos

**Settings → Database:**

1. Scroll hasta "Database password"
2. Click en "Generate new password"
3. **Copia la nueva password inmediatamente**
4. Guárdala en tu gestor de contraseñas
5. Click en "Update password"

#### 2.4 Obtener nueva DATABASE_URL

**Settings → Database → Connection string:**

1. Selecciona "URI" tab
2. Copia la nueva connection string
3. Reemplaza `[YOUR-PASSWORD]` con la nueva password
4. Guárdala en tu gestor de contraseñas

---

### Fase 3: Actualizar Variables de Entorno (5 minutos)

#### 3.1 Frontend (.env)

```bash
# En la raíz del proyecto
# Edita .env con las nuevas credenciales

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=nueva_anon_key_aqui
VITE_API_URL=http://localhost:3001
VITE_GEMINI_API_KEY=tu_gemini_api_key
NODE_ENV=development
```

**Verificar:**

```bash
# Asegúrate que .env NO está en git
git status
# No debería aparecer .env
```

#### 3.2 Backend (backend/.env)

```bash
# En backend/.env
# Edita con las nuevas credenciales

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=nueva_service_role_key_aqui
DATABASE_URL=postgresql://postgres:nueva_password@db.tu-proyecto.supabase.co:5432/postgres
GEMINI_API_KEY=tu_gemini_api_key
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Verificar:**

```bash
cd backend
git status
# No debería aparecer .env
```

---

### Fase 4: Verificar Configuración (2 minutos)

```bash
# Ejecutar script de verificación
node scripts/verify-env.js
```

**Salida esperada:**

```
🔍 Verificando variables de entorno...

📦 Frontend:
  ✅ Todas las variables configuradas correctamente

🔧 Backend:
  ✅ Todas las variables configuradas correctamente

✅ Todas las variables de entorno están configuradas correctamente
```

---

### Fase 5: Reiniciar Servicios (2 minutos)

#### 5.1 Detener servicios actuales

```bash
# En la terminal donde corre npm run dev
# Presiona Ctrl+C

# Si hay backend corriendo
# En esa terminal también Ctrl+C
```

#### 5.2 Reiniciar con nuevas credenciales

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (si aplica)
cd backend
npm run dev
```

---

### Fase 6: Probar Conexión (5 minutos)

#### 6.1 Verificar Frontend

1. Abre http://localhost:3000 (o el puerto que uses)
2. Abre DevTools (F12)
3. Ve a Console
4. **No deberían haber errores de autenticación**
5. Prueba una funcionalidad que use Supabase

#### 6.2 Verificar Backend

```bash
# Probar health check
curl http://localhost:3001/health

# Debería responder:
# {"status":"ok"}
```

#### 6.3 Verificar Base de Datos

```bash
# En el backend, prueba una query
# O usa Supabase Dashboard → Table Editor
# Verifica que puedes ver/editar datos
```

---

### Fase 7: Limpiar Historial de Git (Opcional - 10 minutos)

⚠️ **ADVERTENCIA:** Esto reescribe el historial de Git

#### 7.1 Crear backup

```bash
# Crear rama de backup
git branch backup-before-cleanup

# Verificar
git branch
```

#### 7.2 Limpiar archivo del historial

```bash
# Eliminar "password supabase.txt" del historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch 'password supabase.txt'" \
  --prune-empty --tag-name-filter cat -- --all
```

#### 7.3 Limpiar referencias

```bash
# Limpiar refs
rm -rf .git/refs/original/

# Limpiar reflog
git reflog expire --expire=now --all

# Garbage collection
git gc --prune=now --aggressive
```

#### 7.4 Forzar push (si ya está en remoto)

```bash
# ⚠️ SOLO si el repo ya está en GitHub/GitLab
git push origin --force --all
git push origin --force --tags
```

---

### Fase 8: Verificación Final (5 minutos)

#### 8.1 Checklist de Seguridad

- [ ] Nuevas API keys generadas en Supabase
- [ ] Nueva password de DB generada
- [ ] .env actualizado con nuevas credenciales
- [ ] backend/.env actualizado
- [ ] .env.example actualizado (sin valores reales)
- [ ] .gitignore incluye .env
- [ ] Script de verificación pasa ✅
- [ ] Frontend conecta correctamente
- [ ] Backend conecta correctamente
- [ ] Base de datos accesible
- [ ] Credenciales guardadas en gestor de contraseñas
- [ ] Historial de Git limpiado (opcional)
- [ ] Backup de .env.old eliminado

#### 8.2 Eliminar backups

```bash
# Una vez verificado que todo funciona
rm .env.backup.old
rm backend/.env.backup.old
```

---

## 🎯 Comandos Rápidos de Verificación

```bash
# Verificar que .env no está en git
git status | grep .env
# No debería mostrar nada

# Verificar .gitignore
cat .gitignore | grep .env
# Debería mostrar: .env

# Verificar variables de entorno
node scripts/verify-env.js

# Verificar servicios
curl http://localhost:3001/health
```

---

## 🆘 Troubleshooting

### Error: "Invalid API key"

**Solución:**

1. Verifica que copiaste la key completa
2. No debe haber espacios al inicio/final
3. Reinicia el servidor después de cambiar .env

### Error: "Connection refused" en DB

**Solución:**

1. Verifica la DATABASE_URL
2. Asegúrate que la password es correcta
3. Verifica que el proyecto de Supabase está activo

### Error: "CORS policy"

**Solución:**

1. Verifica ALLOWED_ORIGINS en backend/.env
2. Incluye el puerto correcto del frontend
3. Reinicia el backend

### Script verify-env.js falla

**Solución:**

```bash
# Instalar dependencias si es necesario
npm install

# Ejecutar con node directamente
node scripts/verify-env.js
```

---

## 📞 Contacto de Emergencia

Si tienes problemas:

1. **Supabase Support:** https://supabase.com/support
2. **Documentación:** https://supabase.com/docs
3. **Discord:** https://discord.supabase.com

---

## ✅ Confirmación Final

Una vez completado todo:

```bash
# Ejecutar este comando para confirmar
echo "✅ Rotación de credenciales completada el $(date)" >> SECURITY_LOG.md
git add SECURITY_LOG.md
git commit -m "docs: credential rotation completed"
```

---

**¡Listo! Tus credenciales ahora están seguras.** 🔐
