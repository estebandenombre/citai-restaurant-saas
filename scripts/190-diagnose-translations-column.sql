-- Script para diagnosticar problema con columna translations
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual de menu_items
SELECT 
  'Estructura actual de menu_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;

-- 2. Verificar si existe la columna translations
SELECT 
  '¿Existe columna translations?' as info;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'menu_items' 
      AND column_name = 'translations'
    ) THEN 'SÍ existe'
    ELSE 'NO existe'
  END as translations_exists;

-- 3. Verificar datos existentes en menu_items
SELECT 
  'Datos existentes:' as info,
  COUNT(*) as total_items
FROM menu_items;

-- 4. Verificar si hay datos que usen translations
SELECT 
  'Verificando uso de translations:' as info;

SELECT 
  id,
  name,
  description,
  -- Intentar acceder a translations si existe
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'menu_items' 
      AND column_name = 'translations'
    ) THEN 'Columna existe'
    ELSE 'Columna NO existe'
  END as translations_status
FROM menu_items
LIMIT 5;

-- 5. Verificar si hay restricciones relacionadas
SELECT 
  'Restricciones de menu_items:' as info;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'menu_items'
ORDER BY tc.constraint_type, kcu.column_name;
