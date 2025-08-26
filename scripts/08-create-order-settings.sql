-- Create order_settings table
CREATE TABLE IF NOT EXISTS order_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_enabled BOOLEAN DEFAULT true,
    pickup_enabled BOOLEAN DEFAULT true,
    delivery_enabled BOOLEAN DEFAULT false,
    table_service_enabled BOOLEAN DEFAULT false,
    require_name BOOLEAN DEFAULT true,
    require_phone BOOLEAN DEFAULT true,
    require_email BOOLEAN DEFAULT false,
    require_table_number BOOLEAN DEFAULT false,
    require_pickup_time BOOLEAN DEFAULT false,
    require_address BOOLEAN DEFAULT false,
    require_notes BOOLEAN DEFAULT false,
    pickup_time_slots TEXT[] DEFAULT '{}',
    max_pickup_advance_hours INTEGER DEFAULT 24,
    min_pickup_advance_minutes INTEGER DEFAULT 30,
    auto_confirm_orders BOOLEAN DEFAULT false,
    allow_special_instructions BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_settings_restaurant_id ON order_settings(restaurant_id);

-- Enable RLS
ALTER TABLE order_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Restaurant owners can view their own order settings" ON order_settings
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can insert their own order settings" ON order_settings
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can update their own order settings" ON order_settings
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can delete their own order settings" ON order_settings
    FOR DELETE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid() AND role = 'owner'
        )
    ); 