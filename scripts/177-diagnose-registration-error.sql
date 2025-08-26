-- Script para diagnosticar el error de registro de restaurantes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura de la tabla restaurants
SELECT 
  'Estructura de la tabla restaurants:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;

-- 2. Verificar la estructura de la tabla users
SELECT 
  'Estructura de la tabla users:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Verificar si existe la tabla user_subscriptions
SELECT 
  'Verificando si existe user_subscriptions:' as info;

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'user_subscriptions';

-- 4. Verificar las políticas RLS de restaurants
SELECT 
  'Políticas RLS de restaurants:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'restaurants'
ORDER BY policyname;

-- 5. Verificar las políticas RLS de users
SELECT 
  'Políticas RLS de users:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 6. Verificar datos existentes
SELECT 
  'Datos existentes en restaurants:' as info;

SELECT 
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_restaurants,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_restaurants
FROM restaurants;

SELECT 
  'Datos existentes en users:' as info;

SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
FROM users;

-- 7. Probar inserción manual de un restaurante (simular el registro)
SELECT 
  'Probando inserción manual de restaurante:' as info;

-- Primero verificar que no hay conflictos de slug
WITH test_restaurant AS (
  INSERT INTO restaurants (
    name,
    slug,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    'Restaurante de Prueba',
    'restaurante-de-prueba-' || EXTRACT(EPOCH FROM NOW())::integer,
    true,
    NOW(),
    NOW()
  )
  RETURNING id, name, slug, is_active
)
SELECT 
  'Restaurante de prueba creado:' as info,
  id,
  name,
  slug,
  is_active
FROM test_restaurant;

-- 8. Verificar que el restaurante se creó correctamente
SELECT 
  'Verificación de inserción manual:' as info;

SELECT 
  id,
  name,
  slug,
  is_active,
  created_at
FROM restaurants 
WHERE name = 'Restaurante de Prueba'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM restaurants 
WHERE name = 'Restaurante de Prueba';

-- 10. Verificar las constantes de planes de suscripción
SELECT 
  'Verificando constantes de planes:' as info;

-- Simular las constantes que deberían estar en el código
SELECT 
  'FREE_TRIAL' as plan_name,
  'free-trial-plan' as plan_id
UNION ALL
SELECT 
  'STARTER' as plan_name,
  'starter-plan' as plan_id
UNION ALL
SELECT 
  'PRO' as plan_name,
  'pro-plan' as plan_id
UNION ALL
SELECT 
  'MULTI' as plan_name,
  'multi-plan' as plan_id;


