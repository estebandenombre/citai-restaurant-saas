-- Script para diagnosticar problemas con menu_items
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla menu_items
SELECT 
  'Estructura de menu_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;

-- 2. Verificar restricciones de la tabla
SELECT 
  'Restricciones de menu_items:' as info;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'menu_items'
ORDER BY tc.constraint_type, kcu.column_name;

-- 3. Verificar políticas RLS de menu_items
SELECT 
  'Políticas RLS de menu_items:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 4. Verificar si RLS está habilitado
SELECT 
  'Estado de RLS en menu_items:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'menu_items';

-- 5. Verificar datos existentes
SELECT 
  'Datos existentes en menu_items:' as info;

SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_available = true THEN 1 END) as available_items,
  COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_items,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as items_with_images
FROM menu_items;

-- 6. Verificar restaurantes existentes
SELECT 
  'Restaurantes disponibles:' as info;

SELECT 
  id,
  name,
  slug,
  is_active
FROM restaurants
WHERE is_active = true
LIMIT 5;

-- 7. Verificar categorías existentes
SELECT 
  'Categorías disponibles:' as info;

SELECT 
  id,
  name,
  restaurant_id,
  is_active
FROM categories
WHERE is_active = true
LIMIT 5;

-- 8. Probar inserción manual de un elemento de menú
SELECT 
  'Probando inserción manual:' as info;

-- Primero obtener un restaurante y categoría existentes
WITH test_data AS (
  SELECT 
    r.id as restaurant_id,
    c.id as category_id
  FROM restaurants r
  LEFT JOIN categories c ON c.restaurant_id = r.id AND c.is_active = true
  WHERE r.is_active = true
  LIMIT 1
),
test_insert AS (
  INSERT INTO menu_items (
    restaurant_id,
    category_id,
    name,
    description,
    price,
    is_available,
    is_featured,
    display_order,
    image_url
  )
  SELECT 
    td.restaurant_id,
    td.category_id,
    'Test Menu Item',
    'Test description',
    9.99,
    true,
    false,
    0,
    null
  FROM test_data td
  RETURNING id, name, restaurant_id, category_id
)
SELECT 
  'Elemento de prueba creado:' as info,
  id,
  name,
  restaurant_id,
  category_id
FROM test_insert;

-- 9. Verificar que la inserción funcionó
SELECT 
  'Verificación de inserción:' as info;

SELECT 
  id,
  name,
  restaurant_id,
  category_id,
  price,
  is_available,
  created_at
FROM menu_items 
WHERE name = 'Test Menu Item'
ORDER BY created_at DESC
LIMIT 1;

-- 10. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM menu_items 
WHERE name = 'Test Menu Item';
