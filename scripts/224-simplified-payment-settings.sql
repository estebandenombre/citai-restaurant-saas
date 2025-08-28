-- Script simplificado para crear la tabla de configuraciones de pago
-- Solución optimizada con índices B-tree para boolean
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar extensión pg_trgm (opcional, para futuras necesidades)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Crear la tabla restaurant_payment_settings
CREATE TABLE IF NOT EXISTS restaurant_payment_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{
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
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones para garantizar integridad
    CONSTRAINT unique_restaurant_payment_settings UNIQUE (restaurant_id),
    CONSTRAINT valid_payment_settings CHECK (
        jsonb_typeof(settings) = 'object' AND
        settings ? 'payments_enabled' AND
        settings ? 'gateways' AND
        jsonb_typeof(settings->'gateways') = 'object'
    )
);

-- 3. Crear índices optimizados
-- Índice en restaurant_id (B-tree)
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_restaurant_id 
ON restaurant_payment_settings (restaurant_id);

-- Índice GIN en el campo JSONB completo
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_settings 
ON restaurant_payment_settings USING gin (settings);

-- Índice B-tree en el flag boolean (más eficiente que GIN para boolean)
DROP INDEX IF EXISTS idx_restaurant_payment_settings_payments_enabled;
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_settings_payments_enabled
ON restaurant_payment_settings (CAST(settings->>'payments_enabled' AS boolean));

-- 4. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_restaurant_payment_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_restaurant_payment_settings_updated_at 
ON restaurant_payment_settings;

CREATE TRIGGER trigger_update_restaurant_payment_settings_updated_at
    BEFORE UPDATE ON restaurant_payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_payment_settings_updated_at();

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE restaurant_payment_settings ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS para seguridad
-- Política para que los usuarios solo vean configuraciones de su restaurante
DROP POLICY IF EXISTS "Users can view their restaurant payment settings" ON restaurant_payment_settings;
CREATE POLICY "Users can view their restaurant payment settings"
ON restaurant_payment_settings
FOR SELECT
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- Política para que los usuarios solo inserten configuraciones para su restaurante
DROP POLICY IF EXISTS "Users can insert their restaurant payment settings" ON restaurant_payment_settings;
CREATE POLICY "Users can insert their restaurant payment settings"
ON restaurant_payment_settings
FOR INSERT
WITH CHECK (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- Política para que los usuarios solo actualicen configuraciones de su restaurante
DROP POLICY IF EXISTS "Users can update their restaurant payment settings" ON restaurant_payment_settings;
CREATE POLICY "Users can update their restaurant payment settings"
ON restaurant_payment_settings
FOR UPDATE
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM users 
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- Política para que los usuarios solo eliminen configuraciones de su restaurante
DROP POLICY IF EXISTS "Users can delete their restaurant payment settings" ON restaurant_payment_settings;
CREATE POLICY "Users can delete their restaurant payment settings"
ON restaurant_payment_settings
FOR DELETE
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- 8. Crear función para validar configuraciones de pago
CREATE OR REPLACE FUNCTION validate_payment_settings(settings_json JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    gateway JSONB;
    gateway_name TEXT;
BEGIN
    -- Verificar estructura básica
    IF NOT (settings_json ? 'payments_enabled' AND 
            settings_json ? 'gateways' AND 
            jsonb_typeof(settings_json->'gateways') = 'object') THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar cada gateway
    FOR gateway_name, gateway IN SELECT * FROM jsonb_each(settings_json->'gateways')
    LOOP
        -- Verificar que cada gateway tenga los campos requeridos
        IF NOT (gateway ? 'enabled' AND 
                gateway ? 'name' AND 
                gateway ? 'supported_methods' AND 
                jsonb_typeof(gateway->'supported_methods') = 'array') THEN
            RETURN FALSE;
        END IF;
        
        -- Si el gateway está habilitado, verificar que tenga las claves
        IF (gateway->>'enabled')::BOOLEAN THEN
            IF NOT (gateway ? 'public_key' AND gateway ? 'secret_key') THEN
                RETURN FALSE;
            END IF;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear función para obtener configuraciones de pago de un restaurante
CREATE OR REPLACE FUNCTION get_restaurant_payment_settings(restaurant_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    payment_settings JSONB;
BEGIN
    SELECT settings INTO payment_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    RETURN COALESCE(payment_settings, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Crear función para guardar configuraciones de pago de un restaurante
CREATE OR REPLACE FUNCTION save_restaurant_payment_settings(
    restaurant_uuid UUID,
    new_settings JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validar que el usuario tenga acceso al restaurante
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND restaurant_id = restaurant_uuid
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Validar la configuración
    IF NOT validate_payment_settings(new_settings) THEN
        RETURN FALSE;
    END IF;
    
    -- Insertar o actualizar la configuración
    INSERT INTO restaurant_payment_settings (restaurant_id, settings)
    VALUES (restaurant_uuid, new_settings)
    ON CONFLICT (restaurant_id)
    DO UPDATE SET 
        settings = new_settings,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Crear función para verificar si un restaurante tiene pagos habilitados
CREATE OR REPLACE FUNCTION restaurant_has_payments_enabled(restaurant_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    payment_settings JSONB;
BEGIN
    SELECT settings INTO payment_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    RETURN COALESCE((payment_settings->>'payments_enabled')::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Crear función para obtener métodos de pago disponibles
CREATE OR REPLACE FUNCTION get_available_payment_methods(restaurant_uuid UUID)
RETURNS TEXT[] AS $$
DECLARE
    payment_settings JSONB;
    methods TEXT[] := '{}';
BEGIN
    SELECT settings INTO payment_settings
    FROM restaurant_payment_settings
    WHERE restaurant_id = restaurant_uuid;
    
    -- Si no hay configuración, devolver array vacío
    IF payment_settings IS NULL THEN
        RETURN methods;
    END IF;
    
    -- Agregar métodos según la configuración
    IF (payment_settings->>'allow_cash')::BOOLEAN THEN
        methods := array_append(methods, 'cash');
    END IF;
    
    IF (payment_settings->>'allow_card')::BOOLEAN THEN
        methods := array_append(methods, 'card');
    END IF;
    
    IF (payment_settings->>'allow_apple_pay')::BOOLEAN THEN
        methods := array_append(methods, 'apple_pay');
    END IF;
    
    IF (payment_settings->>'allow_google_pay')::BOOLEAN THEN
        methods := array_append(methods, 'google_pay');
    END IF;
    
    RETURN methods;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Crear configuración por defecto para restaurantes existentes
INSERT INTO restaurant_payment_settings (restaurant_id, settings)
SELECT 
    r.id,
    '{
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
    }'::jsonb
FROM restaurants r
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_payment_settings rps 
    WHERE rps.restaurant_id = r.id
);

-- 14. Mostrar estadísticas finales
SELECT 
    'Estadísticas finales:' as info;

SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN rps.restaurant_id IS NOT NULL THEN 1 END) as restaurants_with_payment_settings,
    COUNT(CASE WHEN rps.restaurant_id IS NULL THEN 1 END) as restaurants_without_payment_settings
FROM restaurants r
LEFT JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id;

SELECT 
    'Configuraciones de pago habilitadas:' as info;

SELECT 
    COUNT(*) as total_payment_settings,
    COUNT(CASE WHEN (settings->>'payments_enabled')::BOOLEAN THEN 1 END) as payments_enabled,
    COUNT(CASE WHEN NOT (settings->>'payments_enabled')::BOOLEAN THEN 1 END) as payments_disabled
FROM restaurant_payment_settings;

-- 15. Verificar índices creados
SELECT 
    'Índices creados:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurant_payment_settings'
ORDER BY indexname;

-- 16. Mensaje de éxito
SELECT 
    '✅ Tabla restaurant_payment_settings creada exitosamente!' as success_message,
    '🔒 RLS habilitado con políticas de seguridad' as security_info,
    '📊 Configuraciones por defecto creadas para todos los restaurantes' as default_configs,
    '🚀 Índices B-tree optimizados para boolean' as index_info,
    '🎯 Listo para usar en la aplicación' as ready_status;
