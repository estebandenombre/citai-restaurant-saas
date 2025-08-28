-- Script para configurar el almacenamiento de imágenes del hero y logos
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

-- Comentario sobre la estructura de carpetas para imágenes del hero
-- Las imágenes se organizarán como:
-- images/logos/{restaurant_id}/{timestamp}-{random_id}.{ext}
-- images/hero-images/{restaurant_id}/{timestamp}-{random_id}.{ext}
-- Esto permite que cada restaurante tenga sus propias imágenes organizadas

-- Verificar que la tabla restaurants tiene los campos necesarios
DO $$
BEGIN
  -- Verificar si existe el campo logo_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN logo_url TEXT;
  END IF;

  -- Verificar si existe el campo cover_image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN cover_image_url TEXT;
  END IF;
END $$;

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_restaurants_logo_url ON restaurants(logo_url) WHERE logo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_cover_image_url ON restaurants(cover_image_url) WHERE cover_image_url IS NOT NULL;

-- Mensaje de confirmación
SELECT 'Hero image storage configuration completed successfully!' as status;
