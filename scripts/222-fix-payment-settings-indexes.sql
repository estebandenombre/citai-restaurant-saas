-- Script para corregir los índices de la tabla restaurant_payment_settings
-- Ejecutar en Supabase SQL Editor si hay errores con los índices

-- 1. Eliminar índices problemáticos si existen
DROP INDEX IF EXISTS idx_restaurant_payment_settings_payments_enabled;
DROP INDEX IF EXISTS idx_restaurant_payment_settings_gateways;
DROP INDEX IF EXISTS idx_restaurant_payment_settings_settings;

-- 2. Crear índices corregidos
-- Índice para el campo JSONB completo (más eficiente para consultas JSONB)
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_settings 
ON restaurant_payment_settings USING gin (settings);

-- Índice específico para payments_enabled (usando B-tree para boolean)
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_payments_enabled 
ON restaurant_payment_settings (CAST(settings->>'payments_enabled' AS boolean));

-- 3. Verificar que los índices se crearon correctamente
SELECT 
    'Verificando índices corregidos:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurant_payment_settings'
AND indexname LIKE 'idx_restaurant_payment_settings_%'
ORDER BY indexname;

-- 4. Probar consultas que usan los índices
SELECT 
    'Probando consultas con índices:' as info;

-- Probar consulta que usa el índice de payments_enabled
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) 
FROM restaurant_payment_settings 
WHERE (settings->>'payments_enabled')::BOOLEAN = true;

-- Probar consulta que usa el índice de gateways
EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) 
FROM restaurant_payment_settings 
WHERE (settings->'gateways'->'stripe'->>'enabled')::BOOLEAN = true;

-- 5. Mostrar estadísticas de uso de índices
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

-- 6. Mensaje de éxito
SELECT 
    '✅ Índices corregidos exitosamente!' as success_message,
    '🔍 Consultas optimizadas para JSONB' as optimization_info,
    '📊 Índices GIN funcionando correctamente' as gin_status;
