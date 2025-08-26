-- Script para verificar y arreglar restricciones problemáticas en users
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todas las restricciones de la tabla users
SELECT 
  'Todas las restricciones de users:' as info;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
LEFT JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_type, kcu.column_name;

-- 2. Verificar restricciones CHECK específicas
SELECT 
  'Restricciones CHECK en users:' as info;

SELECT 
  cc.constraint_name,
  cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc 
  ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users';

-- 3. Verificar restricciones NOT NULL
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
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'users' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY kcu.column_name;

-- 6. Verificar si hay restricciones problemáticas que puedan causar errores
SELECT 
  'Verificando restricciones problemáticas:' as info;

-- Verificar si hay restricciones CHECK que puedan estar causando problemas
SELECT 
  'Restricciones CHECK que podrían causar problemas:' as info;

SELECT 
  cc.constraint_name,
  cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc 
  ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users'
  AND (
    cc.check_clause LIKE '%role%' OR
    cc.check_clause LIKE '%email%' OR
    cc.check_clause LIKE '%password%'
  );

-- 7. Probar inserción con datos mínimos para identificar el problema
SELECT 
  'Probando inserción con datos mínimos:' as info;

-- Primero obtener un restaurante existente
WITH test_restaurant AS (
  SELECT id 
  FROM restaurants 
  WHERE is_active = true 
  LIMIT 1
),
minimal_user AS (
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
    'minimal-test-' || EXTRACT(EPOCH FROM NOW())::integer || '@example.com',
    'handled_by_supabase_auth',
    'Minimal',
    'Test',
    'owner',
    true,
    false
  FROM test_restaurant tr
  RETURNING id, email, role, restaurant_id, is_active
)
SELECT 
  'Usuario mínimo creado:' as info,
  id,
  email,
  role,
  restaurant_id,
  is_active
FROM minimal_user;

-- 8. Verificar que la inserción mínima funcionó
SELECT 
  'Verificación de inserción mínima:' as info;

SELECT 
  id,
  email,
  role,
  restaurant_id,
  is_active,
  created_at,
  updated_at
FROM users 
WHERE email LIKE 'minimal-test-%@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM users 
WHERE email LIKE 'minimal-test-%@example.com';

-- 10. Verificar si hay triggers que puedan estar interfiriendo
SELECT 
  'Triggers en users que podrían interferir:' as info;

SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
  AND event_manipulation = 'INSERT'
ORDER BY trigger_name;
