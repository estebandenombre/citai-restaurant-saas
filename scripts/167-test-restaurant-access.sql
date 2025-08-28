-- Script de prueba para verificar el acceso a restaurantes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que RLS está habilitado en restaurants
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'restaurants';

-- 2. Verificar las políticas RLS actuales
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

-- 3. Probar acceso a restaurantes activos (simular consulta desde la aplicación)
SELECT 
  id,
  name,
  slug,
  is_active,
  created_at
FROM restaurants 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar que los restaurantes tienen slugs válidos
SELECT 
  id,
  name,
  slug,
  CASE 
    WHEN slug IS NULL THEN 'NULL slug'
    WHEN slug = '' THEN 'Empty slug'
    WHEN slug ~ '^[a-z0-9-]+$' THEN 'Valid slug'
    ELSE 'Invalid slug format'
  END as slug_status
FROM restaurants 
WHERE is_active = true;

-- 5. Verificar que no hay restaurantes duplicados por slug
SELECT 
  slug,
  COUNT(*) as count,
  array_agg(name) as restaurant_names
FROM restaurants 
WHERE is_active = true AND slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;

-- 6. Verificar la estructura de datos de un restaurante específico
SELECT 
  'Sample restaurant data:' as info;

SELECT 
  id,
  name,
  slug,
  description,
  address,
  phone,
  email,
  is_active,
  created_at,
  updated_at
FROM restaurants 
WHERE is_active = true
LIMIT 1;

-- 7. Verificar que las políticas RLS permiten acceso público
-- Esta consulta debería funcionar sin autenticación
SELECT 
  'Testing public access to restaurants:' as info;

SELECT 
  COUNT(*) as total_active_restaurants
FROM restaurants 
WHERE is_active = true;

-- 8. Verificar que los UUIDs son válidos
SELECT 
  'UUID validation:' as info;

SELECT 
  id,
  name,
  CASE 
    WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Valid UUID'
    ELSE 'Invalid UUID'
  END as uuid_status
FROM restaurants 
WHERE is_active = true
LIMIT 5;




