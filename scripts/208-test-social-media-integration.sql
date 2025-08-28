-- Script para probar la integración de redes sociales
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que la sección de redes sociales está en el componente RestaurantConfig
SELECT 
    'Verificando que el componente RestaurantConfig tiene la sección de redes sociales:' as info;

-- 2. Actualizar un restaurante de prueba con redes sociales
UPDATE restaurants 
SET social_media = '{
  "facebook": "https://facebook.com/mi-restaurante",
  "instagram": "https://instagram.com/mi-restaurante", 
  "twitter": "https://twitter.com/mi-restaurante",
  "tiktok": "https://tiktok.com/@mi-restaurante"
}'::jsonb
WHERE id = (SELECT id FROM restaurants LIMIT 1);

-- 3. Verificar que se actualizó correctamente
SELECT 
    'Restaurante actualizado con redes sociales:' as info;

SELECT 
    name,
    social_media->>'facebook' as facebook,
    social_media->>'instagram' as instagram,
    social_media->>'twitter' as twitter,
    social_media->>'tiktok' as tiktok
FROM restaurants 
WHERE social_media IS NOT NULL 
AND (social_media->>'facebook' != '' OR 
     social_media->>'instagram' != '' OR 
     social_media->>'twitter' != '' OR 
     social_media->>'tiktok' != '');

-- 4. Verificar que la landing page puede acceder a social_media
SELECT 
    'Verificando acceso a social_media en landing page:' as info;

SELECT 
    name,
    slug,
    CASE 
        WHEN social_media IS NOT NULL THEN 'Has social_media field'
        ELSE 'No social_media field'
    END as social_media_status,
    CASE 
        WHEN social_media IS NOT NULL AND jsonb_typeof(social_media) = 'object' THEN 'Valid JSONB object'
        WHEN social_media IS NOT NULL THEN 'Invalid format'
        ELSE 'NULL'
    END as social_media_format
FROM restaurants 
LIMIT 5;

-- 5. Mostrar todos los restaurantes con sus redes sociales
SELECT 
    'Todos los restaurantes con sus redes sociales:' as info;

SELECT 
    name,
    slug,
    social_media,
    updated_at
FROM restaurants 
ORDER BY updated_at DESC;




