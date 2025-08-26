-- Script para verificar la estructura de la tabla restaurants
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla restaurants
SELECT 
    'Estructura de la tabla restaurants:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;

-- 2. Verificar datos existentes
SELECT 
    'Datos existentes en restaurants:' as info;

SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_restaurants,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_restaurants
FROM restaurants;

-- 3. Mostrar algunos restaurantes de ejemplo
SELECT 
    'Ejemplos de restaurantes:' as info;

SELECT 
    id,
    name,
    slug,
    cuisine_type,
    phone,
    email,
    is_active,
    created_at
FROM restaurants 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar campos JSONB
SELECT 
    'Verificando campos JSONB:' as info;

SELECT 
    name,
    theme_colors,
    opening_hours,
    social_media,
    printer_config
FROM restaurants 
LIMIT 3;

-- 5. Verificar índices
SELECT 
    'Índices de la tabla restaurants:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurants';

-- 6. Verificar políticas RLS
SELECT 
    'Políticas RLS de restaurants:' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'restaurants';

-- 7. Verificar restricciones
SELECT 
    'Restricciones de la tabla restaurants:' as info;

SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'restaurants'::regclass;


