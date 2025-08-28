-- Script para limpiar completamente y crear sistema de optimización fresco
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar vistas que dependen de las funciones
DROP VIEW IF EXISTS restaurants_with_optimized_images;
DROP VIEW IF EXISTS image_optimization_stats;

-- 2. Eliminar todas las funciones existentes con CASCADE
DROP FUNCTION IF EXISTS optimize_hero_image_url(TEXT) CASCADE;
DROP FUNCTION IF EXISTS optimize_hero_image_url(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS optimize_hero_image_url(TEXT, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS optimize_logo_url(TEXT) CASCADE;
DROP FUNCTION IF EXISTS optimize_logo_url(TEXT, INTEGER) CASCADE;

-- 3. Crear función única y simple para hero images
CREATE OR REPLACE FUNCTION optimize_hero_image_url(image_url TEXT)
RETURNS TEXT AS $$
BEGIN
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  IF image_url LIKE '%supabase.co%' AND image_url LIKE '%storage%' THEN
    -- Limpiar parámetros existentes
    image_url := regexp_replace(image_url, '(\?|&)(width|height|quality|format|fit|gravity)=[^&]*', '', 'g');
    
    -- Agregar parámetros de optimización
    RETURN image_url || '?width=1920&height=1080&quality=95&format=webp&fit=cover&gravity=center';
  END IF;
  
  RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear función para logos
CREATE OR REPLACE FUNCTION optimize_logo_url(image_url TEXT)
RETURNS TEXT AS $$
BEGIN
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  IF image_url LIKE '%supabase.co%' AND image_url LIKE '%storage%' THEN
    -- Limpiar parámetros existentes
    image_url := regexp_replace(image_url, '(\?|&)(width|height|quality|format|fit|gravity)=[^&]*', '', 'g');
    
    -- Agregar parámetros de optimización para logos
    RETURN image_url || '?width=120&height=120&quality=95&format=webp&fit=cover&gravity=center';
  END IF;
  
  RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- 5. Actualizar bucket para mejor calidad
UPDATE storage.buckets 
SET file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
WHERE id = 'images';

-- 6. Optimizar todas las imágenes del hero
UPDATE restaurants 
SET cover_image_url = optimize_hero_image_url(cover_image_url)
WHERE is_active = true 
  AND cover_image_url IS NOT NULL 
  AND cover_image_url != ''
  AND cover_image_url LIKE '%supabase.co%'
  AND (cover_image_url NOT LIKE '%width=%' OR cover_image_url NOT LIKE '%quality=%');

-- 7. Optimizar todos los logos
UPDATE restaurants 
SET logo_url = optimize_logo_url(logo_url)
WHERE is_active = true 
  AND logo_url IS NOT NULL 
  AND logo_url != ''
  AND logo_url LIKE '%supabase.co%'
  AND (logo_url NOT LIKE '%width=%' OR logo_url NOT LIKE '%quality=%');

-- 8. Crear vista actualizada
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
  optimize_logo_url(logo_url) as optimized_logo_url,
  cover_image_url,
  optimize_hero_image_url(cover_image_url) as optimized_hero_image_url,
  is_active,
  created_at,
  updated_at
FROM restaurants
WHERE is_active = true;

-- 9. Mostrar resultados
SELECT 
  'Hero and Logo optimization completed successfully' as status,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as with_hero_images,
  COUNT(CASE WHEN cover_image_url LIKE '%width=1920%' AND cover_image_url LIKE '%quality=95%' THEN 1 END) as optimized_hero_images,
  COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) as with_logos,
  COUNT(CASE WHEN logo_url LIKE '%width=120%' AND logo_url LIKE '%quality=95%' THEN 1 END) as optimized_logos
FROM restaurants 
WHERE is_active = true;

-- 10. Mostrar URLs actualizadas
SELECT 
  name,
  cover_image_url as hero_image_url,
  logo_url,
  CASE 
    WHEN cover_image_url LIKE '%width=1920%' AND cover_image_url LIKE '%quality=95%' THEN '✅ Optimized'
    WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN '⚠️ Needs optimization'
    ELSE '❌ No image'
  END as hero_status,
  CASE 
    WHEN logo_url LIKE '%width=120%' AND logo_url LIKE '%quality=95%' THEN '✅ Optimized'
    WHEN logo_url IS NOT NULL AND logo_url != '' THEN '⚠️ Needs optimization'
    ELSE '❌ No logo'
  END as logo_status
FROM restaurants 
WHERE is_active = true
ORDER BY name;
