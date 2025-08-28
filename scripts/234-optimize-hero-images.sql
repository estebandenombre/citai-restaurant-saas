-- Script para optimizar imágenes del hero y mejorar la calidad
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar configuración del bucket para imágenes de alta calidad
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB para imágenes de alta calidad
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  public = true
WHERE id = 'images';

-- 2. Crear función para optimizar URLs de imágenes del hero
CREATE OR REPLACE FUNCTION optimize_hero_image_url(image_url TEXT, width INTEGER DEFAULT 1920, height INTEGER DEFAULT 1080)
RETURNS TEXT AS $$
BEGIN
  -- Si no hay URL, devolver null
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  -- Si es una imagen de Supabase, agregar parámetros de optimización
  IF image_url LIKE '%supabase.co%' THEN
    RETURN image_url || 
           '?width=' || width::TEXT ||
           '&height=' || height::TEXT ||
           '&quality=90' ||
           '&format=webp' ||
           '&fit=cover' ||
           '&gravity=center';
  END IF;
  
  RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear función para optimizar URLs de logos
CREATE OR REPLACE FUNCTION optimize_logo_url(image_url TEXT, size INTEGER DEFAULT 120)
RETURNS TEXT AS $$
BEGIN
  -- Si no hay URL, devolver null
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  -- Si es una imagen de Supabase, agregar parámetros de optimización
  IF image_url LIKE '%supabase.co%' THEN
    RETURN image_url || 
           '?width=' || size::TEXT ||
           '&height=' || size::TEXT ||
           '&quality=95' ||
           '&format=webp' ||
           '&fit=cover' ||
           '&gravity=center';
  END IF;
  
  RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear vista para restaurantes con URLs optimizadas
CREATE OR REPLACE VIEW restaurants_with_optimized_images AS
SELECT 
  id,
  name,
  slug,
  description,
  cuisine_type,
  address,
  phone,
  email,
  website,
  logo_url,
  optimize_logo_url(logo_url, 120) as optimized_logo_url,
  cover_image_url,
  optimize_hero_image_url(cover_image_url, 1920, 1080) as optimized_hero_image_url,
  is_active,
  created_at,
  updated_at
FROM restaurants
WHERE is_active = true;

-- 5. Crear función para limpiar imágenes de baja calidad
CREATE OR REPLACE FUNCTION cleanup_low_quality_images()
RETURNS void AS $$
DECLARE
  image_record RECORD;
BEGIN
  -- Encontrar imágenes que podrían ser de baja calidad
  FOR image_record IN 
    SELECT name, metadata
    FROM storage.objects 
    WHERE bucket_id = 'images' 
      AND (storage.foldername(name))[1] IN ('hero-images', 'logos')
      AND metadata->>'size' IS NOT NULL
      AND (metadata->>'size')::INTEGER < 50000 -- Menos de 50KB
  LOOP
    -- Marcar para revisión manual
    RAISE NOTICE 'Low quality image found: % (size: % bytes)', 
      image_record.name, 
      image_record.metadata->>'size';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear función para generar URLs de diferentes tamaños
CREATE OR REPLACE FUNCTION generate_responsive_image_urls(image_url TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  -- Generar URLs para diferentes tamaños
  result := jsonb_build_object(
    'original', image_url,
    'large', optimize_hero_image_url(image_url, 1920, 1080),
    'medium', optimize_hero_image_url(image_url, 1200, 675),
    'small', optimize_hero_image_url(image_url, 800, 450),
    'thumbnail', optimize_hero_image_url(image_url, 400, 225)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear vista para restaurantes con URLs responsivas
CREATE OR REPLACE VIEW restaurants_with_responsive_images AS
SELECT 
  id,
  name,
  slug,
  description,
  cuisine_type,
  address,
  phone,
  email,
  website,
  logo_url,
  optimize_logo_url(logo_url, 120) as optimized_logo_url,
  cover_image_url,
  generate_responsive_image_urls(cover_image_url) as responsive_hero_images,
  is_active,
  created_at,
  updated_at
FROM restaurants
WHERE is_active = true;

-- 8. Crear función para validar calidad de imagen
CREATE OR REPLACE FUNCTION validate_image_quality(image_url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Si no hay URL, devolver error
  IF image_url IS NULL OR image_url = '' THEN
    RETURN 'NO_IMAGE';
  END IF;
  
  -- Si es una imagen de Supabase, verificar que tenga parámetros de optimización
  IF image_url LIKE '%supabase.co%' THEN
    IF image_url LIKE '%quality=%' AND image_url LIKE '%format=webp%' THEN
      RETURN 'OPTIMIZED';
    ELSE
      RETURN 'NEEDS_OPTIMIZATION';
    END IF;
  END IF;
  
  RETURN 'EXTERNAL_IMAGE';
END;
$$ LANGUAGE plpgsql;

-- 9. Crear vista para estadísticas de calidad de imágenes
CREATE OR REPLACE VIEW image_quality_stats AS
SELECT 
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) as restaurants_with_logo,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as restaurants_with_hero,
  COUNT(CASE WHEN validate_image_quality(logo_url) = 'OPTIMIZED' THEN 1 END) as optimized_logos,
  COUNT(CASE WHEN validate_image_quality(cover_image_url) = 'OPTIMIZED' THEN 1 END) as optimized_hero_images,
  ROUND(
    (COUNT(CASE WHEN validate_image_quality(logo_url) = 'OPTIMIZED' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END), 0)) * 100, 
    2
  ) as logo_optimization_percentage,
  ROUND(
    (COUNT(CASE WHEN validate_image_quality(cover_image_url) = 'OPTIMIZED' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END), 0)) * 100, 
    2
  ) as hero_optimization_percentage
FROM restaurants
WHERE is_active = true;

-- 10. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_restaurants_cover_image_quality 
ON restaurants(cover_image_url) 
WHERE cover_image_url IS NOT NULL AND cover_image_url != '';

CREATE INDEX IF NOT EXISTS idx_restaurants_logo_quality 
ON restaurants(logo_url) 
WHERE logo_url IS NOT NULL AND logo_url != '';

-- 11. Mensaje de confirmación
SELECT 
  'Hero image optimization completed successfully!' as status,
  'Functions created: optimize_hero_image_url, optimize_logo_url, generate_responsive_image_urls' as functions,
  'Views created: restaurants_with_optimized_images, restaurants_with_responsive_images, image_quality_stats' as views;

-- 12. Mostrar estadísticas actuales
SELECT * FROM image_quality_stats;
