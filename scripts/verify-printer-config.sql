-- Script de verificación para configuración de impresión
-- Ejecutar este script en Supabase SQL Editor para verificar la instalación

-- Verificar que la columna printer_config existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name = 'printer_config';

-- Verificar que el índice existe
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurants' 
AND indexname = 'idx_restaurants_printer_config';

-- Verificar que las políticas RLS existen
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'restaurants' 
AND policyname IN (
    'Users can view printer config for their restaurant',
    'Users can update printer config for their restaurant'
);

-- Mostrar estadísticas de configuración
SELECT 
    'Resumen de Configuración de Impresión' as titulo,
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN printer_config IS NOT NULL THEN 1 END) as restaurants_with_config,
    COUNT(CASE WHEN printer_config->>'enabled' = 'true' THEN 1 END) as restaurants_with_printing_enabled
FROM restaurants;

-- Mostrar configuraciones de impresoras habilitadas
SELECT 
    id,
    name,
    printer_config->>'enabled' as printer_enabled,
    printer_config->>'printer_type' as printer_type,
    printer_config->>'printer_ip' as printer_ip,
    printer_config->>'printer_port' as printer_port,
    printer_config->>'paper_width' as paper_width
FROM restaurants 
WHERE printer_config->>'enabled' = 'true';

-- Verificar estructura de usuarios para RLS
SELECT 
    'Verificación de Estructura de Usuarios' as titulo,
    COUNT(*) as total_users,
    COUNT(CASE WHEN restaurant_id IS NOT NULL THEN 1 END) as users_with_restaurant
FROM users;

-- Mostrar ejemplo de relación usuario-restaurante
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    r.id as restaurant_id,
    r.name as restaurant_name
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LIMIT 5; 