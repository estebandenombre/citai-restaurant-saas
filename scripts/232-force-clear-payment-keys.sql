-- Script para forzar la eliminación de claves de pago
-- Usar solo si las funciones normales no funcionan correctamente
-- Ejecutar en Supabase SQL Editor

-- Función para forzar la eliminación de claves de pago
CREATE OR REPLACE FUNCTION force_clear_payment_keys(restaurant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    current_settings JSONB;
    updated_settings JSONB;
    gateway_name TEXT;
    gateway_config JSONB;
    keys_cleared_count INTEGER := 0;
    total_gateways INTEGER := 0;
BEGIN
    -- Obtener configuración actual
    SELECT settings INTO current_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    IF current_settings IS NULL THEN
        RETURN format('No payment settings found for restaurant %s', restaurant_uuid);
    END IF;
    
    -- Contar gateways y claves
    FOR gateway_name, gateway_config IN 
        SELECT * FROM jsonb_each(current_settings->'gateways')
    LOOP
        total_gateways := total_gateways + 1;
        
        IF (gateway_config->>'public_key' != '' AND gateway_config->>'public_key' IS NOT NULL) OR
           (gateway_config->>'secret_key' != '' AND gateway_config->>'secret_key' IS NOT NULL) THEN
            keys_cleared_count := keys_cleared_count + 1;
            RAISE NOTICE 'Found keys in gateway %', gateway_name;
        END IF;
    END LOOP;
    
    -- Crear configuración completamente limpia
    updated_settings := jsonb_build_object(
        'payments_enabled', false,
        'require_payment', false,
        'allow_cash', true,
        'allow_card', false,
        'allow_apple_pay', false,
        'allow_google_pay', false,
        'auto_capture', true,
        'gateways', jsonb_build_object(
            'stripe', jsonb_build_object(
                'id', 'stripe',
                'name', 'Stripe',
                'enabled', false,
                'test_mode', true,
                'public_key', '',
                'secret_key', '',
                'webhook_url', '',
                'supported_methods', '["card", "apple_pay", "google_pay"]'::jsonb,
                'processing_fee', 2.9,
                'setup_complete', false
            ),
            'paypal', jsonb_build_object(
                'id', 'paypal',
                'name', 'PayPal',
                'enabled', false,
                'test_mode', true,
                'public_key', '',
                'secret_key', '',
                'webhook_url', '',
                'supported_methods', '["card", "paypal"]'::jsonb,
                'processing_fee', 2.9,
                'setup_complete', false
            ),
            'apple_pay', jsonb_build_object(
                'id', 'apple_pay',
                'name', 'Apple Pay',
                'enabled', false,
                'test_mode', true,
                'public_key', '',
                'secret_key', '',
                'webhook_url', '',
                'supported_methods', '["apple_pay"]'::jsonb,
                'processing_fee', 0,
                'setup_complete', false
            )
        )
    );
    
    -- Actualizar la base de datos
    UPDATE restaurant_payment_settings
    SET settings = updated_settings,
        updated_at = NOW()
    WHERE restaurant_id = restaurant_uuid;
    
    IF FOUND THEN
        RETURN format(
            'Successfully cleared payment keys for restaurant %s. Cleared %s gateways with keys out of %s total gateways.',
            restaurant_uuid,
            keys_cleared_count,
            total_gateways
        );
    ELSE
        RETURN format('Failed to update payment settings for restaurant %s', restaurant_uuid);
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN format('Error clearing payment keys: %s', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar el estado de las claves después de la limpieza
CREATE OR REPLACE FUNCTION verify_payment_keys_cleared(restaurant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    payment_settings JSONB;
    gateway_name TEXT;
    gateway_config JSONB;
    keys_found BOOLEAN := FALSE;
    keys_info TEXT := '';
BEGIN
    -- Obtener configuración actual
    SELECT settings INTO payment_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    IF payment_settings IS NULL THEN
        RETURN format('No payment settings found for restaurant %s', restaurant_uuid);
    END IF;
    
    -- Verificar cada gateway
    FOR gateway_name, gateway_config IN 
        SELECT * FROM jsonb_each(payment_settings->'gateways')
    LOOP
        IF (gateway_config->>'public_key' != '' AND gateway_config->>'public_key' IS NOT NULL) OR
           (gateway_config->>'secret_key' != '' AND gateway_config->>'secret_key' IS NOT NULL) THEN
            keys_found := TRUE;
            keys_info := keys_info || format('Gateway %s has keys: public_key="%s", secret_key="%s"', 
                gateway_name, 
                gateway_config->>'public_key', 
                gateway_config->>'secret_key'
            ) || E'\n';
        END IF;
    END LOOP;
    
    IF keys_found THEN
        RETURN format('WARNING: Keys still found in restaurant %s:\n%s', restaurant_uuid, keys_info);
    ELSE
        RETURN format('SUCCESS: All payment keys have been cleared for restaurant %s', restaurant_uuid);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejemplo de uso:
-- SELECT force_clear_payment_keys('restaurant-uuid-here');
-- SELECT verify_payment_keys_cleared('restaurant-uuid-here');

-- Verificar todas las configuraciones de pago
SELECT 
    'Current payment settings status:' as info;

SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    CASE 
        WHEN rps.settings IS NULL THEN 'NO CONFIG'
        WHEN has_payment_keys_configured(r.id) THEN 'HAS KEYS'
        ELSE 'NO KEYS'
    END as keys_status,
    get_gateways_with_keys(r.id) as gateways_with_keys,
    rps.updated_at
FROM restaurants r
LEFT JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
ORDER BY r.name
LIMIT 10;
