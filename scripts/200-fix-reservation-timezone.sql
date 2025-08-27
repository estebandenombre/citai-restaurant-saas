-- Script para verificar y corregir fechas de reservas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla reservations
SELECT 
  'Estructura de la tabla reservations:' as info;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;

-- 2. Verificar fechas de reservas existentes
SELECT 
  'Fechas de reservas existentes:' as info;

SELECT 
  id,
  customer_name,
  reservation_date,
  reservation_time,
  status,
  created_at
FROM reservations 
ORDER BY reservation_date DESC, reservation_time DESC
LIMIT 10;

-- 3. Verificar si hay fechas con problemas de zona horaria
SELECT 
  'Verificando fechas problemáticas:' as info;

SELECT 
  id,
  customer_name,
  reservation_date,
  reservation_time,
  status,
  created_at,
  CASE 
    WHEN reservation_date::date != (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'local')::date 
    THEN 'Posible problema de zona horaria'
    ELSE 'OK'
  END as timezone_check
FROM reservations 
WHERE created_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Mostrar estadísticas de reservas por fecha
SELECT 
  'Estadísticas de reservas por fecha:' as info;

SELECT 
  reservation_date,
  COUNT(*) as total_reservations,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM reservations 
GROUP BY reservation_date
ORDER BY reservation_date DESC
LIMIT 10;

-- 5. Verificar reservas de hoy (ajustar la fecha según sea necesario)
SELECT 
  'Reservas para hoy (2024-09-05):' as info;

SELECT 
  id,
  customer_name,
  reservation_date,
  reservation_time,
  party_size,
  status
FROM reservations 
WHERE reservation_date = '2024-09-05'
ORDER BY reservation_time;

-- 6. Función helper para formatear fechas correctamente
CREATE OR REPLACE FUNCTION format_date_local(date_input DATE)
RETURNS TEXT AS $$
BEGIN
  RETURN to_char(date_input, 'YYYY-MM-DD');
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar que la función funciona correctamente
SELECT 
  'Probando función de formateo:' as info;

SELECT 
  reservation_date,
  format_date_local(reservation_date::date) as formatted_date
FROM reservations 
LIMIT 5;



