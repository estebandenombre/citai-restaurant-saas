-- Verificación rápida del sistema de pagos
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'restaurant_payment_settings') 
        THEN '✅ Tabla restaurant_payment_settings existe'
        ELSE '❌ Tabla restaurant_payment_settings NO existe'
    END as table_status;

-- 2. Verificar si las funciones existen
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM pg_proc WHERE proname = 'get_restaurant_payment_settings') 
        THEN '✅ Función get_restaurant_payment_settings existe'
        ELSE '❌ Función get_restaurant_payment_settings NO existe'
    END as function_status;

-- 3. Verificar si hay restaurantes
SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_restaurants
FROM restaurants;

-- 4. Verificar si hay configuraciones de pago
SELECT 
    COUNT(*) as total_payment_settings,
    COUNT(CASE WHEN settings->>'payments_enabled' = 'true' THEN 1 END) as enabled_payments
FROM restaurant_payment_settings;

-- 5. Mostrar restaurantes con sus configuraciones de pago
SELECT 
    r.id,
    r.name,
    r.slug,
    CASE 
        WHEN rps.settings IS NOT NULL THEN '✅ Tiene configuración'
        ELSE '❌ Sin configuración'
    END as payment_config_status,
    CASE 
        WHEN rps.settings->>'payments_enabled' = 'true' THEN '✅ Habilitado'
        ELSE '❌ Deshabilitado'
    END as payments_enabled,
    CASE 
        WHEN rps.settings->'gateways'->'stripe'->>'enabled' = 'true' 
        AND rps.settings->'gateways'->'stripe'->>'setup_complete' = 'true'
        THEN '✅ Stripe configurado'
        ELSE '❌ Stripe no configurado'
    END as stripe_status
FROM restaurants r
LEFT JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
WHERE r.is_active = true
ORDER BY r.name;

