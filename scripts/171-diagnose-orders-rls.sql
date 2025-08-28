-- Script de diagnóstico para el problema RLS en orders
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que RLS está habilitado en orders
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- 2. Verificar las políticas RLS actuales de orders
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- 3. Verificar la estructura de la tabla orders
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 4. Verificar si hay datos en orders
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders;

-- 5. Verificar las últimas órdenes (si existen)
SELECT 
  id,
  restaurant_id,
  order_number,
  customer_name,
  status,
  total_amount,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Verificar la relación entre restaurants y orders
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  r.is_active,
  COUNT(o.id) as order_count
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
WHERE r.is_active = true
GROUP BY r.id, r.name, r.is_active
ORDER BY order_count DESC;

-- 7. Probar una consulta simple a orders (simular acceso desde la aplicación)
SELECT 
  'Testing access to orders table:' as info;

SELECT 
  COUNT(*) as accessible_orders
FROM orders;




