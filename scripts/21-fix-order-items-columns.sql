-- Fix order_items table columns - handle missing dish_price column
-- This script ensures all required columns exist and handles the unit_price issue

-- First, let's see the current structure of order_items table
SELECT 'Current order_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add dish_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'dish_name'
    ) THEN
        ALTER TABLE order_items ADD COLUMN dish_name VARCHAR(255);
        RAISE NOTICE 'Added dish_name column to order_items table';
    END IF;
    
    -- Add dish_price column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'dish_price'
    ) THEN
        ALTER TABLE order_items ADD COLUMN dish_price DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added dish_price column to order_items table';
    END IF;
    
    -- Add unit_price column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'unit_price'
    ) THEN
        ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added unit_price column to order_items table';
    END IF;
    
    -- Add quantity column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE order_items ADD COLUMN quantity INTEGER DEFAULT 1;
        RAISE NOTICE 'Added quantity column to order_items table';
    END IF;
    
    -- Add special_instructions column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'special_instructions'
    ) THEN
        ALTER TABLE order_items ADD COLUMN special_instructions TEXT;
        RAISE NOTICE 'Added special_instructions column to order_items table';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE order_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to order_items table';
    END IF;
END $$;

-- Show the updated structure
SELECT 'Updated order_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Verify that all required columns exist
SELECT 'Verifying required columns exist:' as info;
SELECT 
    CASE WHEN COUNT(*) >= 5 THEN '✅ All required columns exist' 
         ELSE '❌ Missing some required columns' 
    END as status,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'order_items' 
  AND column_name IN ('id', 'order_id', 'dish_name', 'unit_price', 'quantity');

-- Test inserting a sample order item with the correct columns
SELECT 'Testing order_items table with sample data:' as info;
INSERT INTO order_items (order_id, dish_name, unit_price, quantity, special_instructions)
VALUES (
    (SELECT id FROM orders LIMIT 1), 
    'Test Dish', 
    10.50, 
    1, 
    'Test instructions'
) ON CONFLICT DO NOTHING;

-- Show the test data
SELECT 'Sample order item created:' as info;
SELECT * FROM order_items WHERE dish_name = 'Test Dish' LIMIT 1;

-- Clean up test data
DELETE FROM order_items WHERE dish_name = 'Test Dish'; 