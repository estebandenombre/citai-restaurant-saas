-- Script para probar la configuración de emails
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que el campo email_settings existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
  AND column_name = 'email_settings';

-- 2. Verificar configuración actual de todos los restaurantes
SELECT 
  id,
  name,
  email_settings,
  CASE 
    WHEN (email_settings->>'enabled')::boolean = true THEN '✅ Habilitado'
    ELSE '❌ Deshabilitado'
  END as email_status,
  CASE 
    WHEN (email_settings->>'send_confirmation')::boolean = true THEN '✅ Sí'
    ELSE '❌ No'
  END as confirmation_emails,
  CASE 
    WHEN (email_settings->>'send_status_updates')::boolean = true THEN '✅ Sí'
    ELSE '❌ No'
  END as status_updates
FROM restaurants
ORDER BY name;

-- 3. Probar función de actualización de configuración
-- Habilitar emails para el primer restaurante
SELECT update_restaurant_email_settings(
  (SELECT id FROM restaurants LIMIT 1),
  true,  -- enabled
  true,  -- send_confirmation
  true   -- send_status_updates
);

-- 4. Verificar que se actualizó correctamente
SELECT 
  name,
  email_settings,
  CASE 
    WHEN (email_settings->>'enabled')::boolean = true THEN '✅ Habilitado'
    ELSE '❌ Deshabilitado'
  END as email_status
FROM restaurants
WHERE id = (SELECT id FROM restaurants LIMIT 1);

-- 5. Probar función de obtención de configuración
SELECT 
  name,
  get_restaurant_email_settings(id) as settings
FROM restaurants
LIMIT 3;

-- 6. Mostrar estadísticas de configuración
SELECT 
  'Configuración de Emails por Restaurante' as info,
  COUNT(*) as total_restaurants,
  COUNT(CASE WHEN (email_settings->>'enabled')::boolean = true THEN 1 END) as emails_enabled,
  COUNT(CASE WHEN (email_settings->>'enabled')::boolean = false THEN 1 END) as emails_disabled,
  COUNT(CASE WHEN (email_settings->>'send_confirmation')::boolean = true THEN 1 END) as confirmation_enabled,
  COUNT(CASE WHEN (email_settings->>'send_status_updates')::boolean = true THEN 1 END) as status_updates_enabled
FROM restaurants;
