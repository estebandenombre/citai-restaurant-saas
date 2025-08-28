-- Script de diagnóstico para problemas de imágenes del hero
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si las funciones de optimización existen
SELECT 
  routine_name,
  routine_type,
  routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_name IN (
  'optimize_hero_image_url',
  'optimize_logo_url',
  'update_restaurant_image_urls',
  'check_image_optimization_status'
)
AND routine_schema = 'public';

-- 2. Verificar configuración del bucket de imágenes
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'images';

-- 3. Verificar URLs de imágenes actuales
SELECT 
  id,
  name,
  cover_image_url,
  CASE 
    WHEN cover_image_url LIKE '%supabase.co%' THEN 'Supabase URL'
    WHEN cover_image_url LIKE '%http%' THEN 'External URL'
    ELSE 'No URL'
  END as url_type,
  CASE 
    WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=%' THEN 'Optimized'
    ELSE 'Not Optimized'
  END as optimization_status,
  LENGTH(cover_image_url) as url_length
FROM restaurants 
WHERE is_active = true 
  AND cover_image_url IS NOT NULL 
  AND cover_image_url != ''
ORDER BY name;

-- 4. Probar función de optimización con URLs de ejemplo
SELECT 
  'Test optimize_hero_image_url function' as test_name,
  optimize_hero_image_url('https://example.supabase.co/storage/v1/object/public/images/hero-images/test.jpg') as optimized_url;

-- 5. Verificar si hay imágenes sin optimizar
SELECT 
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as with_hero_images,
  COUNT(CASE WHEN cover_image_url LIKE '%supabase.co%' THEN 1 END) as supabase_images,
  COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=%' THEN 1 END) as optimized_images,
  COUNT(CASE WHEN cover_image_url LIKE '%supabase.co%' AND (cover_image_url NOT LIKE '%width=%' OR cover_image_url NOT LIKE '%quality=%') THEN 1 END) as unoptimized_supabase_images
FROM restaurants 
WHERE is_active = true;

-- 6. Mostrar restaurantes que necesitan optimización
SELECT 
  id,
  name,
  cover_image_url,
  'Needs optimization' as status
FROM restaurants 
WHERE is_active = true 
  AND cover_image_url LIKE '%supabase.co%'
  AND (cover_image_url NOT LIKE '%width=%' OR cover_image_url NOT LIKE '%quality=%')
ORDER BY name;

-- 7. Verificar políticas RLS del bucket
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- 8. Función para forzar optimización de todas las imágenes
CREATE OR REPLACE FUNCTION force_optimize_all_hero_images()
RETURNS TABLE(
  restaurant_id UUID,
  restaurant_name TEXT,
  original_url TEXT,
  optimized_url TEXT,
  status TEXT
) AS $$
DECLARE
  restaurant_record RECORD;
BEGIN
  -- Actualizar todas las URLs de hero que no estén optimizadas
  UPDATE restaurants 
  SET cover_image_url = optimize_hero_image_url(cover_image_url, 1920, 1080)
  WHERE is_active = true 
    AND cover_image_url LIKE '%supabase.co%'
    AND (cover_image_url NOT LIKE '%width=%' OR cover_image_url NOT LIKE '%quality=%');
    
  -- Devolver resultados
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.cover_image_url as original_url,
    optimize_hero_image_url(r.cover_image_url, 1920, 1080) as optimized_url,
    CASE 
      WHEN r.cover_image_url LIKE '%width=%' AND r.cover_image_url LIKE '%quality=%' THEN 'Optimized'
      ELSE 'Needs optimization'
    END as status
  FROM restaurants r
  WHERE r.is_active = true 
    AND r.cover_image_url IS NOT NULL 
    AND r.cover_image_url != ''
  ORDER BY r.name;
    
  RAISE NOTICE 'Hero image optimization completed';
END;
$$ LANGUAGE plpgsql;

-- 9. Función para verificar calidad de imagen específica
CREATE OR REPLACE FUNCTION check_specific_image_quality(image_url TEXT)
RETURNS TABLE(
  url TEXT,
  is_supabase BOOLEAN,
  has_optimization_params BOOLEAN,
  width_param TEXT,
  quality_param TEXT,
  format_param TEXT,
  optimization_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    image_url as url,
    image_url LIKE '%supabase.co%' as is_supabase,
    (image_url LIKE '%width=%' AND image_url LIKE '%quality=%') as has_optimization_params,
    CASE 
      WHEN image_url LIKE '%width=%' THEN 
        substring(image_url from 'width=([^&]+)')
      ELSE 'Not found'
    END as width_param,
    CASE 
      WHEN image_url LIKE '%quality=%' THEN 
        substring(image_url from 'quality=([^&]+)')
      ELSE 'Not found'
    END as quality_param,
    CASE 
      WHEN image_url LIKE '%format=%' THEN 
        substring(image_url from 'format=([^&]+)')
      ELSE 'Not found'
    END as format_param,
    CASE 
      WHEN image_url LIKE '%supabase.co%' THEN 10
      ELSE 0
    END +
    CASE 
      WHEN image_url LIKE '%width=%' THEN 20
      ELSE 0
    END +
    CASE 
      WHEN image_url LIKE '%quality=%' THEN 20
      ELSE 0
    END +
    CASE 
      WHEN image_url LIKE '%format=webp%' THEN 20
      ELSE 0
    END +
    CASE 
      WHEN image_url LIKE '%fit=cover%' THEN 15
      ELSE 0
    END +
    CASE 
      WHEN image_url LIKE '%gravity=center%' THEN 15
      ELSE 0
    END as optimization_score;
END;
$$ LANGUAGE plpgsql;

-- 10. Mostrar diagnóstico completo
SELECT 
  '=== HERO IMAGE DIAGNOSTIC REPORT ===' as report_section;

-- Verificar funciones
SELECT 
  'Functions Status' as section,
  routine_name,
  CASE 
    WHEN routine_definition IS NOT NULL THEN '✅ Installed'
    ELSE '❌ Missing'
  END as status
FROM information_schema.routines 
WHERE routine_name IN (
  'optimize_hero_image_url',
  'optimize_logo_url',
  'update_restaurant_image_urls',
  'check_image_optimization_status'
)
AND routine_schema = 'public';

-- Verificar bucket
SELECT 
  'Storage Bucket Status' as section,
  CASE 
    WHEN id IS NOT NULL THEN '✅ Bucket exists'
    ELSE '❌ Bucket missing'
  END as bucket_status,
  CASE 
    WHEN public = true THEN '✅ Public access enabled'
    ELSE '❌ Public access disabled'
  END as public_status,
  file_size_limit as size_limit_bytes
FROM storage.buckets 
WHERE id = 'images';

-- Verificar imágenes
SELECT 
  'Image Optimization Status' as section,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as with_hero_images,
  COUNT(CASE WHEN cover_image_url LIKE '%supabase.co%' THEN 1 END) as supabase_images,
  COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=%' THEN 1 END) as optimized_images,
  ROUND(
    (COUNT(CASE WHEN cover_image_url LIKE '%width=%' AND cover_image_url LIKE '%quality=%' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END), 0)) * 100, 
    2
  ) as optimization_percentage
FROM restaurants 
WHERE is_active = true;
