-- Script de prueba simple para verificar eliminación de claves de pago
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que la tabla existe
SELECT 
    'Verificando tabla restaurant_payment_settings:' as info;

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'restaurant_payment_settings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar configuraciones actuales
SELECT 
    'Configuraciones de pago actuales:' as info;

SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    CASE 
        WHEN rps.settings IS NULL THEN 'NO CONFIG'
        ELSE 'HAS CONFIG'
    END as config_status,
    rps.updated_at
FROM restaurants r
LEFT JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
ORDER BY r.name
LIMIT 5;

-- 3. Función simple para verificar claves
CREATE OR REPLACE FUNCTION check_payment_keys(restaurant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    payment_settings JSONB;
    gateway_name TEXT;
    gateway_config JSONB;
    keys_info TEXT := '';
    has_keys BOOLEAN := FALSE;
BEGIN
    -- Obtener configuración de pago
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
            has_keys := TRUE;
            keys_info := keys_info || format('Gateway %s has keys: public_key="%s", secret_key="%s"', 
                gateway_name, 
                gateway_config->>'public_key', 
                gateway_config->>'secret_key'
            ) || E'\n';
        END IF;
    END LOOP;
    
    IF has_keys THEN
        RETURN format('Keys found in restaurant %s:\n%s', restaurant_uuid, keys_info);
    ELSE
        RETURN format('No keys found in restaurant %s', restaurant_uuid);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Probar la función con un restaurante
SELECT 
    'Probando verificación de claves:' as info;

DO $$
DECLARE
    test_restaurant_id UUID;
    result TEXT;
BEGIN
    -- Obtener el primer restaurante disponible
    SELECT id INTO test_restaurant_id 
    FROM restaurants 
    LIMIT 1;
    
    IF test_restaurant_id IS NOT NULL THEN
        RAISE NOTICE 'Restaurante de prueba: %', test_restaurant_id;
        
        -- Probar la función
        SELECT check_payment_keys(test_restaurant_id) INTO result;
        RAISE NOTICE 'Resultado: %', result;
    ELSE
        RAISE NOTICE 'No se encontraron restaurantes para probar';
    END IF;
END $$;

-- 5. Función simple para limpiar claves manualmente
CREATE OR REPLACE FUNCTION manual_clear_gateway_keys(restaurant_uuid UUID, gateway_id TEXT)
RETURNS TEXT AS $$
DECLARE
    current_settings JSONB;
    updated_settings JSONB;
BEGIN
    -- Obtener configuración actual
    SELECT settings INTO current_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    IF current_settings IS NULL THEN
        RETURN format('No payment settings found for restaurant %s', restaurant_uuid);
    END IF;
    
    -- Verificar que el gateway existe
    IF NOT (current_settings->'gateways' ? gateway_id) THEN
        RETURN format('Gateway %s not found in payment settings', gateway_id);
    END IF;
    
    -- Crear configuración actualizada
    updated_settings := jsonb_set(
        current_settings,
        ARRAY['gateways', gateway_id],
        jsonb_build_object(
            'id', current_settings->'gateways'->gateway_id->>'id',
            'name', current_settings->'gateways'->gateway_id->>'name',
            'enabled', 'false',
            'test_mode', current_settings->'gateways'->gateway_id->>'test_mode',
            'public_key', '',
            'secret_key', '',
            'webhook_url', COALESCE(current_settings->'gateways'->gateway_id->>'webhook_url', ''),
            'supported_methods', current_settings->'gateways'->gateway_id->'supported_methods',
            'processing_fee', current_settings->'gateways'->gateway_id->>'processing_fee',
            'setup_complete', 'false'
        )
    );
    
    -- Actualizar la base de datos
    UPDATE restaurant_payment_settings
    SET settings = updated_settings,
        updated_at = NOW()
    WHERE restaurant_id = restaurant_uuid;
    
    IF FOUND THEN
        RETURN format('Successfully cleared keys for gateway %s in restaurant %s', gateway_id, restaurant_uuid);
    ELSE
        RETURN format('Failed to update payment settings for restaurant %s', restaurant_uuid);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Ejemplo de uso de la función manual
-- SELECT manual_clear_gateway_keys('restaurant-uuid-here', 'stripe');
-- SELECT check_payment_keys('restaurant-uuid-here');

-- 7. Limpiar funciones de prueba
-- DROP FUNCTION IF EXISTS check_payment_keys(UUID);
-- DROP FUNCTION IF EXISTS manual_clear_gateway_keys(UUID, TEXT);
