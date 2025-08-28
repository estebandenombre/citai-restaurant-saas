-- Script de verificación para las funciones de eliminación de claves de pago
-- Ejecutar en Supabase SQL Editor para verificar que todo funciona correctamente

-- 1. Verificar que las funciones existen
SELECT 
    'Verificando funciones de eliminación de claves:' as info;

SELECT 
    proname as function_name,
    proargtypes::regtype[] as parameters,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN (
    'delete_payment_gateway_keys',
    'clear_all_payment_keys', 
    'has_payment_keys_configured',
    'get_gateways_with_keys'
)
ORDER BY proname;

-- 2. Verificar que la tabla restaurant_payment_settings existe
SELECT 
    'Verificando tabla restaurant_payment_settings:' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'restaurant_payment_settings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
    'Verificando políticas RLS:' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'restaurant_payment_settings'
ORDER BY policyname;

-- 4. Probar función has_payment_keys_configured con un restaurante de ejemplo
SELECT 
    'Probando función has_payment_keys_configured:' as info;

-- Obtener un restaurante de ejemplo para las pruebas
DO $$
DECLARE
    test_restaurant_id UUID;
    has_keys BOOLEAN;
BEGIN
    -- Obtener el primer restaurante disponible
    SELECT id INTO test_restaurant_id 
    FROM restaurants 
    LIMIT 1;
    
    IF test_restaurant_id IS NOT NULL THEN
        RAISE NOTICE 'Restaurante de prueba: %', test_restaurant_id;
        
        -- Probar la función
        SELECT has_payment_keys_configured(test_restaurant_id) INTO has_keys;
        RAISE NOTICE '¿Tiene claves configuradas?: %', has_keys;
        
        -- Mostrar gateways con claves
        RAISE NOTICE 'Gateways con claves: %', get_gateways_with_keys(test_restaurant_id);
    ELSE
        RAISE NOTICE 'No se encontraron restaurantes para probar';
    END IF;
END $$;

-- 5. Verificar configuración actual de pagos
SELECT 
    'Configuración actual de pagos:' as info;

SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    rps.settings->>'payments_enabled' as payments_enabled,
    rps.settings->'gateways'->'stripe'->>'enabled' as stripe_enabled,
    CASE 
        WHEN rps.settings->'gateways'->'stripe'->>'public_key' != '' 
        THEN 'CONFIGURADA' 
        ELSE 'NO CONFIGURADA' 
    END as stripe_keys_status,
    rps.settings->'gateways'->'paypal'->>'enabled' as paypal_enabled,
    CASE 
        WHEN rps.settings->'gateways'->'paypal'->>'public_key' != '' 
        THEN 'CONFIGURADA' 
        ELSE 'NO CONFIGURADA' 
    END as paypal_keys_status,
    rps.updated_at
FROM restaurants r
LEFT JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
ORDER BY r.name
LIMIT 10;

-- 6. Función de prueba para simular eliminación de claves
CREATE OR REPLACE FUNCTION test_delete_payment_keys()
RETURNS TEXT AS $$
DECLARE
    test_restaurant_id UUID;
    delete_result BOOLEAN;
    clear_result BOOLEAN;
    has_keys_before BOOLEAN;
    has_keys_after BOOLEAN;
BEGIN
    -- Obtener un restaurante de prueba
    SELECT id INTO test_restaurant_id 
    FROM restaurants 
    LIMIT 1;
    
    IF test_restaurant_id IS NULL THEN
        RETURN 'No se encontraron restaurantes para probar';
    END IF;
    
    -- Verificar estado antes
    SELECT has_payment_keys_configured(test_restaurant_id) INTO has_keys_before;
    
    -- Probar eliminación de claves de Stripe
    SELECT delete_payment_gateway_keys(test_restaurant_id, 'stripe') INTO delete_result;
    
    -- Probar eliminación de todas las claves
    SELECT clear_all_payment_keys(test_restaurant_id) INTO clear_result;
    
    -- Verificar estado después
    SELECT has_payment_keys_configured(test_restaurant_id) INTO has_keys_after;
    
    RETURN format(
        'Prueba completada - Restaurante: %s, Antes: %s, Después: %s, Delete Stripe: %s, Clear All: %s',
        test_restaurant_id,
        has_keys_before,
        has_keys_after,
        delete_result,
        clear_result
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Ejecutar prueba
SELECT 
    'Ejecutando prueba de eliminación:' as info;

SELECT test_delete_payment_keys() as test_result;

-- 8. Limpiar función de prueba
DROP FUNCTION IF EXISTS test_delete_payment_keys();

-- 9. Verificar logs de las funciones
SELECT 
    'Verificando logs de funciones:' as info;

-- Nota: Los logs de RAISE NOTICE aparecerán en la consola de Supabase
-- durante la ejecución de este script
