-- Script simplificado para verificar restricciones en users
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura de la tabla users
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

-- 2. Verificar restricciones NOT NULL
SELECT 
  'Columnas NOT NULL en users:' as info;

SELECT 
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 3. Verificar restricciones CHECK
SELECT 
  'Restricciones CHECK en users:' as info;

SELECT 
  cc.constraint_name,
  cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc 
  ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users';

-- 4. Verificar restricciones UNIQUE
SELECT 
  'Restricciones UNIQUE en users:' as info;

SELECT 
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' 
  AND tc.constraint_type = 'UNIQUE'
ORDER BY kcu.column_name;

-- 5. Verificar restricciones FOREIGN KEY
SELECT 
  'Restricciones FOREIGN KEY en users:' as info;

SELECT 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY kcu.column_name;

-- 6. Verificar políticas RLS
SELECT 
  'Políticas RLS en users:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 7. Verificar si RLS está habilitado
SELECT 
  'Estado de RLS en users:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 8. Probar inserción manual simple
SELECT 
  'Probando inserción manual simple:' as info;

-- Primero obtener un restaurante existente
WITH test_restaurant AS (
  SELECT id 
  FROM restaurants 
  WHERE is_active = true 
  LIMIT 1
),
simple_user AS (
  INSERT INTO users (
    id,
    restaurant_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    has_completed_onboarding
  )
  SELECT 
    gen_random_uuid(),
    tr.id,
    'simple-test-' || EXTRACT(EPOCH FROM NOW())::integer || '@example.com',
    'handled_by_supabase_auth',
    'Simple',
    'Test',
    'owner',
    true,
    false
  FROM test_restaurant tr
  RETURNING id, email, role, restaurant_id, is_active
)
SELECT 
  'Usuario simple creado:' as info,
  id,
  email,
  role,
  restaurant_id,
  is_active
FROM simple_user;

-- 9. Verificar que la inserción funcionó
SELECT 
  'Verificación de inserción simple:' as info;

SELECT 
  id,
  email,
  role,
  restaurant_id,
  is_active,
  created_at
FROM users 
WHERE email LIKE 'simple-test-%@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- 10. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM users 
WHERE email LIKE 'simple-test-%@example.com';




