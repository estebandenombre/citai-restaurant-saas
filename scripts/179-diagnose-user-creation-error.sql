-- Script para diagnosticar el error de creación de usuarios
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura exacta de la tabla users
SELECT 
  'Estructura detallada de la tabla users:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verificar las restricciones de la tabla users
SELECT 
  'Restricciones de la tabla users:' as info;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_type, kcu.column_name;

-- 3. Verificar las políticas RLS actuales de users
SELECT 
  'Políticas RLS de users:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 4. Verificar si RLS está habilitado
SELECT 
  'Estado de RLS en users:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 5. Verificar datos existentes en users
SELECT 
  'Datos existentes en users:' as info;

SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owner_users,
  COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_users
FROM users;

-- 6. Verificar si hay usuarios con datos problemáticos
SELECT 
  'Usuarios con datos problemáticos:' as info;

SELECT 
  id,
  email,
  role,
  is_active,
  restaurant_id,
  created_at
FROM users 
WHERE 
  email IS NULL OR 
  role IS NULL OR 
  restaurant_id IS NULL
ORDER BY created_at DESC;

-- 7. Probar inserción manual de un usuario (simular el registro)
SELECT 
  'Probando inserción manual de usuario:' as info;

-- Primero obtener un restaurante existente
WITH test_restaurant AS (
  SELECT id 
  FROM restaurants 
  WHERE is_active = true 
  LIMIT 1
),
test_user AS (
  INSERT INTO users (
    id,
    restaurant_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    has_completed_onboarding,
    created_at,
    updated_at
  )
  SELECT 
    gen_random_uuid(),
    tr.id,
    'test-user-' || EXTRACT(EPOCH FROM NOW())::integer || '@example.com',
    'handled_by_supabase_auth',
    'Test',
    'User',
    'owner',
    true,
    false,
    NOW(),
    NOW()
  FROM test_restaurant tr
  RETURNING id, email, role, restaurant_id, is_active
)
SELECT 
  'Usuario de prueba creado:' as info,
  id,
  email,
  role,
  restaurant_id,
  is_active
FROM test_user;

-- 8. Verificar que el usuario se creó correctamente
SELECT 
  'Verificación de inserción manual:' as info;

SELECT 
  id,
  email,
  role,
  restaurant_id,
  is_active,
  has_completed_onboarding,
  created_at
FROM users 
WHERE email LIKE 'test-user-%@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM users 
WHERE email LIKE 'test-user-%@example.com';

-- 10. Verificar las secuencias y valores por defecto
SELECT 
  'Verificando secuencias y valores por defecto:' as info;

SELECT 
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND (column_default IS NOT NULL OR is_nullable = 'NO')
ORDER BY ordinal_position;

-- 11. Verificar si hay triggers en la tabla users
SELECT 
  'Triggers en la tabla users:' as info;

SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
ORDER BY trigger_name;




