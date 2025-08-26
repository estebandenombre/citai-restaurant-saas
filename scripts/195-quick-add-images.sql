-- Script rápido para agregar imágenes de ejemplo
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estado actual
SELECT 
  'Estado actual:' as info,
  COUNT(*) as total_items,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as with_images,
  COUNT(CASE WHEN image_url IS NULL THEN 1 END) as without_images
FROM menu_items;

-- 2. Agregar imagen de ejemplo para Bruschetta
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=400&h=300&fit=crop'
WHERE LOWER(name) LIKE '%bruschetta%' 
  AND image_url IS NULL;

-- 3. Agregar imágenes para otros elementos comunes
UPDATE menu_items 
SET image_url = CASE 
  WHEN LOWER(name) LIKE '%pizza%' THEN 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%burger%' THEN 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%pasta%' THEN 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%salad%' THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%steak%' THEN 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%fish%' THEN 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%chicken%' THEN 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%dessert%' THEN 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%drink%' THEN 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%soup%' THEN 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
END
WHERE image_url IS NULL 
  AND is_available = true;

-- 4. Verificar resultados
SELECT 
  'Después de agregar imágenes:' as info,
  COUNT(*) as total_items,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as with_images,
  COUNT(CASE WHEN image_url IS NULL THEN 1 END) as without_images
FROM menu_items;

-- 5. Mostrar elementos con imágenes
SELECT 
  'Elementos con imágenes:' as info;

SELECT 
  id,
  name,
  price,
  image_url,
  is_featured,
  is_available
FROM menu_items 
WHERE image_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;


