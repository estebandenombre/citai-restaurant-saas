-- Script temporal muy permisivo para menu_items
-- SOLO USAR PARA DIAGNÓSTICO - NO PARA PRODUCCIÓN
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can view own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their restaurant" ON menu_items;
DROP POLICY IF EXISTS "Users can update own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can view restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Menu items are viewable by restaurant staff" ON menu_items;
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;

-- 2. Crear política MUY PERMISIVA (solo para diagnóstico)
CREATE POLICY "Allow all operations on menu_items" ON menu_items
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Verificar que la política se creó
SELECT 
  'Política temporal creada:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 4. Probar inserción manual
SELECT 
  'Probando inserción con política permisiva:' as info;

-- Obtener un restaurante existente
WITH test_restaurant AS (
  SELECT id as restaurant_id
  FROM restaurants 
  WHERE is_active = true
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
    'Test Menu Item Permissive',
    'Test description for permissive policy',
    15.99,
    true,
    false,
    0
  FROM test_restaurant tr
  RETURNING id, name, restaurant_id, price
)
SELECT 
  'Elemento permisivo creado:' as info,
  id,
  name,
  restaurant_id,
  price
FROM test_insert;

-- 5. Verificar que la inserción funcionó
SELECT 
  'Verificación de inserción permisiva:' as info;

SELECT 
  id,
  name,
  restaurant_id,
  price,
  is_available,
  created_at
FROM menu_items 
WHERE name = 'Test Menu Item Permissive'
ORDER BY created_at DESC
LIMIT 1;

-- 6. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM menu_items 
WHERE name = 'Test Menu Item Permissive';

-- IMPORTANTE: Después de probar, ejecutar el script 186-fix-menu-items-rls.sql
-- para restaurar las políticas de seguridad apropiadas




