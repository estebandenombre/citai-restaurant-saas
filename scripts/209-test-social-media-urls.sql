-- Script para probar la funcionalidad de URLs de redes sociales
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar un restaurante con handles de redes sociales (no URLs completas)
UPDATE restaurants 
SET social_media = '{
  "facebook": "urbanbistro",
  "instagram": "@urbanbistro", 
  "twitter": "@tablydigital",
  "tiktok": "@urbanbistro"
}'::jsonb
WHERE id = (SELECT id FROM restaurants LIMIT 1);

-- 2. Verificar que se actualizó correctamente
SELECT 
    'Restaurante actualizado con handles de redes sociales:' as info;

SELECT 
    name,
    social_media->>'facebook' as facebook_handle,
    social_media->>'instagram' as instagram_handle,
    social_media->>'twitter' as twitter_handle,
    social_media->>'tiktok' as tiktok_handle
FROM restaurants 
WHERE social_media IS NOT NULL 
AND (social_media->>'facebook' != '' OR 
     social_media->>'instagram' != '' OR 
     social_media->>'twitter' != '' OR 
     social_media->>'tiktok' != '');

-- 3. Probar con URLs completas también
UPDATE restaurants 
SET social_media = '{
  "facebook": "https://www.facebook.com/urbanbistro",
  "instagram": "https://www.instagram.com/urbanbistro", 
  "twitter": "https://x.com/tablydigital",
  "tiktok": "https://www.tiktok.com/@urbanbistro"
}'::jsonb
WHERE id = (SELECT id FROM restaurants LIMIT 1 OFFSET 1);

-- 4. Verificar ambos casos
SELECT 
    'Verificando ambos casos (handles y URLs completas):' as info;

SELECT 
    name,
    social_media->>'facebook' as facebook,
    social_media->>'instagram' as instagram,
    social_media->>'twitter' as twitter,
    social_media->>'tiktok' as tiktok,
    CASE 
        WHEN social_media->>'facebook' LIKE 'http%' THEN 'Full URL'
        WHEN social_media->>'facebook' != '' THEN 'Handle'
        ELSE 'Empty'
    END as facebook_type,
    CASE 
        WHEN social_media->>'instagram' LIKE 'http%' THEN 'Full URL'
        WHEN social_media->>'instagram' != '' THEN 'Handle'
        ELSE 'Empty'
    END as instagram_type,
    CASE 
        WHEN social_media->>'twitter' LIKE 'http%' THEN 'Full URL'
        WHEN social_media->>'twitter' != '' THEN 'Handle'
        ELSE 'Empty'
    END as twitter_type,
    CASE 
        WHEN social_media->>'tiktok' LIKE 'http%' THEN 'Full URL'
        WHEN social_media->>'tiktok' != '' THEN 'Handle'
        ELSE 'Empty'
    END as tiktok_type
FROM restaurants 
WHERE social_media IS NOT NULL 
AND (social_media->>'facebook' != '' OR 
     social_media->>'instagram' != '' OR 
     social_media->>'twitter' != '' OR 
     social_media->>'tiktok' != '')
ORDER BY updated_at DESC;




