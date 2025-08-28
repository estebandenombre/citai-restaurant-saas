-- Crear funciones para el sistema de pagos
-- Ejecutar en Supabase SQL Editor

-- 1. Función para obtener configuraciones de pago de un restaurante
CREATE OR REPLACE FUNCTION get_restaurant_payment_settings(restaurant_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    payment_settings JSONB;
BEGIN
    -- Obtener configuración de pagos del restaurante
    SELECT settings INTO payment_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    -- Si no existe configuración, crear una por defecto
    IF payment_settings IS NULL THEN
        payment_settings := '{
            "payments_enabled": false,
            "require_payment": false,
            "allow_cash": true,
            "allow_card": false,
            "allow_apple_pay": false,
            "allow_google_pay": false,
            "auto_capture": true,
            "gateways": {
                "stripe": {
                    "id": "stripe",
                    "name": "Stripe",
                    "enabled": false,
                    "test_mode": true,
                    "public_key": "",
                    "secret_key": "",
                    "webhook_url": "",
                    "supported_methods": ["card", "apple_pay", "google_pay"],
                    "processing_fee": 2.9,
                    "setup_complete": false
                },
                "paypal": {
                    "id": "paypal",
                    "name": "PayPal",
                    "enabled": false,
                    "test_mode": true,
                    "public_key": "",
                    "secret_key": "",
                    "webhook_url": "",
                    "supported_methods": ["card", "paypal"],
                    "processing_fee": 2.9,
                    "setup_complete": false
                },
                "apple_pay": {
                    "id": "apple_pay",
                    "name": "Apple Pay",
                    "enabled": false,
                    "test_mode": true,
                    "public_key": "",
                    "secret_key": "",
                    "webhook_url": "",
                    "supported_methods": ["apple_pay"],
                    "processing_fee": 0,
                    "setup_complete": false
                }
            }
        }'::jsonb;
        
        -- Insertar configuración por defecto
        INSERT INTO restaurant_payment_settings (restaurant_id, settings)
        VALUES (restaurant_uuid, payment_settings)
        ON CONFLICT (restaurant_id) DO NOTHING;
    END IF;
    
    RETURN payment_settings;
END;
$$;

-- 2. Función para guardar configuraciones de pago
CREATE OR REPLACE FUNCTION save_restaurant_payment_settings(restaurant_uuid UUID, new_settings JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validar que el restaurante existe
    IF NOT EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_uuid) THEN
        RAISE EXCEPTION 'Restaurant not found';
    END IF;
    
    -- Validar estructura de configuración
    IF NOT (new_settings ? 'payments_enabled' AND new_settings ? 'gateways') THEN
        RAISE EXCEPTION 'Invalid payment settings structure';
    END IF;
    
    -- Insertar o actualizar configuración
    INSERT INTO restaurant_payment_settings (restaurant_id, settings)
    VALUES (restaurant_uuid, new_settings)
    ON CONFLICT (restaurant_id) 
    DO UPDATE SET 
        settings = new_settings,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- 3. Función para validar configuraciones de pago
CREATE OR REPLACE FUNCTION validate_payment_settings(restaurant_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    payment_settings JSONB;
    validation_result JSONB;
    stripe_config JSONB;
    paypal_config JSONB;
BEGIN
    -- Obtener configuración actual
    SELECT get_restaurant_payment_settings(restaurant_uuid) INTO payment_settings;
    
    -- Inicializar resultado
    validation_result := '{"valid": true, "errors": [], "warnings": []}'::jsonb;
    
    -- Validar Stripe
    stripe_config := payment_settings->'gateways'->'stripe';
    IF (stripe_config->>'enabled')::boolean = true THEN
        -- Verificar que tenga claves configuradas
        IF (stripe_config->>'public_key')::text = '' OR (stripe_config->>'secret_key')::text = '' THEN
            validation_result := jsonb_set(validation_result, '{valid}', 'false');
            validation_result := jsonb_set(validation_result, '{errors}', 
                validation_result->'errors' || '"Stripe enabled but missing API keys"');
        END IF;
        
        -- Verificar que setup_complete sea true si está habilitado
        IF (stripe_config->>'setup_complete')::boolean = false THEN
            validation_result := jsonb_set(validation_result, '{warnings}', 
                validation_result->'warnings' || '"Stripe enabled but setup not complete"');
        END IF;
    END IF;
    
    -- Validar PayPal
    paypal_config := payment_settings->'gateways'->'paypal';
    IF (paypal_config->>'enabled')::boolean = true THEN
        -- Verificar que tenga claves configuradas
        IF (paypal_config->>'public_key')::text = '' OR (paypal_config->>'secret_key')::text = '' THEN
            validation_result := jsonb_set(validation_result, '{valid}', 'false');
            validation_result := jsonb_set(validation_result, '{errors}', 
                validation_result->'errors' || '"PayPal enabled but missing API keys"');
        END IF;
        
        -- Verificar que setup_complete sea true si está habilitado
        IF (paypal_config->>'setup_complete')::boolean = false THEN
            validation_result := jsonb_set(validation_result, '{warnings}', 
                validation_result->'warnings' || '"PayPal enabled but setup not complete"');
        END IF;
    END IF;
    
    RETURN validation_result;
END;
$$;

-- 4. Función para verificar si un restaurante tiene pagos habilitados
CREATE OR REPLACE FUNCTION has_payments_enabled(restaurant_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    payment_settings JSONB;
    stripe_enabled BOOLEAN;
    paypal_enabled BOOLEAN;
    stripe_complete BOOLEAN;
    paypal_complete BOOLEAN;
BEGIN
    -- Obtener configuración
    SELECT get_restaurant_payment_settings(restaurant_uuid) INTO payment_settings;
    
    -- Verificar si pagos están habilitados
    IF (payment_settings->>'payments_enabled')::boolean = false THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar Stripe
    stripe_enabled := (payment_settings->'gateways'->'stripe'->>'enabled')::boolean;
    stripe_complete := (payment_settings->'gateways'->'stripe'->>'setup_complete')::boolean;
    
    -- Verificar PayPal
    paypal_enabled := (payment_settings->'gateways'->'paypal'->>'enabled')::boolean;
    paypal_complete := (payment_settings->'gateways'->'paypal'->>'setup_complete')::boolean;
    
    -- Retornar true si al menos un gateway está habilitado y configurado
    RETURN (stripe_enabled AND stripe_complete) OR (paypal_enabled AND paypal_complete);
END;
$$;

-- 5. Verificar que las funciones se crearon correctamente
SELECT 
    'get_restaurant_payment_settings' as function_name,
    CASE 
        WHEN EXISTS (SELECT FROM pg_proc WHERE proname = 'get_restaurant_payment_settings') 
        THEN '✅ Creada'
        ELSE '❌ Error'
    END as status
UNION ALL
SELECT 
    'save_restaurant_payment_settings' as function_name,
    CASE 
        WHEN EXISTS (SELECT FROM pg_proc WHERE proname = 'save_restaurant_payment_settings') 
        THEN '✅ Creada'
        ELSE '❌ Error'
    END as status
UNION ALL
SELECT 
    'validate_payment_settings' as function_name,
    CASE 
        WHEN EXISTS (SELECT FROM pg_proc WHERE proname = 'validate_payment_settings') 
        THEN '✅ Creada'
        ELSE '❌ Error'
    END as status
UNION ALL
SELECT 
    'has_payments_enabled' as function_name,
    CASE 
        WHEN EXISTS (SELECT FROM pg_proc WHERE proname = 'has_payments_enabled') 
        THEN '✅ Creada'
        ELSE '❌ Error'
    END as status;

