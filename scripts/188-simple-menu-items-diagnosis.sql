-- Script simple para diagnosticar problemas con menu_items
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura básica
SELECT 
  'Estructura básica de menu_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT 
  'Políticas RLS actuales:' as info;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 3. Verificar si RLS está habilitado
SELECT 
  'RLS habilitado:' as info,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'menu_items';

-- 4. Verificar datos existentes
SELECT 
  'Datos existentes:' as info,
  COUNT(*) as total_items
FROM menu_items;

-- 5. Verificar restaurantes del usuario actual
SELECT 
  'Restaurante del usuario actual:' as info;

SELECT 
  u.id as user_id,
  u.email,
  u.restaurant_id,
  r.name as restaurant_name,
  r.is_active as restaurant_active
FROM users u
LEFT JOIN restaurants r ON r.id = u.restaurant_id
WHERE u.id = auth.uid();

-- 6. Verificar categorías del restaurante del usuario
SELECT 
  'Categorías del restaurante:' as info;

SELECT 
  c.id,
  c.name,
  c.restaurant_id,
  c.is_active
FROM categories c
WHERE c.restaurant_id IN (
  SELECT restaurant_id 
  FROM users 
  WHERE id = auth.uid()
)
AND c.is_active = true;

-- 7. Probar inserción simple
SELECT 
  'Probando inserción simple:' as info;

-- Obtener restaurant_id del usuario actual
WITH user_restaurant AS (
  SELECT restaurant_id 
  FROM users 
  WHERE id = auth.uid()
),
test_insert AS (
  INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    is_available,
    is_featured,
    display_order
  )
  SELECT 
    ur.restaurant_id,
    'Test Simple Item',
    'Test description',
    10.99,
    true,
    false,
    0
  FROM user_restaurant ur
  RETURNING id, name, restaurant_id, price
)
SELECT 
  'Elemento creado:' as info,
  id,
  name,
  restaurant_id,
  price
FROM test_insert;

-- 8. Verificar inserción
SELECT 
  'Verificación:' as info;

SELECT 
  id,
  name,
  restaurant_id,
  price,
  is_available,
  created_at
FROM menu_items 
WHERE name = 'Test Simple Item'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Limpiar
SELECT 
  'Limpiando:' as info;

DELETE FROM menu_items 
WHERE name = 'Test Simple Item';



