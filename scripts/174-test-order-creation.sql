-- Script para probar la creación de órdenes después de arreglar las políticas RLS
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que las políticas RLS están correctas
SELECT 
  'Verificación de políticas RLS:' as info;

SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- 2. Obtener un restaurante para la prueba
SELECT 
  'Restaurante para la prueba:' as info;

SELECT 
  id,
  name,
  slug,
  is_active
FROM restaurants 
WHERE is_active = true
LIMIT 1;

-- 3. Probar inserción de una orden (simular el proceso completo)
WITH test_restaurant AS (
  SELECT id 
  FROM restaurants 
  WHERE is_active = true 
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
    tr.id,
    'TEST-ORD-' || EXTRACT(EPOCH FROM NOW())::integer,
    'Cliente de Prueba',
    '+34612345678',
    'test@example.com',
    'dine-in',
    'pending',
    25.00,
    2.50,
    0.00,
    27.50,
    NOW(),
    NOW()
  FROM test_restaurant tr
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
  mi.id,
  2,
  12.50,
  25.00,
  'Sin cebolla',
  NOW(),
  NOW()
FROM test_order to
CROSS JOIN LATERAL (
  SELECT id 
  FROM menu_items 
  WHERE restaurant_id = to.restaurant_id 
  LIMIT 1
) mi
RETURNING *;

-- 4. Verificar que la orden se creó correctamente
SELECT 
  'Orden de prueba creada:' as info;

SELECT 
  o.id,
  o.restaurant_id,
  o.order_number,
  o.customer_name,
  o.customer_phone,
  o.order_type,
  o.status,
  o.total_amount,
  o.created_at,
  r.name as restaurant_name,
  COUNT(oi.id) as item_count
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number LIKE 'TEST-ORD-%'
GROUP BY o.id, o.restaurant_id, o.order_number, o.customer_name, o.customer_phone, o.order_type, o.status, o.total_amount, o.created_at, r.name
ORDER BY o.created_at DESC
LIMIT 1;

-- 5. Verificar los items de la orden
SELECT 
  'Items de la orden de prueba:' as info;

SELECT 
  oi.id,
  oi.order_id,
  oi.menu_item_id,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  oi.special_instructions,
  mi.name as menu_item_name
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.order_number LIKE 'TEST-ORD-%'
ORDER BY oi.created_at DESC;

-- 6. Limpiar datos de prueba (opcional)
-- Descomenta si quieres eliminar los datos de prueba
/*
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders WHERE order_number LIKE 'TEST-ORD-%'
);

DELETE FROM orders 
WHERE order_number LIKE 'TEST-ORD-%';
*/




