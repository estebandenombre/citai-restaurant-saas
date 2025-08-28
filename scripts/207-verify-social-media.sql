-- Script para verificar los datos de redes sociales
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura del campo social_media
SELECT 
    'Estructura del campo social_media:' as info;

SELECT 
    name,
    social_media,
    CASE 
        WHEN social_media IS NULL THEN 'NULL'
        WHEN jsonb_typeof(social_media) = 'object' THEN 'JSONB Object'
        ELSE jsonb_typeof(social_media)
    END as social_media_type
FROM restaurants 
LIMIT 5;

-- 2. Verificar valores específicos de redes sociales
SELECT 
    'Valores de redes sociales:' as info;

SELECT 
    name,
    social_media->>'facebook' as facebook,
    social_media->>'instagram' as instagram,
    social_media->>'twitter' as twitter,
    social_media->>'tiktok' as tiktok,
    CASE 
        WHEN social_media->>'facebook' IS NOT NULL OR 
             social_media->>'instagram' IS NOT NULL OR 
             social_media->>'twitter' IS NOT NULL OR 
             social_media->>'tiktok' IS NOT NULL 
        THEN 'Has Social Media'
        ELSE 'No Social Media'
    END as social_media_status
FROM restaurants 
WHERE social_media IS NOT NULL;

-- 3. Mostrar restaurantes con redes sociales configuradas
SELECT 
    'Restaurantes con redes sociales:' as info;

SELECT 
    name,
    social_media->>'facebook' as facebook,
    social_media->>'instagram' as instagram,
    social_media->>'twitter' as twitter,
    social_media->>'tiktok' as tiktok,
    updated_at
FROM restaurants 
WHERE (social_media->>'facebook' IS NOT NULL AND social_media->>'facebook' != '') OR
      (social_media->>'instagram' IS NOT NULL AND social_media->>'instagram' != '') OR
      (social_media->>'twitter' IS NOT NULL AND social_media->>'twitter' != '') OR
      (social_media->>'tiktok' IS NOT NULL AND social_media->>'tiktok' != '')
ORDER BY updated_at DESC;

-- 4. Verificar valores por defecto
SELECT 
    'Verificando valores por defecto:' as info;

SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN social_media->>'facebook' = '' THEN 1 END) as empty_facebook,
    COUNT(CASE WHEN social_media->>'instagram' = '' THEN 1 END) as empty_instagram,
    COUNT(CASE WHEN social_media->>'twitter' = '' THEN 1 END) as empty_twitter,
    COUNT(CASE WHEN social_media->>'tiktok' = '' THEN 1 END) as empty_tiktok,
    COUNT(CASE WHEN social_media IS NULL THEN 1 END) as null_social_media
FROM restaurants;

-- 5. Actualizar valores por defecto si es necesario
UPDATE restaurants 
SET social_media = '{"facebook": "", "instagram": "", "twitter": "", "tiktok": ""}'::jsonb
WHERE social_media IS NULL;

-- 6. Verificar después de la actualización
SELECT 
    'Después de actualizar valores por defecto:' as info;

SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN social_media->>'facebook' = '' THEN 1 END) as empty_facebook,
    COUNT(CASE WHEN social_media->>'instagram' = '' THEN 1 END) as empty_instagram,
    COUNT(CASE WHEN social_media->>'twitter' = '' THEN 1 END) as empty_twitter,
    COUNT(CASE WHEN social_media->>'tiktok' = '' THEN 1 END) as empty_tiktok
FROM restaurants;




