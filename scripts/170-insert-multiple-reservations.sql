-- Script para insertar múltiples reservas de prueba
-- Ejecutar en Supabase SQL Editor

-- Insertar múltiples reservas usando el primer restaurante activo disponible
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
  customer_name,
  customer_email,
  customer_phone,
  party_size,
  reservation_date,
  reservation_time,
  special_requests,
  table_preference,
  status,
  NOW(),
  NOW()
FROM first_restaurant fr
CROSS JOIN (
  VALUES 
    ('María García', 'maria.garcia@email.com', '+34623456789', 2, '2025-01-16', '20:00:00', 'Sin gluten', 'quiet', 'pending'),
    ('Carlos López', 'carlos.lopez@email.com', '+34634567890', 6, '2025-01-17', '21:00:00', 'Celebración de cumpleaños', 'large', 'confirmed'),
    ('Ana Martínez', 'ana.martinez@email.com', '+34645678901', 3, '2025-01-18', '19:00:00', NULL, 'any', 'confirmed'),
    ('Luis Rodríguez', 'luis.rodriguez@email.com', '+34656789012', 8, '2025-01-19', '20:30:00', 'Grupo grande, mesa redonda preferible', 'large', 'pending'),
    ('Sofia Torres', 'sofia.torres@email.com', '+34667890123', 2, '2025-01-20', '19:00:00', 'Primera cita', 'romantic', 'confirmed'),
    ('Miguel Ruiz', 'miguel.ruiz@email.com', '+34678901234', 4, '2025-01-21', '20:00:00', 'Alergia a mariscos', 'any', 'pending'),
    ('Elena Moreno', 'elena.moreno@email.com', '+34689012345', 5, '2025-01-22', '21:00:00', 'Cena de empresa', 'business', 'confirmed'),
    ('David Jiménez', 'david.jimenez@email.com', '+34690123456', 3, '2025-01-23', '19:30:00', NULL, 'window', 'confirmed')
) AS reservation_data (
  customer_name, customer_email, customer_phone, party_size, 
  reservation_date, reservation_time, special_requests, table_preference, status
)
RETURNING *;

-- Verificar todas las reservas insertadas
SELECT 
  'Reservas insertadas exitosamente:' as info;

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
LIMIT 10;

-- Mostrar estadísticas de las reservas
SELECT 
  'Estadísticas de reservas:' as info;

SELECT 
  COUNT(*) as total_reservations,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  AVG(party_size) as avg_party_size,
  MIN(reservation_date) as earliest_date,
  MAX(reservation_date) as latest_date
FROM reservations;



