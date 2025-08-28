-- Script para arreglar las políticas RLS de menu_items
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar políticas actuales
SELECT 
  'Políticas actuales de menu_items:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 2. Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their restaurant" ON menu_items;
DROP POLICY IF EXISTS "Users can update own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can view restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Menu items are viewable by restaurant staff" ON menu_items;

-- 3. Crear políticas RLS simplificadas y funcionales
-- Política para permitir lectura de elementos de menú del restaurante del usuario
CREATE POLICY "Users can view own restaurant menu items" ON menu_items
FOR SELECT USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Política para permitir inserción de elementos de menú en el restaurante del usuario
CREATE POLICY "Users can insert menu items for their restaurant" ON menu_items
FOR INSERT WITH CHECK (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Política para permitir actualización de elementos de menú del restaurante del usuario
CREATE POLICY "Users can update own restaurant menu items" ON menu_items
FOR UPDATE USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Política para permitir eliminación de elementos de menú del restaurante del usuario
CREATE POLICY "Users can delete own restaurant menu items" ON menu_items
FOR DELETE USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
  'Políticas después de la corrección:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 5. Verificar que RLS está habilitado
SELECT 
  'Estado de RLS:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'menu_items';

-- 6. Probar acceso básico
SELECT 
  'Prueba de acceso básico:' as info;

SELECT 
  COUNT(*) as total_menu_items
FROM menu_items;

-- 7. Probar inserción manual (simular el formulario)
SELECT 
  'Probando inserción manual:' as info;

-- Obtener un restaurante existente
WITH test_restaurant AS (
  SELECT restaurant_id 
  FROM users 
  WHERE id = auth.uid()
  LIMIT 1
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
    tr.restaurant_id,
    'Test Menu Item RLS',
    'Test description for RLS',
    12.99,
    true,
    false,
    0
  FROM test_restaurant tr
  RETURNING id, name, restaurant_id, price
)
SELECT 
  'Elemento RLS creado:' as info,
  id,
  name,
  restaurant_id,
  price
FROM test_insert;

-- 8. Verificar que la inserción funcionó
SELECT 
  'Verificación de inserción RLS:' as info;

SELECT 
  id,
  name,
  restaurant_id,
  price,
  is_available,
  created_at
FROM menu_items 
WHERE name = 'Test Menu Item RLS'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM menu_items 
WHERE name = 'Test Menu Item RLS';




