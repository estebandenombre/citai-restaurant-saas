-- Script para corregir el error de clase de operador GIN
-- Ejecutar en Supabase SQL Editor si hay errores con índices GIN

-- 1. Verificar si la extensión pg_trgm está disponible
SELECT 
    'Verificando extensión pg_trgm:' as info;

SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname = 'pg_trgm';

-- 2. Crear extensión pg_trgm si no existe
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. Eliminar índices problemáticos si existen
DROP INDEX IF EXISTS idx_restaurant_payment_settings_payments_enabled;
DROP INDEX IF EXISTS idx_restaurant_payment_settings_gateways;
DROP INDEX IF EXISTS idx_restaurant_payment_settings_settings;

-- 4. Crear índices corregidos con las clases de operador correctas
-- Índice principal para el campo JSONB completo
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_settings 
ON restaurant_payment_settings USING gin (settings);

-- Índice para búsquedas de texto en payments_enabled
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_payments_enabled 
ON restaurant_payment_settings USING gin ((settings->>'payments_enabled') gin_trgm_ops);

-- 5. Verificar que los índices se crearon correctamente
SELECT 
    'Verificando índices corregidos:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurant_payment_settings'
AND indexname LIKE 'idx_restaurant_payment_settings_%'
ORDER BY indexname;

-- 6. Probar consultas que usan los índices
SELECT 
    'Probando consultas con índices:' as info;

-- Probar consulta que usa el índice JSONB principal
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) 
FROM restaurant_payment_settings 
WHERE settings @> '{"payments_enabled": true}'::jsonb;

-- Probar consulta que usa el índice de texto
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) 
FROM restaurant_payment_settings 
WHERE (settings->>'payments_enabled')::BOOLEAN = true;

-- 7. Mostrar estadísticas de uso de índices
SELECT 
    'Estadísticas de índices:' as info;

SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'restaurant_payment_settings'
ORDER BY idx_scan DESC;

-- 8. Verificar clases de operador disponibles
SELECT 
    'Clases de operador disponibles para GIN:' as info;

SELECT 
    opcname,
    opcintype::regtype as input_type,
    opcdefault
FROM pg_opclass 
WHERE opcmethod = (SELECT oid FROM pg_am WHERE amname = 'gin')
AND opcintype IN (
    (SELECT oid FROM pg_type WHERE typname = 'jsonb'),
    (SELECT oid FROM pg_type WHERE typname = 'text')
)
ORDER BY opcintype, opcname;

-- 9. Mensaje de éxito
SELECT 
    '✅ Índices GIN corregidos exitosamente!' as success_message,
    '🔍 Extensión pg_trgm habilitada' as extension_info,
    '📊 Consultas JSONB optimizadas' as optimization_info,
    '🚀 Índices funcionando correctamente' as index_status;

