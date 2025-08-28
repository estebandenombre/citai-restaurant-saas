-- Script para añadir función de eliminación de claves de pago
-- Ejecutar en Supabase SQL Editor

-- Función para eliminar claves de pago de un gateway específico
CREATE OR REPLACE FUNCTION delete_payment_gateway_keys(
    restaurant_uuid UUID,
    gateway_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_settings JSONB;
    updated_settings JSONB;
    gateway_config JSONB;
    keys_existed BOOLEAN := FALSE;
BEGIN
    -- Obtener configuración actual
    SELECT settings INTO current_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    IF current_settings IS NULL THEN
        RAISE NOTICE 'No payment settings found for restaurant %', restaurant_uuid;
        RETURN FALSE;
    END IF;
    
    -- Verificar que el gateway existe en la configuración
    IF NOT (current_settings->'gateways' ? gateway_id) THEN
        RAISE NOTICE 'Gateway % not found in payment settings', gateway_id;
        RETURN FALSE;
    END IF;
    
    -- Obtener configuración del gateway
    gateway_config := current_settings->'gateways'->gateway_id;
    
    -- Verificar si había claves para eliminar
    IF (gateway_config->>'public_key' != '' AND gateway_config->>'public_key' IS NOT NULL) OR
       (gateway_config->>'secret_key' != '' AND gateway_config->>'secret_key' IS NOT NULL) THEN
        keys_existed := TRUE;
        RAISE NOTICE 'Found keys to delete for gateway % in restaurant %', gateway_id, restaurant_uuid;
    ELSE
        RAISE NOTICE 'No keys found for gateway % in restaurant %', gateway_id, restaurant_uuid;
        RETURN TRUE; -- No hay claves que eliminar, pero no es un error
    END IF;
    
    -- Crear configuración actualizada con claves completamente limpias
    updated_settings := jsonb_set(
        current_settings,
        ARRAY['gateways', gateway_id],
        jsonb_build_object(
            'id', gateway_config->>'id',
            'name', gateway_config->>'name',
            'enabled', 'false',
            'test_mode', gateway_config->>'test_mode',
            'public_key', '',
            'secret_key', '',
            'webhook_url', COALESCE(gateway_config->>'webhook_url', ''),
            'supported_methods', gateway_config->'supported_methods',
            'processing_fee', gateway_config->>'processing_fee',
            'setup_complete', 'false'
        )
    );
    
    -- Guardar configuración actualizada
    UPDATE restaurant_payment_settings
    SET settings = updated_settings,
        updated_at = NOW()
    WHERE restaurant_id = restaurant_uuid;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        RAISE NOTICE 'Payment keys successfully deleted for gateway % in restaurant %', gateway_id, restaurant_uuid;
        
        -- Verificar que las claves fueron realmente eliminadas
        SELECT settings->'gateways'->gateway_id->>'public_key' = '' AND 
               settings->'gateways'->gateway_id->>'secret_key' = ''
        INTO keys_existed
        FROM restaurant_payment_settings
        WHERE restaurant_id = restaurant_uuid;
        
        IF keys_existed THEN
            RAISE NOTICE 'Verification: Keys successfully removed from database';
        ELSE
            RAISE NOTICE 'WARNING: Keys may not have been completely removed';
        END IF;
        
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Failed to update payment settings for restaurant %', restaurant_uuid;
        RETURN FALSE;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting payment keys: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para eliminar todas las claves de pago de un restaurante
CREATE OR REPLACE FUNCTION clear_all_payment_keys(restaurant_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_settings JSONB;
    updated_settings JSONB;
    gateway_name TEXT;
    gateway_config JSONB;
    keys_found BOOLEAN := FALSE;
    keys_cleared BOOLEAN := FALSE;
BEGIN
    -- Obtener configuración actual
    SELECT settings INTO current_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    IF current_settings IS NULL THEN
        RAISE NOTICE 'No payment settings found for restaurant %', restaurant_uuid;
        RETURN FALSE;
    END IF;
    
    -- Verificar si hay claves para eliminar
    FOR gateway_name, gateway_config IN 
        SELECT * FROM jsonb_each(current_settings->'gateways')
    LOOP
        IF (gateway_config->>'public_key' != '' AND gateway_config->>'public_key' IS NOT NULL) OR
           (gateway_config->>'secret_key' != '' AND gateway_config->>'secret_key' IS NOT NULL) THEN
            keys_found := TRUE;
            RAISE NOTICE 'Found keys in gateway % for restaurant %', gateway_name, restaurant_uuid;
        END IF;
    END LOOP;
    
    IF NOT keys_found THEN
        RAISE NOTICE 'No payment keys found to clear for restaurant %', restaurant_uuid;
        RETURN TRUE; -- No hay claves que eliminar, pero no es un error
    END IF;
    
    -- Crear configuración base con pagos deshabilitados
    updated_settings := jsonb_set(
        current_settings,
        '{payments_enabled}',
        'false'
    );
    
    -- Limpiar claves de todos los gateways
    FOR gateway_name, gateway_config IN 
        SELECT * FROM jsonb_each(current_settings->'gateways')
    LOOP
        updated_settings := jsonb_set(
            updated_settings,
            ARRAY['gateways', gateway_name],
            jsonb_build_object(
                'id', gateway_config->>'id',
                'name', gateway_config->>'name',
                'enabled', 'false',
                'test_mode', gateway_config->>'test_mode',
                'public_key', '',
                'secret_key', '',
                'webhook_url', COALESCE(gateway_config->>'webhook_url', ''),
                'supported_methods', gateway_config->'supported_methods',
                'processing_fee', gateway_config->>'processing_fee',
                'setup_complete', 'false'
            )
        );
        RAISE NOTICE 'Cleared keys for gateway %', gateway_name;
    END LOOP;
    
    -- Guardar configuración actualizada
    UPDATE restaurant_payment_settings
    SET settings = updated_settings,
        updated_at = NOW()
    WHERE restaurant_id = restaurant_uuid;
    
    -- Verificar que la actualización fue exitosa
    IF FOUND THEN
        RAISE NOTICE 'All payment keys successfully cleared for restaurant %', restaurant_uuid;
        
        -- Verificar que todas las claves fueron realmente eliminadas
        SELECT NOT EXISTS (
            SELECT 1 
            FROM jsonb_each(updated_settings->'gateways') AS g(name, config)
            WHERE (config->>'public_key' != '' AND config->>'public_key' IS NOT NULL) OR
                  (config->>'secret_key' != '' AND config->>'secret_key' IS NOT NULL)
        ) INTO keys_cleared;
        
        IF keys_cleared THEN
            RAISE NOTICE 'Verification: All keys successfully removed from database';
        ELSE
            RAISE NOTICE 'WARNING: Some keys may not have been completely removed';
        END IF;
        
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Failed to update payment settings for restaurant %', restaurant_uuid;
        RETURN FALSE;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error clearing payment keys: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un restaurante tiene claves de pago configuradas
CREATE OR REPLACE FUNCTION has_payment_keys_configured(restaurant_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    payment_settings JSONB;
    gateway_config JSONB;
    gateway_name TEXT;
BEGIN
    -- Obtener configuración de pago
    SELECT settings INTO payment_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    IF payment_settings IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar si algún gateway tiene claves configuradas
    FOR gateway_name, gateway_config IN 
        SELECT * FROM jsonb_each(payment_settings->'gateways')
    LOOP
        IF (gateway_config->>'public_key' != '' AND gateway_config->>'public_key' IS NOT NULL) OR
           (gateway_config->>'secret_key' != '' AND gateway_config->>'secret_key' IS NOT NULL) THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener lista de gateways con claves configuradas
CREATE OR REPLACE FUNCTION get_gateways_with_keys(restaurant_uuid UUID)
RETURNS TEXT[] AS $$
DECLARE
    payment_settings JSONB;
    gateway_config JSONB;
    gateway_name TEXT;
    gateways_with_keys TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Obtener configuración de pago
    SELECT settings INTO payment_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    IF payment_settings IS NULL THEN
        RETURN gateways_with_keys;
    END IF;
    
    -- Verificar cada gateway
    FOR gateway_name, gateway_config IN 
        SELECT * FROM jsonb_each(payment_settings->'gateways')
    LOOP
        IF (gateway_config->>'public_key' != '' AND gateway_config->>'public_key' IS NOT NULL) OR
           (gateway_config->>'secret_key' != '' AND gateway_config->>'secret_key' IS NOT NULL) THEN
            gateways_with_keys := array_append(gateways_with_keys, gateway_name);
        END IF;
    END LOOP;
    
    RETURN gateways_with_keys;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentar las funciones
COMMENT ON FUNCTION delete_payment_gateway_keys(UUID, TEXT) IS 
'Delete payment keys for a specific gateway in a restaurant. Returns true if successful.';

COMMENT ON FUNCTION clear_all_payment_keys(UUID) IS 
'Clear all payment keys for a restaurant and disable all gateways. Returns true if successful.';

COMMENT ON FUNCTION has_payment_keys_configured(UUID) IS 
'Check if a restaurant has any payment keys configured. Returns true if any gateway has keys.';

COMMENT ON FUNCTION get_gateways_with_keys(UUID) IS 
'Get list of gateway names that have payment keys configured for a restaurant.';

-- Verificar que las funciones se crearon correctamente
SELECT 
    'Functions created successfully:' as info;

SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN (
    'delete_payment_gateway_keys',
    'clear_all_payment_keys', 
    'has_payment_keys_configured',
    'get_gateways_with_keys'
)
ORDER BY proname;
