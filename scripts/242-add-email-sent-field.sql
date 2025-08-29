-- Script para agregar campo email_sent a la tabla orders
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campo email_sent a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;

-- 2. Agregar comentario al campo
COMMENT ON COLUMN orders.email_sent IS 'Indica si se envió email de confirmación al cliente';

-- 3. Crear índice para mejorar consultas por email_sent
CREATE INDEX IF NOT EXISTS idx_orders_email_sent ON orders(email_sent);

-- 4. Actualizar registros existentes (opcional)
-- Marcar como true los pedidos que tienen email de cliente
UPDATE orders 
SET email_sent = true 
WHERE customer_email IS NOT NULL 
  AND customer_email != '';

-- 5. Mostrar estadísticas
SELECT 
  'Email sending statistics' as info,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN customer_email IS NOT NULL AND customer_email != '' THEN 1 END) as orders_with_email,
  COUNT(CASE WHEN email_sent = true THEN 1 END) as emails_sent,
  COUNT(CASE WHEN customer_email IS NOT NULL AND customer_email != '' AND email_sent = false THEN 1 END) as pending_emails
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days';
