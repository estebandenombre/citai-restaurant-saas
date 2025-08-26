-- Script para crear el bucket de almacenamiento para imágenes de platos
-- Ejecutar en la consola SQL de Supabase

-- Crear el bucket 'images' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas RLS para el bucket de imágenes
-- Permitir lectura pública de imágenes
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Permitir inserción de imágenes solo a usuarios autenticados
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Permitir actualización de imágenes solo al propietario
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir eliminación de imágenes solo al propietario
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Comentario sobre la estructura de carpetas
-- Las imágenes se organizarán como: images/menu-items/{restaurant_id}/{timestamp}.{ext}
-- Esto permite que cada restaurante tenga sus propias imágenes organizadas

