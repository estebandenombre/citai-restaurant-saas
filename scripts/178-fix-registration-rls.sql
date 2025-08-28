-- Script para arreglar las políticas RLS para permitir el registro
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual de las políticas
SELECT 
  'Estado actual de políticas RLS:' as info;

SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('restaurants', 'users')
ORDER BY tablename, policyname;

-- 2. Eliminar políticas RLS problemáticas de restaurants
DROP POLICY IF EXISTS "Users can view own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can update own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can delete own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can manage restaurants" ON restaurants;
DROP POLICY IF EXISTS "Staff can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurants are viewable by restaurant staff" ON restaurants;

-- 3. Eliminar políticas RLS problemáticas de users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Restaurant owners can manage users" ON users;
DROP POLICY IF EXISTS "Staff can view users" ON users;
DROP POLICY IF EXISTS "Public can create users" ON users;
DROP POLICY IF EXISTS "Users are viewable by restaurant staff" ON users;

-- 4. Crear políticas RLS simples para restaurants
-- Política para permitir inserción de restaurantes (necesario para el registro)
CREATE POLICY "Public can create restaurants" ON restaurants
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir lectura de restaurantes activos (público)
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT
  USING (is_active = true);

-- Política para permitir lectura de restaurantes por el propietario
CREATE POLICY "Restaurant owners can view own restaurant" ON restaurants
  FOR SELECT
  USING (
    id IN (
      SELECT restaurant_id
      FROM users
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Política para permitir actualización de restaurantes por el propietario
CREATE POLICY "Restaurant owners can update own restaurant" ON restaurants
  FOR UPDATE
  USING (
    id IN (
      SELECT restaurant_id
      FROM users
      WHERE email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    id IN (
      SELECT restaurant_id
      FROM users
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Política para permitir eliminación de restaurantes por el propietario
CREATE POLICY "Restaurant owners can delete own restaurant" ON restaurants
  FOR DELETE
  USING (
    id IN (
      SELECT restaurant_id
      FROM users
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- 5. Crear políticas RLS simples para users
-- Política para permitir inserción de usuarios (necesario para el registro)
CREATE POLICY "Public can create users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir lectura del propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Política para permitir actualización del propio perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- Política para permitir eliminación del propio perfil
CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE
  USING (email = auth.jwt() ->> 'email');

-- 6. Verificar que las políticas se crearon correctamente
SELECT 
  'Políticas RLS después de la corrección:' as info;

SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('restaurants', 'users')
ORDER BY tablename, policyname;

-- 7. Verificar que RLS está habilitado
SELECT 
  'Verificación de RLS:' as info;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('restaurants', 'users');

-- 8. Probar acceso básico
SELECT 
  'Prueba de acceso básico:' as info;

SELECT 
  COUNT(*) as total_restaurants
FROM restaurants;

SELECT 
  COUNT(*) as total_users
FROM users;




