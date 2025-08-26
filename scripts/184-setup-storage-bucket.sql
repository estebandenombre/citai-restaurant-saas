-- Script para configurar Supabase Storage para imágenes de menú
-- Ejecutar en Supabase SQL Editor

-- 1. Crear bucket para imágenes de menú
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear políticas RLS para el bucket
-- Política para permitir subida de imágenes a usuarios autenticados
CREATE POLICY "Users can upload menu images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'menu-images' AND
  auth.role() = 'authenticated'
);

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Public can view menu images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'menu-images'
);

-- Política para permitir actualización de imágenes propias
CREATE POLICY "Users can update own menu images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'menu-images' AND
  auth.role() = 'authenticated'
);

-- Política para permitir eliminación de imágenes propias
CREATE POLICY "Users can delete own menu images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'menu-images' AND
  auth.role() = 'authenticated'
);

-- 3. Verificar que el bucket se creó correctamente
SELECT 
  'Bucket creado:' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'menu-images';

-- 4. Verificar políticas RLS
SELECT 
  'Políticas RLS para menu-images:' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND qual LIKE '%menu-images%'
ORDER BY policyname;


