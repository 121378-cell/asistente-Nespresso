# 🚀 Configuración Rápida de Supabase

## Paso 1: Crear cuenta en Supabase (2 minutos)

1. Abre tu navegador y ve a: **https://supabase.com/**
2. Haz clic en **"Start your project"** o **"Sign up"**
3. Inicia sesión con tu cuenta de GitHub (recomendado) o crea una cuenta nueva

## Paso 2: Crear un nuevo proyecto (1 minuto)

1. Una vez dentro, haz clic en **"New Project"**
2. Completa los datos:
   - **Name**: `º` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala, la necesitarás)
   - **Region**: Elige la más cercana a ti (Europe West recomendado)
   - **Pricing Plan**: Selecciona **Free** (gratis)
3. Haz clic en **"Create new project"**
4. Espera 1-2 minutos mientras se crea el proyecto

## Paso 3: Obtener la URL de conexión

1. En el panel de Supabase, ve a **Settings** (⚙️ en la barra lateral)
2. Haz clic en **Database**
3. Busca la sección **"Connection string"**
4. Selecciona la pestaña **"URI"**
5. Copia la URL que empieza con `postgresql://postgres:[YOUR-PASSWORD]@...`
6. **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que generaste en el Paso 2

La URL debería verse así:
```
postgresql://postgres.xxxxxxxxxxxxx:[TU-CONTRASEÑA]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Paso 4: Configurar el archivo .env

Ahora voy a crear el archivo `.env` con tu URL de conexión.

**¿Ya tienes la URL de Supabase?** 
- Si es así, cópiala y pégala cuando te lo pida
- Si no, sigue los pasos 1-3 primero

---

## Alternativa: PostgreSQL Local

Si prefieres instalar PostgreSQL localmente:
1. Descarga desde: https://www.postgresql.org/download/windows/
2. Instala con usuario `postgres` y contraseña `postgres`
3. La URL será: `postgresql://postgres:postgres@localhost:5432/nespresso_assistant`
