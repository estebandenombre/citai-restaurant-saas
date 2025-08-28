-- Script para configurar el almacenamiento de imágenes de platos del menú
-- Ejecutar en la consola SQL de Supabase

-- Verificar que el bucket 'images' existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
    -- Crear el bucket 'images' si no existe
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'images',
      'images',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    );
  END IF;
END $$;

-- Verificar que las políticas RLS existen para el bucket de imágenes
-- Permitir lectura pública de imágenes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');
  END IF;
END $$;

-- Permitir inserción de imágenes solo a usuarios autenticados
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload images') THEN
    CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'images' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Permitir actualización de imágenes solo al propietario
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own images') THEN
    CREATE POLICY "Users can update own images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Permitir eliminación de imágenes solo al propietario
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own images') THEN
    CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'images' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Verificar que la tabla menu_items tiene el campo image_url
DO $$
BEGIN
  -- Verificar si existe el campo image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_menu_items_image_url ON menu_items(image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);

-- Comentario sobre la estructura de carpetas para imágenes de platos
-- Las imágenes se organizarán como:
-- images/menu-items/{restaurant_id}/{timestamp}-{random_id}.{ext}
-- Esto permite que cada restaurante tenga sus propias imágenes organizadas

-- Mensaje de confirmación
SELECT 'Menu images storage configuration completed successfully!' as status;

