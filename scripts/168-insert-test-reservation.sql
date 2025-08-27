-- Script para insertar una reserva de prueba
-- Ejecutar en Supabase SQL Editor

-- 1. Primero verificar la estructura de la tabla reservations
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;

-- 2. Obtener un restaurant_id válido para la prueba
SELECT 
  'Restaurants disponibles:' as info;

SELECT 
  id,
  name,
  slug,
  is_active
FROM restaurants 
WHERE is_active = true
LIMIT 3;

-- 3. Insertar una reserva de prueba
-- Reemplaza 'RESTAURANT_ID_AQUI' con un ID real de la consulta anterior
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
) VALUES (
  -- Reemplaza este UUID con uno real de la consulta anterior
  'RESTAURANT_ID_AQUI',
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
) RETURNING *;

-- 4. Verificar que la reserva se insertó correctamente
SELECT 
  'Reserva insertada:' as info;

SELECT 
  id,
  restaurant_id,
  customer_name,
  customer_email,
  customer_phone,
  party_size,
  reservation_date,
  reservation_time,
  status,
  created_at
FROM reservations 
ORDER BY created_at DESC 
LIMIT 1;

-- 5. Insertar múltiples reservas de prueba (opcional)
-- Descomenta y ejecuta si quieres más datos de prueba

/*
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
) VALUES 
  ('RESTAURANT_ID_AQUI', 'María García', 'maria.garcia@email.com', '+34623456789', 2, '2025-01-16', '20:00:00', 'Sin gluten', 'quiet', 'pending', NOW(), NOW()),
  ('RESTAURANT_ID_AQUI', 'Carlos López', 'carlos.lopez@email.com', '+34634567890', 6, '2025-01-17', '21:00:00', 'Celebración de cumpleaños', 'large', 'confirmed', NOW(), NOW()),
  ('RESTAURANT_ID_AQUI', 'Ana Martínez', 'ana.martinez@email.com', '+34645678901', 3, '2025-01-18', '19:00:00', NULL, 'any', 'confirmed', NOW(), NOW()),
  ('RESTAURANT_ID_AQUI', 'Luis Rodríguez', 'luis.rodriguez@email.com', '+34656789012', 8, '2025-01-19', '20:30:00', 'Grupo grande, mesa redonda preferible', 'large', 'pending', NOW(), NOW());

-- Verificar todas las reservas
SELECT 
  id,
  restaurant_id,
  customer_name,
  party_size,
  reservation_date,
  reservation_time,
  status,
  created_at
FROM reservations 
ORDER BY created_at DESC 
LIMIT 10;
*/



