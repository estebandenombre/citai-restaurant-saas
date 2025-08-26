-- Script simple para insertar una reserva de prueba
-- Ejecutar en Supabase SQL Editor

-- Insertar una reserva usando el primer restaurante activo disponible
WITH first_restaurant AS (
  SELECT id 
  FROM restaurants 
  WHERE is_active = true 
  LIMIT 1
)
INSERT INTO reservations (
  restaurant_id,
  customer_name,
  customer_email,
  customer_phone,
  party_size,
  reservation_date,
  reservation_time,
  special_requests,
  table_preference,
  status,
  created_at,
  updated_at
)
SELECT 
  fr.id,
  'Juan Pérez',
  'juan.perez@email.com',
  '+34612345678',
  4,
  '2025-01-15',
  '19:30:00',
  'Mesa cerca de la ventana si es posible',
  'window',
  'confirmed',
  NOW(),
  NOW()
FROM first_restaurant fr
RETURNING *;

-- Verificar que se insertó correctamente
SELECT 
  'Reserva insertada exitosamente:' as info;

SELECT 
  r.id,
  r.restaurant_id,
  r.customer_name,
  r.customer_email,
  r.customer_phone,
  r.party_size,
  r.reservation_date,
  r.reservation_time,
  r.status,
  r.created_at,
  rest.name as restaurant_name
FROM reservations r
JOIN restaurants rest ON r.restaurant_id = rest.id
ORDER BY r.created_at DESC 
LIMIT 1;


