-- Script para diagnosticar el error del API de órdenes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura de la tabla orders
SELECT 
  'Estructura de la tabla orders:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 2. Verificar la estructura de la tabla order_items
SELECT 
  'Estructura de la tabla order_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- 3. Verificar que existen restaurantes activos
SELECT 
  'Restaurantes activos:' as info;

SELECT 
  id,
  name,
  slug,
  is_active,
  created_at
FROM restaurants 
WHERE is_active = true
ORDER BY created_at DESC;

-- 4. Verificar que existen menu_items
SELECT 
  'Menu items disponibles:' as info;

SELECT 
  mi.id,
  mi.name,
  mi.price,
  mi.restaurant_id,
  r.name as restaurant_name
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE r.is_active = true
ORDER BY r.name, mi.name
LIMIT 10;

-- 5. Verificar las políticas RLS actuales
SELECT 
  'Políticas RLS de orders:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

SELECT 
  'Políticas RLS de order_items:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'order_items'
ORDER BY policyname;

-- 6. Verificar si hay datos existentes
SELECT 
  'Datos existentes en orders:' as info;

SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders;

SELECT 
  'Datos existentes en order_items:' as info;

SELECT 
  COUNT(*) as total_order_items
FROM order_items;

-- 7. Probar inserción manual de una orden (simular el API)
SELECT 
  'Probando inserción manual:' as info;

-- Primero obtener un restaurante y un menu_item
WITH test_data AS (
  SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    mi.id as menu_item_id,
    mi.name as menu_item_name,
    mi.price
  FROM restaurants r
  JOIN menu_items mi ON r.id = mi.restaurant_id
  WHERE r.is_active = true
  LIMIT 1
),
test_order AS (
  INSERT INTO orders (
    restaurant_id,
    order_number,
    customer_name,
    customer_phone,
    customer_email,
    order_type,
    status,
    subtotal,
    tax_amount,
    delivery_fee,
    total_amount,
    created_at,
    updated_at
  )
  SELECT 
    td.restaurant_id,
    'TEST-API-' || EXTRACT(EPOCH FROM NOW())::integer,
    'Cliente API Test',
    '+34612345678',
    'apitest@example.com',
    'dine-in',
    'pending',
    25.00,
    2.50,
    0.00,
    27.50,
    NOW(),
    NOW()
  FROM test_data td
  RETURNING id, restaurant_id, order_number
)
INSERT INTO order_items (
  order_id,
  menu_item_id,
  quantity,
  unit_price,
  total_price,
  special_instructions,
  created_at,
  updated_at
)
SELECT 
  to.id,
  td.menu_item_id,
  2,
  td.price,
  td.price * 2,
  'Test API',
  NOW(),
  NOW()
FROM test_order to
JOIN test_data td ON to.restaurant_id = td.restaurant_id
RETURNING *;

-- 8. Verificar que la inserción manual funcionó
SELECT 
  'Verificación de inserción manual:' as info;

SELECT 
  o.id,
  o.restaurant_id,
  o.order_number,
  o.customer_name,
  o.status,
  o.total_amount,
  o.created_at,
  r.name as restaurant_name,
  COUNT(oi.id) as item_count
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number LIKE 'TEST-API-%'
GROUP BY o.id, o.restaurant_id, o.order_number, o.customer_name, o.status, o.total_amount, o.created_at, r.name
ORDER BY o.created_at DESC
LIMIT 1;

-- 9. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders WHERE order_number LIKE 'TEST-API-%'
);

DELETE FROM orders 
WHERE order_number LIKE 'TEST-API-%';


