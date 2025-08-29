-- Script para agregar configuración de emails a la tabla restaurants
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campos de configuración de email
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT '{"enabled": false, "send_confirmation": true, "send_status_updates": true}'::jsonb;

-- 2. Agregar comentario al campo
COMMENT ON COLUMN restaurants.email_settings IS 'Configuración de emails automáticos del restaurante';

-- 3. Crear función para actualizar configuración de email
CREATE OR REPLACE FUNCTION update_restaurant_email_settings(
  restaurant_id UUID,
  email_enabled BOOLEAN,
  send_confirmation BOOLEAN DEFAULT true,
  send_status_updates BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
BEGIN
  UPDATE restaurants 
  SET email_settings = jsonb_build_object(
    'enabled', email_enabled,
    'send_confirmation', send_confirmation,
    'send_status_updates', send_status_updates
  ),
  updated_at = NOW()
  WHERE id = restaurant_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear función para obtener configuración de email
CREATE OR REPLACE FUNCTION get_restaurant_email_settings(restaurant_id UUID)
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
BEGIN
  SELECT email_settings INTO settings
  FROM restaurants 
  WHERE id = restaurant_id;
  
  RETURN COALESCE(settings, '{"enabled": false, "send_confirmation": true, "send_status_updates": true}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 5. Actualizar restaurantes existentes con configuración por defecto
UPDATE restaurants 
SET email_settings = '{"enabled": false, "send_confirmation": true, "send_status_updates": true}'::jsonb
WHERE email_settings IS NULL;

-- 6. Mostrar configuración actual
SELECT 
  id,
  name,
  email_settings,
  CASE 
    WHEN (email_settings->>'enabled')::boolean = true THEN '✅ Habilitado'
    ELSE '❌ Deshabilitado'
  END as email_status
FROM restaurants
ORDER BY name;
