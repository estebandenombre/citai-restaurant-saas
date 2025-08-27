-- Script para simplificar el sistema de trial
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que todos los usuarios existentes tienen created_at
SELECT 
  'Verificando usuarios existentes:' as info;

SELECT 
  id,
  email,
  created_at,
  CASE 
    WHEN created_at IS NULL THEN 'SIN FECHA'
    ELSE 'OK'
  END as status
FROM users
ORDER BY created_at DESC;

-- 2. Verificar cuántos días de trial tienen los usuarios existentes
SELECT 
  'Días de trial restantes para usuarios existentes:' as info;

SELECT 
  id,
  email,
  created_at,
  EXTRACT(EPOCH FROM (created_at + INTERVAL '14 days' - NOW())) / 86400 as dias_restantes,
  CASE 
    WHEN NOW() > (created_at + INTERVAL '14 days') THEN 'TRIAL EXPIRADO'
    ELSE 'TRIAL ACTIVO'
  END as estado_trial
FROM users
ORDER BY dias_restantes DESC;

-- 3. Crear función para calcular días restantes de trial
CREATE OR REPLACE FUNCTION get_trial_days_remaining(user_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  user_created_at TIMESTAMP;
  trial_end TIMESTAMP;
  days_remaining INTEGER;
BEGIN
  -- Obtener fecha de creación del usuario
  SELECT created_at INTO user_created_at
  FROM users
  WHERE email = user_email;
  
  IF user_created_at IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calcular fin del trial (14 días desde creación)
  trial_end := user_created_at + INTERVAL '14 days';
  
  -- Calcular días restantes
  days_remaining := EXTRACT(EPOCH FROM (trial_end - NOW())) / 86400;
  
  -- Retornar máximo entre 0 y días restantes
  RETURN GREATEST(0, days_remaining);
END;
$$ LANGUAGE plpgsql;

-- 4. Crear función para verificar si el trial ha expirado
CREATE OR REPLACE FUNCTION is_trial_expired(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_created_at TIMESTAMP;
  trial_end TIMESTAMP;
BEGIN
  -- Obtener fecha de creación del usuario
  SELECT created_at INTO user_created_at
  FROM users
  WHERE email = user_email;
  
  IF user_created_at IS NULL THEN
    RETURN TRUE; -- Si no hay fecha, considerar como expirado
  END IF;
  
  -- Calcular fin del trial (14 días desde creación)
  trial_end := user_created_at + INTERVAL '14 days';
  
  -- Retornar si ha expirado
  RETURN NOW() > trial_end;
END;
$$ LANGUAGE plpgsql;

-- 5. Probar las funciones con usuarios existentes
SELECT 
  'Probando funciones de trial:' as info;

SELECT 
  email,
  created_at,
  get_trial_days_remaining(email) as dias_restantes,
  is_trial_expired(email) as trial_expirado
FROM users
LIMIT 5;

-- 6. Verificar que no hay referencias a tablas eliminadas
SELECT 
  'Verificando que no hay referencias a user_subscriptions:' as info;

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name LIKE '%subscription%'
  OR column_name LIKE '%plan%';

-- 7. Resumen del sistema simplificado
SELECT 
  'SISTEMA DE TRIAL SIMPLIFICADO:' as info;

SELECT 
  '✓ Todos los usuarios nuevos tienen automáticamente 14 días de trial' as caracteristica
UNION ALL
SELECT 
  '✓ El trial se calcula basado en users.created_at' as caracteristica
UNION ALL
SELECT 
  '✓ No se necesitan tablas adicionales de suscripciones' as caracteristica
UNION ALL
SELECT 
  '✓ Para extender el trial, modificar users.created_at' as caracteristica
UNION ALL
SELECT 
  '✓ Para cambiar de plan, contactar al administrador' as caracteristica;



