-- Script de diagnóstico para el problema "Restaurant not found"
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura de la tabla restaurants
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;

-- 2. Verificar que existen restaurantes activos
SELECT 
  id,
  name,
  slug,
  is_active,
  created_at
FROM restaurants 
WHERE is_active = true
ORDER BY created_at DESC;

-- 3. Verificar la relación entre users y restaurants
SELECT 
  u.id as user_id,
  u.email,
  u.restaurant_id,
  r.id as restaurant_id_from_restaurants,
  r.name as restaurant_name,
  r.slug,
  r.is_active
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 4. Verificar si hay restaurantes sin usuarios asociados
SELECT 
  r.id,
  r.name,
  r.slug,
  r.is_active,
  COUNT(u.id) as user_count
FROM restaurants r
LEFT JOIN users u ON r.id = u.restaurant_id
GROUP BY r.id, r.name, r.slug, r.is_active
ORDER BY user_count DESC;

-- 5. Verificar las políticas RLS de la tabla restaurants
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
WHERE tablename = 'restaurants';

-- 6. Verificar si hay problemas con los UUIDs
SELECT 
  id,
  name,
  slug,
  LENGTH(id::text) as id_length,
  id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' as is_valid_uuid
FROM restaurants
WHERE is_active = true;

-- 7. Verificar las últimas reservas y órdenes para ver qué restaurantId se está enviando
SELECT 
  'reservations' as table_name,
  id,
  restaurant_id,
  created_at
FROM reservations 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 
  'orders' as table_name,
  id,
  restaurant_id,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;




