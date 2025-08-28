-- Script para arreglar el error de función duplicada
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar todas las funciones existentes con el mismo nombre
DROP FUNCTION IF EXISTS optimize_hero_image_url(TEXT);
DROP FUNCTION IF EXISTS optimize_hero_image_url(TEXT, INTEGER);
DROP FUNCTION IF EXISTS optimize_hero_image_url(TEXT, INTEGER, INTEGER);

-- 2. Crear función única y simple
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

-- 3. Actualizar bucket para mejor calidad
UPDATE storage.buckets 
SET file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
WHERE id = 'images';

-- 4. Optimizar todas las imágenes del hero
UPDATE restaurants 
SET cover_image_url = optimize_hero_image_url(cover_image_url)
WHERE is_active = true 
  AND cover_image_url IS NOT NULL 
  AND cover_image_url != ''
  AND cover_image_url LIKE '%supabase.co%'
  AND (cover_image_url NOT LIKE '%width=%' OR cover_image_url NOT LIKE '%quality=%');

-- 5. Mostrar resultados
SELECT 
  'Hero images optimized successfully' as status,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as with_hero_images,
  COUNT(CASE WHEN cover_image_url LIKE '%width=1920%' AND cover_image_url LIKE '%quality=95%' THEN 1 END) as optimized_images
FROM restaurants 
WHERE is_active = true;

-- 6. Mostrar URLs actualizadas
SELECT 
  name,
  cover_image_url,
  CASE 
    WHEN cover_image_url LIKE '%width=1920%' AND cover_image_url LIKE '%quality=95%' THEN '✅ Optimized'
    WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN '⚠️ Needs optimization'
    ELSE '❌ No image'
  END as status
FROM restaurants 
WHERE is_active = true
ORDER BY name;
