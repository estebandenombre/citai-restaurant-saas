-- Script para agregar configuración de WhatsApp a la tabla restaurants
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campos de configuración de WhatsApp a la tabla restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS whatsapp_config JSONB DEFAULT '{
  "enabled": false,
  "phone_number": null,
  "business_name": null,
  "welcome_message": "Hello! Welcome to our restaurant. How can I help you?",
  "ai_enabled": true,
  "auto_confirm_orders": false,
  "send_order_confirmation": true,
  "send_status_updates": true,
  "business_hours": {
    "monday": {"open": "09:00", "close": "22:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "22:00", "closed": false},
    "thursday": {"open": "09:00", "close": "22:00", "closed": false},
    "friday": {"open": "09:00", "close": "23:00", "closed": false},
    "saturday": {"open": "10:00", "close": "23:00", "closed": false},
    "sunday": {"open": "10:00", "close": "21:00", "closed": false}
  },
  "menu_display": {
    "show_prices": true,
    "show_descriptions": true,
    "show_images": false,
    "group_by_category": true
  },
  "order_settings": {
    "require_name": true,
    "require_phone": true,
    "require_address": false,
    "allow_special_instructions": true,
    "pickup_enabled": true,
    "delivery_enabled": false,
    "min_order_amount": 0,
    "delivery_fee": 0
  }
}'::jsonb;

-- 2. Agregar comentario al campo
COMMENT ON COLUMN restaurants.whatsapp_config IS 'Configuración de WhatsApp Business API y bot de IA para el restaurante';

-- 3. Crear tabla para conversaciones de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    conversation_state JSONB DEFAULT '{"current_step": "welcome", "order_data": {}, "context": {}}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, customer_phone)
);

-- 4. Crear tabla para mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('text', 'menu', 'order_confirmation', 'status_update', 'image', 'button')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    whatsapp_message_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla para órdenes de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    order_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_restaurant_phone ON whatsapp_conversations(restaurant_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_active ON whatsapp_conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_restaurant ON whatsapp_messages(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_restaurant ON whatsapp_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_conversation ON whatsapp_orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_status ON whatsapp_orders(status);

-- 7. Habilitar RLS
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_orders ENABLE ROW LEVEL SECURITY;

-- 8. Crear políticas RLS para whatsapp_conversations
CREATE POLICY "Restaurant owners can view their WhatsApp conversations" ON whatsapp_conversations
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can insert WhatsApp conversations" ON whatsapp_conversations
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can update their WhatsApp conversations" ON whatsapp_conversations
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- 9. Crear políticas RLS para whatsapp_messages
CREATE POLICY "Restaurant owners can view their WhatsApp messages" ON whatsapp_messages
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can insert WhatsApp messages" ON whatsapp_messages
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can update their WhatsApp messages" ON whatsapp_messages
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- 10. Crear políticas RLS para whatsapp_orders
CREATE POLICY "Restaurant owners can view their WhatsApp orders" ON whatsapp_orders
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can insert WhatsApp orders" ON whatsapp_orders
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can update their WhatsApp orders" ON whatsapp_orders
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- 11. Crear funciones útiles
CREATE OR REPLACE FUNCTION update_restaurant_whatsapp_config(
  restaurant_id UUID,
  config JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE restaurants 
  SET whatsapp_config = config,
      updated_at = NOW()
  WHERE id = restaurant_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_restaurant_whatsapp_config(restaurant_id UUID)
RETURNS JSONB AS $$
DECLARE
  config JSONB;
BEGIN
  SELECT whatsapp_config INTO config
  FROM restaurants 
  WHERE id = restaurant_id;
  
  RETURN COALESCE(config, '{"enabled": false}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 12. Actualizar restaurantes existentes con configuración por defecto
UPDATE restaurants 
SET whatsapp_config = '{
  "enabled": false,
  "phone_number": null,
  "business_name": null,
  "welcome_message": "Hello! Welcome to our restaurant. How can I help you?",
  "ai_enabled": true,
  "auto_confirm_orders": false,
  "send_order_confirmation": true,
  "send_status_updates": true,
  "business_hours": {
    "monday": {"open": "09:00", "close": "22:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "22:00", "closed": false},
    "thursday": {"open": "09:00", "close": "22:00", "closed": false},
    "friday": {"open": "09:00", "close": "23:00", "closed": false},
    "saturday": {"open": "10:00", "close": "23:00", "closed": false},
    "sunday": {"open": "10:00", "close": "21:00", "closed": false}
  },
  "menu_display": {
    "show_prices": true,
    "show_descriptions": true,
    "show_images": false,
    "group_by_category": true
  },
  "order_settings": {
    "require_name": true,
    "require_phone": true,
    "require_address": false,
    "allow_special_instructions": true,
    "pickup_enabled": true,
    "delivery_enabled": false,
    "min_order_amount": 0,
    "delivery_fee": 0
  }
}'::jsonb
WHERE whatsapp_config IS NULL;

-- 13. Mostrar configuración actual
SELECT 
  id,
  name,
  whatsapp_config->>'enabled' as whatsapp_enabled,
  whatsapp_config->>'phone_number' as whatsapp_phone,
      CASE 
      WHEN (whatsapp_config->>'enabled')::boolean = true THEN '✅ Enabled'
      ELSE '❌ Disabled'
    END as whatsapp_status
FROM restaurants
ORDER BY name;
