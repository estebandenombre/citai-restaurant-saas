-- Script para eliminar columnas de imagen y traducción de menu_items
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual
SELECT 
  'Estructura actual de menu_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;

-- 2. Eliminar columna image_url si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'menu_items' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE menu_items DROP COLUMN image_url;
    RAISE NOTICE 'Columna image_url eliminada exitosamente';
  ELSE
    RAISE NOTICE 'La columna image_url no existe';
  END IF;
END $$;

-- 3. Eliminar columna translations si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'menu_items' 
    AND column_name = 'translations'
  ) THEN
    ALTER TABLE menu_items DROP COLUMN translations;
    RAISE NOTICE 'Columna translations eliminada exitosamente';
  ELSE
    RAISE NOTICE 'La columna translations no existe';
  END IF;
END $$;

-- 4. Verificar estructura final
SELECT 
  'Estructura final de menu_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;

-- 5. Verificar datos existentes
SELECT 
  'Datos existentes:' as info,
  COUNT(*) as total_items
FROM menu_items;

-- 6. Mostrar algunos elementos de ejemplo
SELECT 
  'Elementos de ejemplo:' as info;

SELECT 
  id,
  name,
  price,
  is_available,
  is_featured,
  created_at
FROM menu_items 
ORDER BY created_at DESC
LIMIT 5;




