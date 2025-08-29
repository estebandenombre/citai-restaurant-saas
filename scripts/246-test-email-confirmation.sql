-- Script para probar la configuración de email de confirmación
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que el campo send_confirmation_email existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'order_settings' 
  AND column_name = 'send_confirmation_email';

-- 2. Mostrar configuración actual de todos los restaurantes
SELECT 
  os.restaurant_id,
  r.name as restaurant_name,
  os.require_email,
  os.send_confirmation_email,
  CASE 
    WHEN os.require_email = true AND os.send_confirmation_email = true THEN '✅ Email + Confirmación'
    WHEN os.require_email = true AND os.send_confirmation_email = false THEN '📧 Solo Email'
    WHEN os.require_email = false THEN '❌ Sin Email'
    ELSE '❓ No configurado'
  END as email_configuration
FROM order_settings os
LEFT JOIN restaurants r ON os.restaurant_id = r.id
ORDER BY r.name;

-- 3. Probar configuración para un restaurante específico
-- Habilitar email y confirmación para el primer restaurante
UPDATE order_settings 
SET require_email = true, send_confirmation_email = true
WHERE restaurant_id = (SELECT id FROM restaurants LIMIT 1);

-- 4. Verificar la configuración actualizada
SELECT 
  r.name as restaurant_name,
  os.require_email,
  os.send_confirmation_email,
  CASE 
    WHEN os.require_email = true AND os.send_confirmation_email = true THEN '✅ Email + Confirmación'
    WHEN os.require_email = true AND os.send_confirmation_email = false THEN '📧 Solo Email'
    WHEN os.require_email = false THEN '❌ Sin Email'
  END as email_configuration
FROM order_settings os
LEFT JOIN restaurants r ON os.restaurant_id = r.id
WHERE os.restaurant_id = (SELECT id FROM restaurants LIMIT 1);

-- 5. Mostrar estadísticas generales
SELECT 
  'Configuración de Email de Confirmación' as info,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN require_email = true THEN 1 END) as with_email,
  COUNT(CASE WHEN require_email = true AND send_confirmation_email = true THEN 1 END) as with_confirmation,
  COUNT(CASE WHEN require_email = true AND send_confirmation_email = false THEN 1 END) as email_only,
  COUNT(CASE WHEN require_email = false THEN 1 END) as without_email
FROM order_settings;

-- 6. Simular lógica de envío de email
SELECT 
  r.name as restaurant_name,
  os.require_email,
  os.send_confirmation_email,
  CASE 
    WHEN os.require_email = true AND os.send_confirmation_email = true THEN 'SÍ - Se enviará email de confirmación'
    WHEN os.require_email = true AND os.send_confirmation_email = false THEN 'NO - Solo se recopila email'
    WHEN os.require_email = false THEN 'NO - No se recopila email'
  END as email_sending_logic
FROM order_settings os
LEFT JOIN restaurants r ON os.restaurant_id = r.id
ORDER BY r.name;
