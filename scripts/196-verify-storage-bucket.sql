-- Script para verificar la configuración del bucket de storage
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si el bucket existe
SELECT 
  'Verificando bucket menu-images:' as info;

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'menu-images';

-- 2. Verificar políticas RLS del bucket
SELECT 
  'Políticas RLS del bucket:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND qual LIKE '%menu-images%'
ORDER BY policyname;

-- 3. Verificar archivos en el bucket
SELECT 
  'Archivos en el bucket:' as info;

SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'menu-images'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar si RLS está habilitado en storage.objects
SELECT 
  'RLS en storage.objects:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- 5. Crear bucket si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'menu-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'menu-images',
      'menu-images',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    RAISE NOTICE 'Bucket menu-images creado';
  ELSE
    RAISE NOTICE 'Bucket menu-images ya existe';
  END IF;
END $$;

-- 6. Crear políticas RLS si no existen
DO $$
BEGIN
  -- Política para permitir subida de imágenes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload menu images'
  ) THEN
    CREATE POLICY "Users can upload menu images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'menu-images' AND
      auth.role() = 'authenticated'
    );
    RAISE NOTICE 'Política de subida creada';
  END IF;

  -- Política para permitir lectura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public can view menu images'
  ) THEN
    CREATE POLICY "Public can view menu images" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'menu-images'
    );
    RAISE NOTICE 'Política de lectura pública creada';
  END IF;

  -- Política para permitir actualización
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update own menu images'
  ) THEN
    CREATE POLICY "Users can update own menu images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'menu-images' AND
      auth.role() = 'authenticated'
    );
    RAISE NOTICE 'Política de actualización creada';
  END IF;

  -- Política para permitir eliminación
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete own menu images'
  ) THEN
    CREATE POLICY "Users can delete own menu images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'menu-images' AND
      auth.role() = 'authenticated'
    );
    RAISE NOTICE 'Política de eliminación creada';
  END IF;
END $$;

-- 7. Verificar configuración final
SELECT 
  'Configuración final del bucket:' as info;

SELECT 
  'Bucket:' as info,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'menu-images';

SELECT 
  'Políticas RLS:' as info,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND qual LIKE '%menu-images%'
ORDER BY policyname;




