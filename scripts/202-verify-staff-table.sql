-- Script para verificar la tabla staff
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla staff existe
SELECT 
    'Verificando existencia de tabla staff:' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'staff';

-- 2. Si existe, mostrar su estructura
SELECT 
    'Estructura de la tabla staff:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'staff' 
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
    'Políticas RLS de la tabla staff:' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'staff';

-- 4. Verificar datos existentes
SELECT 
    'Datos existentes en staff:' as info;

SELECT 
    COUNT(*) as total_staff
FROM staff;

-- 5. Mostrar algunos registros de ejemplo
SELECT 
    'Registros de ejemplo:' as info;

SELECT 
    id,
    first_name,
    last_name,
    email,
    role,
    position,
    is_active,
    created_at
FROM staff 
ORDER BY created_at DESC
LIMIT 5;

