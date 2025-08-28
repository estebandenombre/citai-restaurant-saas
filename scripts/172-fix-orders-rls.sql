-- Script para arreglar las políticas RLS de la tabla orders
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual de las políticas
SELECT 
  'Estado actual de políticas RLS en orders:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'orders';

-- 2. Eliminar todas las políticas RLS existentes de orders
-- Esto es necesario para crear políticas limpias
DROP POLICY IF EXISTS "Users can view own restaurant orders" ON orders;
DROP POLICY IF EXISTS "Users can insert orders for their restaurant" ON orders;
DROP POLICY IF EXISTS "Users can update own restaurant orders" ON orders;
DROP POLICY IF EXISTS "Users can delete own restaurant orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can manage orders" ON orders;
DROP POLICY IF EXISTS "Staff can view restaurant orders" ON orders;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Orders are viewable by restaurant staff" ON orders;

-- 3. Crear políticas RLS simples y funcionales

-- Política para permitir inserción de órdenes (necesario para el formulario público)
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir lectura de órdenes por el restaurante correspondiente
CREATE POLICY "Restaurant staff can view orders" ON orders
  FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Política para permitir actualización de órdenes por el restaurante correspondiente
CREATE POLICY "Restaurant staff can update orders" ON orders
  FOR UPDATE 
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM users 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Política para permitir eliminación de órdenes por el restaurante correspondiente
CREATE POLICY "Restaurant staff can delete orders" ON orders
  FOR DELETE 
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM users 
      WHERE email = auth.jwt() ->> 'email'
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
WHERE tablename = 'orders'
ORDER BY policyname;

-- 5. Verificar que RLS está habilitado
SELECT 
  'Verificación de RLS:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- 6. Probar acceso a la tabla orders
SELECT 
  'Prueba de acceso a orders:' as info;

SELECT 
  COUNT(*) as total_orders
FROM orders;




