-- Script para probar la integración de WhatsApp
-- Ejecutar en Supabase SQL Editor después de configurar WhatsApp

-- 1. Verificar que las tablas existen
SELECT 'Verificando tablas de WhatsApp...' as info;

SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Existe'
    ELSE '❌ No existe'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('whatsapp_conversations', 'whatsapp_messages', 'whatsapp_orders');

-- 2. Verificar configuración de restaurantes
SELECT 'Verificando configuración de WhatsApp en restaurantes...' as info;

SELECT 
  id,
  name,
  CASE 
    WHEN whatsapp_config IS NOT NULL THEN '✅ Configurado'
    ELSE '❌ Sin configurar'
  END as whatsapp_status,
  CASE 
    WHEN (whatsapp_config->>'enabled')::boolean = true THEN '✅ Habilitado'
    ELSE '❌ Deshabilitado'
  END as enabled_status,
  whatsapp_config->>'phone_number' as phone_number,
  whatsapp_config->>'business_name' as business_name
FROM restaurants
ORDER BY name;

-- 3. Insertar datos de prueba (solo si no existen)
SELECT 'Insertando datos de prueba...' as info;

-- Insertar conversación de prueba
INSERT INTO whatsapp_conversations (
  restaurant_id,
  customer_phone,
  customer_name,
  conversation_state,
  is_active
) 
SELECT 
  r.id,
  '+1234567890',
  'Cliente de Prueba',
  '{"current_step": "welcome", "order_data": {}, "context": {}}'::jsonb,
  true
FROM restaurants r
WHERE r.whatsapp_config IS NOT NULL
AND (r.whatsapp_config->>'enabled')::boolean = true
LIMIT 1
ON CONFLICT (restaurant_id, customer_phone) DO NOTHING;

-- Insertar mensajes de prueba
INSERT INTO whatsapp_messages (
  conversation_id,
  restaurant_id,
  message_type,
  direction,
  content,
  status
)
SELECT 
  wc.id,
  wc.restaurant_id,
  'text',
  'inbound',
  'Hola, me gustaría hacer un pedido',
  'sent'
FROM whatsapp_conversations wc
WHERE wc.customer_phone = '+1234567890'
ON CONFLICT DO NOTHING;

INSERT INTO whatsapp_messages (
  conversation_id,
  restaurant_id,
  message_type,
  direction,
  content,
  status
)
SELECT 
  wc.id,
  wc.restaurant_id,
  'text',
  'outbound',
  '¡Hola! Bienvenido a nuestro restaurante. ¿En qué puedo ayudarte?',
  'sent'
FROM whatsapp_conversations wc
WHERE wc.customer_phone = '+1234567890'
ON CONFLICT DO NOTHING;

-- 4. Verificar datos de prueba
SELECT 'Verificando datos de prueba...' as info;

SELECT 
  'Conversaciones' as tipo,
  COUNT(*) as cantidad
FROM whatsapp_conversations
UNION ALL
SELECT 
  'Mensajes' as tipo,
  COUNT(*) as cantidad
FROM whatsapp_messages
UNION ALL
SELECT 
  'Órdenes' as tipo,
  COUNT(*) as cantidad
FROM whatsapp_orders;

-- 5. Mostrar conversaciones de prueba
SELECT 'Conversaciones de prueba:' as info;

SELECT 
  wc.id,
  r.name as restaurant_name,
  wc.customer_phone,
  wc.customer_name,
  wc.is_active,
  wc.last_message_at,
  COUNT(wm.id) as message_count
FROM whatsapp_conversations wc
JOIN restaurants r ON wc.restaurant_id = r.id
LEFT JOIN whatsapp_messages wm ON wc.id = wm.conversation_id
GROUP BY wc.id, r.name, wc.customer_phone, wc.customer_name, wc.is_active, wc.last_message_at
ORDER BY wc.last_message_at DESC;

-- 6. Mostrar mensajes de prueba
SELECT 'Mensajes de prueba:' as info;

SELECT 
  wm.id,
  r.name as restaurant_name,
  wm.direction,
  wm.message_type,
  LEFT(wm.content, 50) || CASE WHEN LENGTH(wm.content) > 50 THEN '...' ELSE '' END as content_preview,
  wm.created_at
FROM whatsapp_messages wm
JOIN restaurants r ON wm.restaurant_id = r.id
ORDER BY wm.created_at DESC
LIMIT 10;

-- 7. Verificar configuración de webhook
SELECT 'Configuración de webhook:' as info;

SELECT 
  r.id,
  r.name,
  r.whatsapp_config->>'phone_number' as phone_number,
  CASE 
    WHEN (r.whatsapp_config->>'enabled')::boolean = true 
    THEN 'https://' || COALESCE(r.whatsapp_config->>'webhook_domain', 'tu-dominio.com') || '/api/whatsapp/webhook/' || r.id
    ELSE 'No configurado'
  END as webhook_url
FROM restaurants r
WHERE r.whatsapp_config IS NOT NULL;

-- 8. Estadísticas de prueba
SELECT 'Estadísticas de WhatsApp:' as info;

WITH stats AS (
  SELECT 
    COUNT(DISTINCT wc.id) as total_conversations,
    COUNT(DISTINCT CASE WHEN wc.is_active THEN wc.id END) as active_conversations,
    COUNT(wm.id) as total_messages,
    COUNT(CASE WHEN wm.direction = 'outbound' THEN wm.id END) as ai_responses,
    COUNT(wo.id) as total_orders
  FROM restaurants r
  LEFT JOIN whatsapp_conversations wc ON r.id = wc.restaurant_id
  LEFT JOIN whatsapp_messages wm ON wc.id = wm.conversation_id
  LEFT JOIN whatsapp_orders wo ON wc.id = wo.conversation_id
  WHERE r.whatsapp_config IS NOT NULL
)
SELECT 
  total_conversations,
  active_conversations,
  total_messages,
  ai_responses,
  total_orders,
  CASE 
    WHEN total_messages > 0 THEN ROUND((ai_responses::decimal / total_messages) * 100, 2)
    ELSE 0
  END as ai_response_rate
FROM stats;

-- 9. Verificar permisos RLS
SELECT 'Verificando políticas RLS...' as info;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('whatsapp_conversations', 'whatsapp_messages', 'whatsapp_orders')
ORDER BY tablename, policyname;

-- 10. Resumen final
SELECT 'Resumen de la integración de WhatsApp:' as info;

SELECT 
  '✅ Tablas creadas correctamente' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_conversations')
UNION ALL
SELECT 
  '✅ Configuración de restaurantes actualizada'
WHERE EXISTS (SELECT 1 FROM restaurants WHERE whatsapp_config IS NOT NULL)
UNION ALL
SELECT 
  '✅ Datos de prueba insertados'
WHERE EXISTS (SELECT 1 FROM whatsapp_conversations WHERE customer_phone = '+1234567890')
UNION ALL
SELECT 
  '✅ Políticas RLS configuradas'
WHERE EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_conversations')
UNION ALL
SELECT 
  '✅ Índices creados'
WHERE EXISTS (SELECT 1 FROM pg_indexes WHERE indexname LIKE 'idx_whatsapp%');
