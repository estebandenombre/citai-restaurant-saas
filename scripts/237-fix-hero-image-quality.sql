-- Script de solución rápida para optimizar imágenes del hero
-- Ejecutar en Supabase SQL Editor para solucionar problemas de calidad

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

-- 2. Actualizar configuración del bucket para mejor calidad
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB para imágenes de alta calidad
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
WHERE id = 'images';

-- 3. Función para optimizar todas las imágenes del hero de una vez
CREATE OR REPLACE FUNCTION fix_all_hero_images()
RETURNS TABLE(
  restaurant_id UUID,
  restaurant_name TEXT,
  before_url TEXT,
  after_url TEXT,
  status TEXT
) AS $$
DECLARE
  restaurant_record RECORD;
  optimized_url TEXT;
BEGIN
  -- Procesar cada restaurante
  FOR restaurant_record IN 
    SELECT id, name, cover_image_url 
    FROM restaurants 
    WHERE is_active = true 
      AND cover_image_url IS NOT NULL 
      AND cover_image_url != ''
  LOOP
    -- Optimizar URL
    optimized_url := optimize_hero_image_url(restaurant_record.cover_image_url, 1920, 1080);
    
    -- Actualizar en la base de datos
    UPDATE restaurants 
    SET cover_image_url = optimized_url
    WHERE id = restaurant_record.id;
    
    -- Agregar a resultados
    restaurant_id := restaurant_record.id;
    restaurant_name := restaurant_record.name;
    before_url := restaurant_record.cover_image_url;
    after_url := optimized_url;
    status := 'Optimized';
    
    RETURN NEXT;
  END LOOP;
  
  RAISE NOTICE 'All hero images have been optimized for maximum quality';
END;
$$ LANGUAGE plpgsql;

-- 4. Función para verificar y mostrar el estado actual
CREATE OR REPLACE FUNCTION show_hero_image_status()
RETURNS TABLE(
  restaurant_name TEXT,
  current_url TEXT,
  is_optimized BOOLEAN,
  quality_score INTEGER,
  recommendations TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.name,
    r.cover_image_url,
    (r.cover_image_url LIKE '%width=%' AND r.cover_image_url LIKE '%quality=%') as is_optimized,
    CASE 
      WHEN r.cover_image_url LIKE '%supabase.co%' THEN 10
      ELSE 0
    END +
    CASE 
      WHEN r.cover_image_url LIKE '%width=%' THEN 20
      ELSE 0
    END +
    CASE 
      WHEN r.cover_image_url LIKE '%quality=95%' THEN 25
      WHEN r.cover_image_url LIKE '%quality=%' THEN 15
      ELSE 0
    END +
    CASE 
      WHEN r.cover_image_url LIKE '%format=webp%' THEN 20
      ELSE 0
    END +
    CASE 
      WHEN r.cover_image_url LIKE '%fit=cover%' THEN 15
      ELSE 0
    END +
    CASE 
      WHEN r.cover_image_url LIKE '%gravity=center%' THEN 10
      ELSE 0
    END as quality_score,
    CASE 
      WHEN r.cover_image_url IS NULL OR r.cover_image_url = '' THEN 'No hero image set'
      WHEN r.cover_image_url NOT LIKE '%supabase.co%' THEN 'External URL - consider uploading to Supabase'
      WHEN r.cover_image_url NOT LIKE '%width=%' OR r.cover_image_url NOT LIKE '%quality=%' THEN 'Needs optimization'
      WHEN r.cover_image_url NOT LIKE '%quality=95%' THEN 'Quality can be improved to 95%'
      WHEN r.cover_image_url NOT LIKE '%format=webp%' THEN 'Format can be improved to WebP'
      ELSE 'Optimized for maximum quality'
    END as recommendations
  FROM restaurants r
  WHERE r.is_active = true
  ORDER BY quality_score DESC, r.name;
END;
$$ LANGUAGE plpgsql;

-- 5. Ejecutar optimización inmediata
SELECT 'Starting hero image optimization...' as status;

-- Optimizar todas las imágenes
SELECT * FROM fix_all_hero_images();

-- 6. Mostrar estado después de la optimización
SELECT 'Hero image optimization completed. Current status:' as status;

SELECT * FROM show_hero_image_status();

-- 7. Función para optimizar una imagen específica por ID de restaurante
CREATE OR REPLACE FUNCTION optimize_specific_hero_image(restaurant_uuid UUID)
RETURNS TABLE(
  restaurant_name TEXT,
  original_url TEXT,
  optimized_url TEXT,
  status TEXT
) AS $$
DECLARE
  restaurant_record RECORD;
  optimized_url TEXT;
BEGIN
  -- Obtener información del restaurante
  SELECT name, cover_image_url INTO restaurant_record
  FROM restaurants 
  WHERE id = restaurant_uuid;
  
  IF restaurant_record.cover_image_url IS NULL OR restaurant_record.cover_image_url = '' THEN
    RETURN QUERY SELECT 
      restaurant_record.name,
      'No image'::TEXT,
      'No image'::TEXT,
      'No hero image to optimize'::TEXT;
    RETURN;
  END IF;
  
  -- Optimizar URL
  optimized_url := optimize_hero_image_url(restaurant_record.cover_image_url, 1920, 1080);
  
  -- Actualizar en la base de datos
  UPDATE restaurants 
  SET cover_image_url = optimized_url
  WHERE id = restaurant_uuid;
  
  -- Devolver resultados
  RETURN QUERY SELECT 
    restaurant_record.name,
    restaurant_record.cover_image_url,
    optimized_url,
    'Optimized successfully'::TEXT;
    
  RAISE NOTICE 'Hero image optimized for restaurant: %', restaurant_record.name;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para limpiar URLs duplicadas o malformadas
CREATE OR REPLACE FUNCTION cleanup_hero_image_urls()
RETURNS void AS $$
BEGIN
  -- Limpiar parámetros duplicados
  UPDATE restaurants 
  SET cover_image_url = regexp_replace(cover_image_url, '(\?|&)(width|height|quality|format|fit|gravity)=[^&]*', '', 'g')
  WHERE cover_image_url LIKE '%supabase.co%' 
    AND cover_image_url LIKE '%width=%';
    
  -- Re-optimizar todas las URLs limpias
  UPDATE restaurants 
  SET cover_image_url = optimize_hero_image_url(cover_image_url, 1920, 1080)
  WHERE is_active = true 
    AND cover_image_url LIKE '%supabase.co%'
    AND (cover_image_url NOT LIKE '%width=%' OR cover_image_url NOT LIKE '%quality=%');
    
  RAISE NOTICE 'Hero image URLs cleaned and re-optimized';
END;
$$ LANGUAGE plpgsql;

-- 9. Mostrar resumen final
SELECT 
  '=== HERO IMAGE OPTIMIZATION COMPLETE ===' as summary,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as with_hero_images,
  COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=95%' THEN 1 END) as fully_optimized,
  ROUND(
    (COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=95%' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END), 0)) * 100, 
    2
  ) as optimization_percentage
FROM restaurants 
WHERE is_active = true;

-- 10. Instrucciones para el usuario
SELECT 
  'Next steps:' as instruction,
  '1. Refresh your restaurant page to see the improved image quality' as step1,
  '2. If images still look bad, try uploading a new high-resolution image' as step2,
  '3. Check the browser console for any image loading errors' as step3,
  '4. Verify that the image URLs now include optimization parameters' as step4;
