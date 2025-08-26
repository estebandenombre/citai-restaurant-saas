-- Script rápido para arreglar políticas RLS de menu_items
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their restaurant" ON menu_items;
DROP POLICY IF EXISTS "Users can update own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can view restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Menu items are viewable by restaurant staff" ON menu_items;
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;

-- 2. Crear política simple y permisiva
CREATE POLICY "Allow authenticated users to manage menu items" ON menu_items
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Verificar que se creó
SELECT 
  'Política creada:' as info;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 4. Probar inserción
SELECT 
  'Probando inserción:' as info;

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
    'Test Quick Fix Item',
    'Test description for quick fix',
    11.99,
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

-- 5. Verificar
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
WHERE name = 'Test Quick Fix Item'
ORDER BY created_at DESC
LIMIT 1;

-- 6. Limpiar
SELECT 
  'Limpiando:' as info;

DELETE FROM menu_items 
WHERE name = 'Test Quick Fix Item';
