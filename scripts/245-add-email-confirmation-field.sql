-- Script para agregar campo send_confirmation_email a la tabla order_settings
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campo send_confirmation_email a la tabla order_settings
ALTER TABLE order_settings 
ADD COLUMN IF NOT EXISTS send_confirmation_email BOOLEAN DEFAULT false;

-- 2. Agregar comentario al campo
COMMENT ON COLUMN order_settings.send_confirmation_email IS 'Habilita el envío automático de emails de confirmación cuando require_email es true';

-- 3. Actualizar registros existentes
-- Si require_email es true, habilitar send_confirmation_email por defecto
UPDATE order_settings 
SET send_confirmation_email = true
WHERE require_email = true 
  AND send_confirmation_email IS NULL;

-- 4. Mostrar configuración actual
SELECT 
  restaurant_id,
  require_email,
  send_confirmation_email,
  CASE 
    WHEN require_email = true AND send_confirmation_email = true THEN '✅ Email + Confirmación'
    WHEN require_email = true AND send_confirmation_email = false THEN '📧 Solo Email'
    WHEN require_email = false THEN '❌ Sin Email'
  END as email_configuration
FROM order_settings
ORDER BY restaurant_id;

-- 5. Mostrar estadísticas
SELECT 
  'Configuración de Email en Order Settings' as info,
  COUNT(*) as total_settings,
  COUNT(CASE WHEN require_email = true THEN 1 END) as with_email,
  COUNT(CASE WHEN require_email = true AND send_confirmation_email = true THEN 1 END) as with_confirmation,
  COUNT(CASE WHEN require_email = true AND send_confirmation_email = false THEN 1 END) as email_only,
  COUNT(CASE WHEN require_email = false THEN 1 END) as without_email
FROM order_settings;