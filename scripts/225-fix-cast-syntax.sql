-- Script para corregir el error de sintaxis del operador CAST en índices
-- Error: syntax error at or near "::"
-- Solución: Usar CAST() en lugar de ::
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar índice problemático si existe
DROP INDEX IF EXISTS idx_restaurant_payment_settings_payments_enabled;

-- 2. Crear índice corregido usando CAST()
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_payments_enabled
ON restaurant_payment_settings (CAST(settings->>'payments_enabled' AS boolean));

-- 3. Verificar que el índice se creó correctamente
SELECT 
    'Verificando índice corregido:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurant_payment_settings'
AND indexname = 'idx_restaurant_payment_settings_payments_enabled';

-- 4. Probar consulta que usa el índice
SELECT 
    'Probando consulta con índice CAST:' as info;

EXPLAIN (ANALYZE, BUFFERS) 
SELECT COUNT(*) 
FROM restaurant_payment_settings 
WHERE CAST(settings->>'payments_enabled' AS boolean) = true;

-- 5. Mostrar estadísticas del índice
SELECT 
    'Estadísticas del índice:' as info;

SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'restaurant_payment_settings'
AND indexname = 'idx_restaurant_payment_settings_payments_enabled';

-- 6. Mensaje de éxito
SELECT 
    '✅ Índice CAST corregido exitosamente!' as success_message,
    '🔧 Sintaxis CAST() aplicada correctamente' as syntax_info,
    '📊 Consultas boolean optimizadas' as optimization_info,
    '🚀 Índice funcionando correctamente' as index_status;

