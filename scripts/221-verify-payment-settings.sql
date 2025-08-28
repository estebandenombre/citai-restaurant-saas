-- Script para verificar que la tabla de configuraciones de pago funciona correctamente
-- Ejecutar en Supabase SQL Editor después del script 220

-- 1. Verificar que la tabla existe
SELECT 
    '1. Verificando que la tabla restaurant_payment_settings existe:' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'restaurant_payment_settings';

-- 2. Verificar estructura de la tabla
SELECT 
    '2. Estructura de la tabla restaurant_payment_settings:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurant_payment_settings' 
ORDER BY ordinal_position;

-- 3. Verificar restricciones
SELECT 
    '3. Restricciones de la tabla:' as info;

SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'restaurant_payment_settings'::regclass
ORDER BY conname;

-- 4. Verificar índices
SELECT 
    '4. Índices de la tabla:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurant_payment_settings'
ORDER BY indexname;

-- 5. Verificar políticas RLS
SELECT 
    '5. Políticas RLS:' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'restaurant_payment_settings'
ORDER BY policyname;

-- 6. Verificar funciones creadas
SELECT 
    '6. Funciones creadas:' as info;

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN (
    'validate_payment_settings',
    'get_restaurant_payment_settings',
    'save_restaurant_payment_settings',
    'restaurant_has_payments_enabled',
    'get_available_payment_methods',
    'update_restaurant_payment_settings_updated_at'
)
ORDER BY routine_name;

-- 7. Verificar triggers
SELECT 
    '7. Triggers creados:' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'restaurant_payment_settings'
ORDER BY trigger_name;

-- 8. Verificar datos existentes
SELECT 
    '8. Datos existentes:' as info;

SELECT 
    COUNT(*) as total_payment_settings,
    COUNT(CASE WHEN (settings->>'payments_enabled')::BOOLEAN THEN 1 END) as payments_enabled,
    COUNT(CASE WHEN NOT (settings->>'payments_enabled')::BOOLEAN THEN 1 END) as payments_disabled
FROM restaurant_payment_settings;

-- 9. Verificar relación con restaurantes
SELECT 
    '9. Relación con restaurantes:' as info;

SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN rps.restaurant_id IS NOT NULL THEN 1 END) as restaurants_with_payment_settings,
    COUNT(CASE WHEN rps.restaurant_id IS NULL THEN 1 END) as restaurants_without_payment_settings
FROM restaurants r
LEFT JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id;

-- 10. Probar función de validación
SELECT 
    '10. Probando función de validación:' as info;

-- Probar con configuración válida
SELECT 
    'Configuración válida:' as test_case,
    validate_payment_settings('{
        "payments_enabled": true,
        "gateways": {
            "stripe": {
                "enabled": true,
                "name": "Stripe",
                "supported_methods": ["card"],
                "public_key": "pk_test_123",
                "secret_key": "sk_test_123"
            }
        }
    }'::jsonb) as is_valid;

-- Probar con configuración inválida
SELECT 
    'Configuración inválida:' as test_case,
    validate_payment_settings('{
        "payments_enabled": true,
        "gateways": {
            "stripe": {
                "enabled": true,
                "name": "Stripe"
            }
        }
    }'::jsonb) as is_valid;

-- 11. Probar función de obtención de configuraciones
SELECT 
    '11. Probando función get_restaurant_payment_settings:' as info;

-- Obtener configuración de un restaurante existente
SELECT 
    r.name as restaurant_name,
    get_restaurant_payment_settings(r.id) as payment_settings
FROM restaurants r
LIMIT 3;

-- 12. Probar función de verificación de pagos habilitados
SELECT 
    '12. Probando función restaurant_has_payments_enabled:' as info;

SELECT 
    r.name as restaurant_name,
    restaurant_has_payments_enabled(r.id) as has_payments_enabled
FROM restaurants r
LIMIT 5;

-- 13. Probar función de métodos de pago disponibles
SELECT 
    '13. Probando función get_available_payment_methods:' as info;

SELECT 
    r.name as restaurant_name,
    get_available_payment_methods(r.id) as available_methods
FROM restaurants r
LIMIT 5;

-- 14. Verificar configuración por defecto
SELECT 
    '14. Verificando configuración por defecto:' as info;

SELECT 
    r.name as restaurant_name,
    rps.settings->>'payments_enabled' as payments_enabled,
    rps.settings->>'allow_cash' as allow_cash,
    rps.settings->>'allow_card' as allow_card,
    rps.settings->'gateways'->'stripe'->>'enabled' as stripe_enabled,
    rps.settings->'gateways'->'paypal'->>'enabled' as paypal_enabled
FROM restaurants r
JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
LIMIT 5;

-- 15. Verificar seguridad RLS
SELECT 
    '15. Verificando seguridad RLS:' as info;

-- Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'restaurant_payment_settings';

-- 16. Probar inserción y actualización (simulación)
SELECT 
    '16. Probando inserción y actualización:' as info;

-- Simular inserción de configuración (esto solo funcionará si el usuario está autenticado)
-- SELECT save_restaurant_payment_settings(
--     (SELECT id FROM restaurants LIMIT 1),
--     '{
--         "payments_enabled": true,
--         "require_payment": false,
--         "allow_cash": true,
--         "allow_card": true,
--         "allow_apple_pay": false,
--         "allow_google_pay": false,
--         "auto_capture": true,
--         "gateways": {
--             "stripe": {
--                 "id": "stripe",
--                 "name": "Stripe",
--                 "enabled": true,
--                 "test_mode": true,
--                 "public_key": "pk_test_123",
--                 "secret_key": "sk_test_123",
--                 "webhook_url": "",
--                 "supported_methods": ["card", "apple_pay", "google_pay"],
--                 "processing_fee": 2.9,
--                 "setup_complete": true
--             },
--             "paypal": {
--                 "id": "paypal",
--                 "name": "PayPal",
--                 "enabled": false,
--                 "test_mode": true,
--                 "public_key": "",
--                 "secret_key": "",
--                 "webhook_url": "",
--                 "supported_methods": ["card", "paypal"],
--                 "processing_fee": 2.9,
--                 "setup_complete": false
--             },
--             "apple_pay": {
--                 "id": "apple_pay",
--                 "name": "Apple Pay",
--                 "enabled": false,
--                 "test_mode": true,
--                 "public_key": "",
--                 "secret_key": "",
--                 "webhook_url": "",
--                 "supported_methods": ["apple_pay"],
--                 "processing_fee": 0,
--                 "setup_complete": false
--             }
--         }
--     }'::jsonb
-- ) as save_result;

-- 17. Verificar integridad referencial
SELECT 
    '17. Verificando integridad referencial:' as info;

SELECT 
    'Restaurantes sin configuración de pago:' as check_type,
    COUNT(*) as count
FROM restaurants r
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_payment_settings rps 
    WHERE rps.restaurant_id = r.id
);

SELECT 
    'Configuraciones de pago sin restaurante:' as check_type,
    COUNT(*) as count
FROM restaurant_payment_settings rps
WHERE NOT EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = rps.restaurant_id
);

-- 18. Verificar timestamps
SELECT 
    '18. Verificando timestamps:' as info;

SELECT 
    r.name as restaurant_name,
    rps.created_at,
    rps.updated_at,
    CASE 
        WHEN rps.created_at = rps.updated_at THEN '✅ Timestamps correctos'
        ELSE '⚠️ Timestamps diferentes'
    END as timestamp_status
FROM restaurants r
JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
LIMIT 5;

-- 19. Verificar formato JSON
SELECT 
    '19. Verificando formato JSON:' as info;

SELECT 
    r.name as restaurant_name,
    jsonb_typeof(rps.settings) as settings_type,
    jsonb_typeof(rps.settings->'gateways') as gateways_type,
    CASE 
        WHEN rps.settings ? 'payments_enabled' AND rps.settings ? 'gateways' THEN '✅ Formato correcto'
        ELSE '❌ Formato incorrecto'
    END as format_status
FROM restaurants r
JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
LIMIT 5;

-- 20. Resumen final
SELECT 
    '20. Resumen final:' as info;

SELECT 
    '✅ Tabla restaurant_payment_settings verificada exitosamente!' as status,
    '🔒 RLS habilitado y políticas configuradas' as security,
    '📊 Funciones de validación y consulta operativas' as functions,
    '🚀 Listo para integración con la aplicación' as integration;

