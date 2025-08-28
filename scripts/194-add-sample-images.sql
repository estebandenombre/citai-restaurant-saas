-- Script para agregar imágenes de ejemplo a elementos del menú
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar elementos sin imágenes
SELECT 
  'Elementos sin imágenes:' as info;

SELECT 
  id,
  name,
  price,
  is_featured,
  is_available
FROM menu_items 
WHERE image_url IS NULL
ORDER BY created_at DESC;

-- 2. Agregar imágenes de ejemplo a elementos destacados
UPDATE menu_items 
SET image_url = CASE 
  WHEN LOWER(name) LIKE '%pizza%' THEN 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%burger%' OR LOWER(name) LIKE '%hamburger%' THEN 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%pasta%' OR LOWER(name) LIKE '%spaghetti%' THEN 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%salad%' OR LOWER(name) LIKE '%ensalada%' THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%steak%' OR LOWER(name) LIKE '%carne%' THEN 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%fish%' OR LOWER(name) LIKE '%pescado%' THEN 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%chicken%' OR LOWER(name) LIKE '%pollo%' THEN 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%dessert%' OR LOWER(name) LIKE '%postre%' OR LOWER(name) LIKE '%cake%' THEN 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%drink%' OR LOWER(name) LIKE '%bebida%' OR LOWER(name) LIKE '%cocktail%' THEN 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop'
  WHEN LOWER(name) LIKE '%soup%' OR LOWER(name) LIKE '%sopa%' THEN 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
END
WHERE image_url IS NULL 
  AND is_available = true
  AND (
    LOWER(name) LIKE '%pizza%' OR
    LOWER(name) LIKE '%burger%' OR LOWER(name) LIKE '%hamburger%' OR
    LOWER(name) LIKE '%pasta%' OR LOWER(name) LIKE '%spaghetti%' OR
    LOWER(name) LIKE '%salad%' OR LOWER(name) LIKE '%ensalada%' OR
    LOWER(name) LIKE '%steak%' OR LOWER(name) LIKE '%carne%' OR
    LOWER(name) LIKE '%fish%' OR LOWER(name) LIKE '%pescado%' OR
    LOWER(name) LIKE '%chicken%' OR LOWER(name) LIKE '%pollo%' OR
    LOWER(name) LIKE '%dessert%' OR LOWER(name) LIKE '%postre%' OR LOWER(name) LIKE '%cake%' OR
    LOWER(name) LIKE '%drink%' OR LOWER(name) LIKE '%bebida%' OR LOWER(name) LIKE '%cocktail%' OR
    LOWER(name) LIKE '%soup%' OR LOWER(name) LIKE '%sopa%'
  );

-- 3. Agregar imagen genérica a elementos restantes sin imágenes
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
WHERE image_url IS NULL 
  AND is_available = true;

-- 4. Verificar resultados
SELECT 
  'Resultados después de agregar imágenes:' as info;

SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as items_with_images,
  COUNT(CASE WHEN image_url IS NULL THEN 1 END) as items_without_images,
  ROUND(
    (COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as percentage_with_images
FROM menu_items;

-- 5. Mostrar algunos ejemplos
SELECT 
  'Ejemplos de elementos con imágenes:' as info;

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
LIMIT 10;




