# Configuración de Supabase Storage para Imágenes

## Paso 1: Obtener Credenciales

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Settings → API
3. Copia **Project URL** y **Service Role Key**

## Paso 2: Variables de Entorno

Agrega a `backend/.env`:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key
```

## Paso 3: Crear Bucket

1. Storage → Create bucket
2. Name: `nespresso-images`
3. Public: ✅ Activado
4. Create bucket

## Paso 4: Políticas de Acceso

En Policies del bucket, crea:

**Lectura Pública:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'nespresso-images' );
```

**Upload Service:**
```sql
CREATE POLICY "Service Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'nespresso-images' );
```

¡Listo! El almacenamiento está configurado.
