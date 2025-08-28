-- Script simple para arreglar la calidad de imágenes del hero
-- Ejecutar en Supabase SQL Editor

-- 1. Crear función de optimización de hero
CREATE OR REPLACE FUNCTION optimize_hero_image_url(image_url TEXT, width INTEGER DEFAULT 1920, height INTEGER DEFAULT 1080)
RETURNS TEXT AS $$
BEGIN
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  IF image_url LIKE '%supabase.co%' AND image_url LIKE '%storage%' THEN
    -- Limpiar parámetros existentes si los hay
    image_url := regexp_replace(image_url, '(\?|&)(width|height|quality|format|fit|gravity)=[^&]*', '', 'g');
    
    -- Agregar parámetros de optimización para máxima calidad
    RETURN image_url || 
           '?width=' || width::TEXT ||
           '&height=' || height::TEXT ||
           '&quality=95' ||
           '&format=webp' ||
           '&fit=cover' ||
           '&gravity=center';
  END IF;
  
  RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear función de optimización de logos
CREATE OR REPLACE FUNCTION optimize_logo_url(image_url TEXT, size INTEGER DEFAULT 120)
RETURNS TEXT AS $$
BEGIN
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  IF image_url LIKE '%supabase.co%' AND image_url LIKE '%storage%' THEN
    -- Limpiar parámetros existentes si los hay
    image_url := regexp_replace(image_url, '(\?|&)(width|height|quality|format|fit|gravity)=[^&]*', '', 'g');
    
    -- Agregar parámetros de optimización para logos
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

-- 3. Actualizar configuración del bucket
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB para imágenes de alta calidad
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
WHERE id = 'images';

-- 4. Optimizar todas las imágenes del hero existentes
UPDATE restaurants 
SET cover_image_url = optimize_hero_image_url(cover_image_url, 1920, 1080)
WHERE is_active = true 
  AND cover_image_url IS NOT NULL 
  AND cover_image_url != ''
  AND cover_image_url LIKE '%supabase.co%'
  AND (cover_image_url NOT LIKE '%width=%' OR cover_image_url NOT LIKE '%quality=%');

-- 5. Optimizar todos los logos existentes
UPDATE restaurants 
SET logo_url = optimize_logo_url(logo_url, 120)
WHERE is_active = true 
  AND logo_url IS NOT NULL 
  AND logo_url != ''
  AND logo_url LIKE '%supabase.co%'
  AND (logo_url NOT LIKE '%width=%' OR logo_url NOT LIKE '%quality=%');

-- 6. Mostrar estado de optimización
SELECT 
  'Hero Image Optimization Complete' as status,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as with_hero_images,
  COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=95%' THEN 1 END) as optimized_hero_images,
  COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) as with_logos,
  COUNT(CASE WHEN logo_url LIKE '%width=%' AND logo_url LIKE '%quality=95%' THEN 1 END) as optimized_logos
FROM restaurants 
WHERE is_active = true;

-- 7. Mostrar URLs optimizadas
SELECT 
  name,
  cover_image_url as hero_image_url,
  logo_url,
  CASE 
    WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=95%' THEN '✅ Optimized'
    WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN '⚠️ Needs optimization'
    ELSE '❌ No image'
  END as hero_status,
  CASE 
    WHEN logo_url LIKE '%width=%' AND logo_url LIKE '%quality=95%' THEN '✅ Optimized'
    WHEN logo_url IS NOT NULL AND logo_url != '' THEN '⚠️ Needs optimization'
    ELSE '❌ No logo'
  END as logo_status
FROM restaurants 
WHERE is_active = true
ORDER BY name;
