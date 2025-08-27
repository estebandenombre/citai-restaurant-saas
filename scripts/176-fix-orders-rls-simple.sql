-- Script simple para arreglar las políticas RLS de orders
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual
SELECT 
  'Estado actual de políticas RLS:' as info;

SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- 2. Eliminar TODAS las políticas RLS de orders y order_items
-- Esto es para empezar desde cero
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Restaurant staff can view orders" ON orders;
DROP POLICY IF EXISTS "Restaurant staff can update orders" ON orders;
DROP POLICY IF EXISTS "Restaurant staff can delete orders" ON orders;
DROP POLICY IF EXISTS "Users can view own restaurant orders" ON orders;
DROP POLICY IF EXISTS "Users can insert orders for their restaurant" ON orders;
DROP POLICY IF EXISTS "Users can update own restaurant orders" ON orders;
DROP POLICY IF EXISTS "Users can delete own restaurant orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can manage orders" ON orders;
DROP POLICY IF EXISTS "Staff can view restaurant orders" ON orders;
DROP POLICY IF EXISTS "Orders are viewable by restaurant staff" ON orders;

DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant staff can view order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant staff can update order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant staff can delete order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items for their restaurant" ON order_items;
DROP POLICY IF EXISTS "Users can update own restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Users can delete own restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can manage order items" ON order_items;
DROP POLICY IF EXISTS "Staff can view restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Order items are viewable by restaurant staff" ON order_items;

-- 3. Crear políticas RLS MUY SIMPLES (sin autenticación para INSERT)
-- Política para orders - permitir todo sin restricciones
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para order_items - permitir todo sin restricciones
CREATE POLICY "Allow all operations on order_items" ON order_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Verificar que las políticas se crearon
SELECT 
  'Políticas RLS después de la corrección:' as info;

SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- 5. Verificar que RLS está habilitado
SELECT 
  'Verificación de RLS:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items');

-- 6. Probar acceso básico
SELECT 
  'Prueba de acceso básico:' as info;

SELECT 
  COUNT(*) as total_orders
FROM orders;

SELECT 
  COUNT(*) as total_order_items
FROM order_items;



