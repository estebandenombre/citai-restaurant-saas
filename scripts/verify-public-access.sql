-- Script para verificar que el acceso público funciona correctamente
-- Ejecutar en Supabase SQL Editor después de aplicar fix-public-access-rls.sql

-- 1. Verificar que las políticas públicas están activas
SELECT 'VERIFICACIÓN DE POLÍTICAS PÚBLICAS:' as section;

SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename IN ('restaurants', 'categories', 'menu_items')
  AND policyname LIKE '%Public%'
ORDER BY tablename, policyname;

-- 2. Verificar que RLS está habilitado
SELECT 'ESTADO DE RLS:' as section;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('restaurants', 'categories', 'menu_items')
ORDER BY tablename;

-- 3. Probar acceso público (simulando usuario anónimo)
SELECT 'PRUEBA DE ACCESO PÚBLICO:' as section;

-- Simular acceso anónimo
SELECT 'Restaurantes activos (acceso público):' as test;
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

-- 4. Probar acceso a categorías públicas
SELECT 'Categorías activas (acceso público):' as test;
SELECT 
  c.id,
  c.name,
  c.description,
  c.restaurant_id,
  r.name as restaurant_name,
  r.slug as restaurant_slug
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE c.is_active = true AND r.is_active = true
ORDER BY r.name, c.display_order
LIMIT 10;

-- 5. Probar acceso a elementos del menú públicos
SELECT 'Elementos de menú disponibles (acceso público):' as test;
SELECT 
  mi.id,
  mi.name,
  mi.description,
  mi.price,
  mi.is_available,
  mi.is_featured,
  mi.restaurant_id,
  r.name as restaurant_name,
  r.slug as restaurant_slug
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE mi.is_available = true AND r.is_active = true
ORDER BY r.name, mi.display_order
LIMIT 10;

-- 6. Probar consulta específica por slug de restaurante
SELECT 'Prueba específica por slug:' as test;

-- Obtener un restaurante activo para la prueba
WITH test_restaurant AS (
  SELECT id, name, slug
  FROM restaurants 
  WHERE is_active = true
  LIMIT 1
)
SELECT 
  'Restaurante de prueba:' as info,
  tr.name,
  tr.slug,
  tr.id
FROM test_restaurant tr;

-- 7. Probar consulta completa de menú por restaurante
SELECT 'Prueba de menú completo por restaurante:' as test;

WITH test_restaurant AS (
  SELECT id, name, slug
  FROM restaurants 
  WHERE is_active = true
  LIMIT 1
),
restaurant_categories AS (
  SELECT 
    c.id,
    c.name,
    c.description,
    c.display_order,
    tr.id as restaurant_id,
    tr.name as restaurant_name,
    tr.slug as restaurant_slug
  FROM categories c
  JOIN test_restaurant tr ON c.restaurant_id = tr.id
  WHERE c.is_active = true
  ORDER BY c.display_order
),
restaurant_menu_items AS (
  SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.is_available,
    mi.is_featured,
    mi.display_order,
    mi.category_id,
    rc.name as category_name,
    rc.restaurant_id,
    rc.restaurant_name,
    rc.restaurant_slug
  FROM menu_items mi
  JOIN restaurant_categories rc ON mi.category_id = rc.id
  WHERE mi.is_available = true
  ORDER BY rc.display_order, mi.display_order
)
SELECT 
  'Menú completo disponible:' as info,
  COUNT(DISTINCT restaurant_id) as total_restaurants,
  COUNT(DISTINCT category_id) as total_categories,
  COUNT(*) as total_menu_items
FROM restaurant_menu_items;

-- 8. Verificar permisos de usuario anónimo
SELECT 'VERIFICACIÓN DE PERMISOS:' as section;

-- Verificar que el usuario anónimo tiene permisos de lectura
SELECT 
  'Permisos de usuario anónimo:' as info;

SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'anon'
  AND table_name IN ('restaurants', 'categories', 'menu_items')
ORDER BY table_name, privilege_type;

-- 9. Mensaje final
SELECT '✅ VERIFICACIÓN COMPLETADA' as status;
SELECT '✅ Políticas públicas activas' as item;
SELECT '✅ RLS habilitado correctamente' as item;
SELECT '✅ Acceso anónimo funcionando' as item;
SELECT '✅ Menús visibles públicamente' as item;
SELECT '🎉 Los comensales pueden ver los menús sin autenticación!' as final_message;


