-- Script para optimizar imágenes del hero en la base de datos
-- Ejecutar en Supabase SQL Editor

-- 1. Función para optimizar URLs de imágenes del hero
CREATE OR REPLACE FUNCTION optimize_hero_image_url(image_url TEXT, width INTEGER DEFAULT 1920, height INTEGER DEFAULT 1080)
RETURNS TEXT AS $$
BEGIN
  -- Si no hay URL, devolver null
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  -- Si es una imagen de Supabase, agregar parámetros de optimización
  IF image_url LIKE '%supabase.co%' AND image_url LIKE '%storage%' THEN
    -- Verificar si ya tiene parámetros de optimización
    IF image_url LIKE '%width=%' AND image_url LIKE '%quality=%' THEN
      RETURN image_url; -- Ya está optimizada
    END IF;
    
    -- Agregar parámetros de optimización para hero
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

-- 2. Función para optimizar URLs de logos
CREATE OR REPLACE FUNCTION optimize_logo_url(image_url TEXT, size INTEGER DEFAULT 120)
RETURNS TEXT AS $$
BEGIN
  -- Si no hay URL, devolver null
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  -- Si es una imagen de Supabase, agregar parámetros de optimización
  IF image_url LIKE '%supabase.co%' AND image_url LIKE '%storage%' THEN
    -- Verificar si ya tiene parámetros de optimización
    IF image_url LIKE '%width=%' AND image_url LIKE '%quality=%' THEN
      RETURN image_url; -- Ya está optimizada
    END IF;
    
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

-- 3. Vista para restaurantes con URLs optimizadas
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

-- 4. Función para actualizar URLs de imágenes existentes
CREATE OR REPLACE FUNCTION update_restaurant_image_urls()
RETURNS void AS $$
DECLARE
  restaurant_record RECORD;
BEGIN
  -- Actualizar URLs de imágenes del hero
  UPDATE restaurants 
  SET cover_image_url = optimize_hero_image_url(cover_image_url, 1920, 1080)
  WHERE cover_image_url IS NOT NULL 
    AND cover_image_url != ''
    AND cover_image_url LIKE '%supabase.co%'
    AND cover_image_url NOT LIKE '%width=%';
  
  -- Actualizar URLs de logos
  UPDATE restaurants 
  SET logo_url = optimize_logo_url(logo_url, 120)
  WHERE logo_url IS NOT NULL 
    AND logo_url != ''
    AND logo_url LIKE '%supabase.co%'
    AND logo_url NOT LIKE '%width=%';
    
  RAISE NOTICE 'Image URLs updated successfully';
END;
$$ LANGUAGE plpgsql;

-- 5. Función para verificar calidad de imágenes
CREATE OR REPLACE FUNCTION check_image_optimization_status()
RETURNS TABLE(
  restaurant_name TEXT,
  hero_image_optimized BOOLEAN,
  logo_optimized BOOLEAN,
  hero_url TEXT,
  logo_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.name,
    CASE 
      WHEN r.cover_image_url LIKE '%width=%' AND r.cover_image_url LIKE '%quality=%' THEN true
      ELSE false
    END as hero_image_optimized,
    CASE 
      WHEN r.logo_url LIKE '%width=%' AND r.logo_url LIKE '%quality=%' THEN true
      ELSE false
    END as logo_optimized,
    r.cover_image_url,
    r.logo_url
  FROM restaurants r
  WHERE r.is_active = true
  ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para generar URLs responsivas
CREATE OR REPLACE FUNCTION generate_responsive_hero_urls(image_url TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF image_url IS NULL OR image_url = '' THEN
    RETURN NULL;
  END IF;
  
  -- Generar URLs para diferentes tamaños de pantalla
  result := jsonb_build_object(
    'original', image_url,
    'mobile', optimize_hero_image_url(image_url, 400, 225),
    'tablet', optimize_hero_image_url(image_url, 800, 450),
    'desktop', optimize_hero_image_url(image_url, 1200, 675),
    'large', optimize_hero_image_url(image_url, 1920, 1080)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Vista para estadísticas de optimización
CREATE OR REPLACE VIEW image_optimization_stats AS
SELECT 
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as restaurants_with_hero,
  COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) as restaurants_with_logo,
  COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=%' THEN 1 END) as optimized_hero_images,
  COUNT(CASE WHEN logo_url LIKE '%width=%' AND logo_url LIKE '%quality=%' THEN 1 END) as optimized_logos,
  ROUND(
    (COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=%' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END), 0)) * 100, 
    2
  ) as hero_optimization_percentage,
  ROUND(
    (COUNT(CASE WHEN logo_url LIKE '%width=%' AND logo_url LIKE '%quality=%' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END), 0)) * 100, 
    2
  ) as logo_optimization_percentage
FROM restaurants
WHERE is_active = true;

-- 8. Función para limpiar URLs duplicadas
CREATE OR REPLACE FUNCTION cleanup_duplicate_image_params()
RETURNS void AS $$
BEGIN
  -- Limpiar parámetros duplicados en URLs de hero
  UPDATE restaurants 
  SET cover_image_url = regexp_replace(cover_image_url, '(\?|&)(width|height|quality|format|fit|gravity)=[^&]*', '', 'g')
  WHERE cover_image_url LIKE '%supabase.co%' 
    AND cover_image_url LIKE '%width=%';
    
  -- Limpiar parámetros duplicados en URLs de logos
  UPDATE restaurants 
  SET logo_url = regexp_replace(logo_url, '(\?|&)(width|height|quality|format|fit|gravity)=[^&]*', '', 'g')
  WHERE logo_url LIKE '%supabase.co%' 
    AND logo_url LIKE '%width=%';
    
  RAISE NOTICE 'Duplicate image parameters cleaned';
END;
$$ LANGUAGE plpgsql;

-- 9. Mensaje de confirmación
SELECT 
  'Hero image optimization functions created successfully!' as status,
  'Functions: optimize_hero_image_url, optimize_logo_url, update_restaurant_image_urls' as functions,
  'Views: restaurants_with_optimized_images, image_optimization_stats' as views;

-- 10. Mostrar estadísticas actuales
SELECT * FROM image_optimization_stats;
