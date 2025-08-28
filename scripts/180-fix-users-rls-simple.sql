-- Script simple para arreglar las políticas RLS de users
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual
SELECT 
  'Estado actual de políticas RLS en users:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 2. Eliminar TODAS las políticas RLS de users
-- Esto es para empezar desde cero
DROP POLICY IF EXISTS "Public can create users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Users can view own restaurant users" ON users;
DROP POLICY IF EXISTS "Users can insert users for their restaurant" ON users;
DROP POLICY IF EXISTS "Users can update own restaurant users" ON users;
DROP POLICY IF EXISTS "Users can delete own restaurant users" ON users;
DROP POLICY IF EXISTS "Restaurant owners can manage users" ON users;
DROP POLICY IF EXISTS "Staff can view restaurant users" ON users;
DROP POLICY IF EXISTS "Users are viewable by restaurant staff" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 3. Crear políticas RLS MUY SIMPLES (sin autenticación para INSERT)
-- Política para users - permitir todo sin restricciones
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Verificar que las políticas se crearon
SELECT 
  'Políticas RLS después de la corrección:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. Verificar que RLS está habilitado
SELECT 
  'Verificación de RLS:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 6. Probar acceso básico
SELECT 
  'Prueba de acceso básico:' as info;

SELECT 
  COUNT(*) as total_users
FROM users;

-- 7. Probar inserción manual (simular el registro)
SELECT 
  'Probando inserción manual:' as info;

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
    'test-rls-' || EXTRACT(EPOCH FROM NOW())::integer || '@example.com',
    'handled_by_supabase_auth',
    'Test',
    'RLS',
    'owner',
    true,
    false,
    NOW(),
    NOW()
  FROM test_restaurant tr
  RETURNING id, email, role, restaurant_id, is_active
)
SELECT 
  'Usuario RLS de prueba creado:' as info,
  id,
  email,
  role,
  restaurant_id,
  is_active
FROM test_user;

-- 8. Verificar que la inserción funcionó
SELECT 
  'Verificación de inserción RLS:' as info;

SELECT 
  id,
  email,
  role,
  restaurant_id,
  is_active,
  created_at
FROM users 
WHERE email LIKE 'test-rls-%@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Limpiar datos de prueba
SELECT 
  'Limpiando datos de prueba:' as info;

DELETE FROM users 
WHERE email LIKE 'test-rls-%@example.com';




