-- Script para agregar columna translations a menu_items
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la columna ya existe
SELECT 
  'Verificando si translations existe:' as info;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'menu_items' 
      AND column_name = 'translations'
    ) THEN 'La columna translations YA existe'
    ELSE 'La columna translations NO existe - se agregará'
  END as status;

-- 2. Agregar la columna translations si no existe
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

-- 3. Verificar que se agregó correctamente
SELECT 
  'Verificación final:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
AND column_name = 'translations';

-- 4. Verificar estructura completa
SELECT 
  'Estructura completa de menu_items:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;


