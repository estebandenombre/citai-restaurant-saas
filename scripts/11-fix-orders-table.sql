-- Fix orders table by adding missing columns if they don't exist

-- Add order_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_status VARCHAR(50) DEFAULT 'pending';
        ALTER TABLE orders ADD CONSTRAINT orders_order_status_check 
            CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'));
    END IF;
END $$;

-- Add customer_ prefix columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_table_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_table_number VARCHAR(50);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_pickup_time'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_pickup_time TIME;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_address TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_special_instructions'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_special_instructions TEXT;
    END IF;
END $$;

-- Add other missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivery_fee'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Restaurant owners can view their orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can insert orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update their orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can view their order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can insert order items" ON order_items;

-- Create RLS policies for orders
CREATE POLICY "Restaurant owners can view their orders" ON orders
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can insert orders" ON orders
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can update their orders" ON orders
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Create RLS policies for order_items
CREATE POLICY "Restaurant owners can view their order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE restaurant_id IN (
                SELECT restaurant_id FROM users 
                WHERE id = auth.uid() AND role = 'owner'
            )
        )
    );

CREATE POLICY "Restaurant owners can insert order items" ON order_items
    FOR INSERT WITH CHECK (
        order_id IN (
            SELECT id FROM orders WHERE restaurant_id IN (
                SELECT restaurant_id FROM users 
                WHERE id = auth.uid() AND role = 'owner'
            )
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 