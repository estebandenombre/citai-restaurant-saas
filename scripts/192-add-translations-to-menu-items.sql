-- Script para agregar columna translations a menu_items
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

-- 2. Agregar columna translations si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'menu_items' 
    AND column_name = 'translations'
  ) THEN
    ALTER TABLE menu_items 
    ADD COLUMN translations JSONB DEFAULT NULL;
    
    RAISE NOTICE 'Columna translations agregada exitosamente';
  ELSE
    RAISE NOTICE 'La columna translations ya existe';
  END IF;
END $$;

-- 3. Verificar que se agregó
SELECT 
  'Verificación de columna translations:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND column_name = 'translations';

-- 4. Estructura final
SELECT 
  'Estructura final de menu_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;


