-- Script para arreglar las políticas RLS de la tabla order_items
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual de las políticas
SELECT 
  'Estado actual de políticas RLS en order_items:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'order_items';

-- 2. Eliminar todas las políticas RLS existentes de order_items
DROP POLICY IF EXISTS "Users can view own restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items for their restaurant" ON order_items;
DROP POLICY IF EXISTS "Users can update own restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Users can delete own restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can manage order items" ON order_items;
DROP POLICY IF EXISTS "Staff can view restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Order items are viewable by restaurant staff" ON order_items;

-- 3. Crear políticas RLS simples y funcionales

-- Política para permitir inserción de order_items (necesario para el formulario público)
CREATE POLICY "Public can create order items" ON order_items
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir lectura de order_items por el restaurante correspondiente
CREATE POLICY "Restaurant staff can view order items" ON order_items
  FOR SELECT 
  USING (
    order_id IN (
      SELECT o.id 
      FROM orders o
      JOIN users u ON o.restaurant_id = u.restaurant_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

-- Política para permitir actualización de order_items por el restaurante correspondiente
CREATE POLICY "Restaurant staff can update order items" ON order_items
  FOR UPDATE 
  USING (
    order_id IN (
      SELECT o.id 
      FROM orders o
      JOIN users u ON o.restaurant_id = u.restaurant_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    order_id IN (
      SELECT o.id 
      FROM orders o
      JOIN users u ON o.restaurant_id = u.restaurant_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

-- Política para permitir eliminación de order_items por el restaurante correspondiente
CREATE POLICY "Restaurant staff can delete order items" ON order_items
  FOR DELETE 
  USING (
    order_id IN (
      SELECT o.id 
      FROM orders o
      JOIN users u ON o.restaurant_id = u.restaurant_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
  'Políticas RLS después de la corrección:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'order_items'
ORDER BY policyname;

-- 5. Verificar que RLS está habilitado
SELECT 
  'Verificación de RLS:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'order_items';

-- 6. Probar acceso a la tabla order_items
SELECT 
  'Prueba de acceso a order_items:' as info;

SELECT 
  COUNT(*) as total_order_items
FROM order_items;


