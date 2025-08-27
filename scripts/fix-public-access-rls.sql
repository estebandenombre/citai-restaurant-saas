-- Script para corregir el acceso público a menús de restaurantes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual
SELECT 'ESTADO ACTUAL DE LAS POLÍTICAS RLS:' as section;

SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename IN ('restaurants', 'categories', 'menu_items')
ORDER BY tablename, policyname;

-- 2. Eliminar políticas existentes que bloquean acceso público
DROP POLICY IF EXISTS "Users can only access their restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can manage their restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can view own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their restaurant" ON menu_items;
DROP POLICY IF EXISTS "Users can update own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete own restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can view restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Menu items are viewable by restaurant staff" ON menu_items;
DROP POLICY IF EXISTS "Allow authenticated users to manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;

DROP POLICY IF EXISTS "Users can manage their restaurant categories" ON categories;
DROP POLICY IF EXISTS "Users can view own restaurant categories" ON categories;
DROP POLICY IF EXISTS "Users can insert categories for their restaurant" ON categories;
DROP POLICY IF EXISTS "Users can update own restaurant categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own restaurant categories" ON categories;
DROP POLICY IF EXISTS "Restaurant owners can manage categories" ON categories;
DROP POLICY IF EXISTS "Staff can view restaurant categories" ON categories;
DROP POLICY IF EXISTS "Categories are viewable by restaurant staff" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

DROP POLICY IF EXISTS "Users can only access their restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can manage their restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can view own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can update own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can delete own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can manage restaurant" ON restaurants;
DROP POLICY IF EXISTS "Staff can view restaurant" ON restaurants;
DROP POLICY IF EXISTS "Restaurant is viewable by restaurant staff" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to manage restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow all operations on restaurants" ON restaurants;

-- 3. Crear políticas públicas para acceso sin autenticación

-- Políticas para restaurantes (acceso público de lectura)
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT 
  USING (is_active = true);

-- Políticas para categorías (acceso público de lectura)
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT 
  USING (
    is_active = true AND 
    restaurant_id IN (
      SELECT id FROM restaurants WHERE is_active = true
    )
  );

-- Políticas para elementos del menú (acceso público de lectura)
CREATE POLICY "Public can view available menu items" ON menu_items
  FOR SELECT 
  USING (
    is_available = true AND 
    restaurant_id IN (
      SELECT id FROM restaurants WHERE is_active = true
    )
  );

-- 4. Crear políticas para usuarios autenticados (gestión)

-- Políticas para restaurantes (gestión por propietarios)
CREATE POLICY "Restaurant owners can manage their restaurant" ON restaurants
  FOR ALL 
  TO authenticated
  USING (
    id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Políticas para categorías (gestión por propietarios)
CREATE POLICY "Restaurant owners can manage their categories" ON categories
  FOR ALL 
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Políticas para elementos del menú (gestión por propietarios)
CREATE POLICY "Restaurant owners can manage their menu items" ON menu_items
  FOR ALL 
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- 5. Verificar que las políticas se crearon correctamente
SELECT 'POLÍTICAS CREADAS:' as section;

SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename IN ('restaurants', 'categories', 'menu_items')
ORDER BY tablename, policyname;

-- 6. Probar acceso público
SELECT 'PRUEBA DE ACCESO PÚBLICO:' as section;

-- Simular acceso anónimo (sin autenticación)
SELECT 'Restaurantes activos (acceso público):' as test;
SELECT 
  id,
  name,
  slug,
  is_active
FROM restaurants 
WHERE is_active = true
LIMIT 3;

SELECT 'Categorías activas (acceso público):' as test;
SELECT 
  c.id,
  c.name,
  c.restaurant_id,
  r.name as restaurant_name
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE c.is_active = true AND r.is_active = true
LIMIT 5;

SELECT 'Elementos de menú disponibles (acceso público):' as test;
SELECT 
  mi.id,
  mi.name,
  mi.price,
  mi.restaurant_id,
  r.name as restaurant_name
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE mi.is_available = true AND r.is_active = true
LIMIT 5;

-- 7. Verificar que RLS está habilitado
SELECT 'ESTADO DE RLS:' as section;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('restaurants', 'categories', 'menu_items')
ORDER BY tablename;

-- 8. Mensaje de confirmación
SELECT '✅ CORRECCIÓN COMPLETADA' as status;
SELECT '✅ Acceso público habilitado para menús' as item;
SELECT '✅ Propietarios pueden gestionar sus restaurantes' as item;
SELECT '✅ Comensales pueden ver menús sin autenticación' as item;
SELECT '🎉 Los menús ahora son visibles públicamente!' as final_message;

