-- Fix unit_price column issue in order_items table
-- This script handles the unit_price not-null constraint

-- First, let's see the current structure of order_items table
SELECT 'Current order_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Check if unit_price column exists and its constraints
SELECT 'Unit price column details:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' AND column_name = 'unit_price';

-- Update the API to use unit_price instead of dish_price
-- First, let's see what data we have
SELECT 'Current data in order_items:' as info;
SELECT id, order_id, dish_name, dish_price, unit_price, quantity
FROM order_items 
LIMIT 5;

-- Update existing records to have unit_price if it's NULL
UPDATE order_items 
SET unit_price = dish_price 
WHERE unit_price IS NULL AND dish_price IS NOT NULL;

-- Also update dish_price if unit_price exists but dish_price is NULL
UPDATE order_items 
SET dish_price = unit_price 
WHERE dish_price IS NULL AND unit_price IS NOT NULL;

-- Make sure both columns have default values for future inserts
DO $$
BEGIN
    -- Set default for unit_price if it doesn't have one
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'unit_price' 
        AND column_default IS NULL
    ) THEN
        ALTER TABLE order_items ALTER COLUMN unit_price SET DEFAULT 0.00;
        RAISE NOTICE 'Set default value for unit_price column';
    END IF;
    
    -- Set default for dish_price if it doesn't have one
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'dish_price' 
        AND column_default IS NULL
    ) THEN
        ALTER TABLE order_items ALTER COLUMN dish_price SET DEFAULT 0.00;
        RAISE NOTICE 'Set default value for dish_price column';
    END IF;
END $$;

-- Show the updated structure
SELECT 'Updated order_items table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Test inserting a sample order item with both price columns
SELECT 'Testing order_items table with sample data:' as info;
INSERT INTO order_items (order_id, dish_name, dish_price, unit_price, quantity, special_instructions)
VALUES (
    (SELECT id FROM orders LIMIT 1), 
    'Test Dish', 
    10.50, 
    10.50, 
    1, 
    'Test instructions'
) ON CONFLICT DO NOTHING;

-- Show the test data
SELECT 'Sample order item created:' as info;
SELECT * FROM order_items WHERE dish_name = 'Test Dish' LIMIT 1;

-- Clean up test data
DELETE FROM order_items WHERE dish_name = 'Test Dish'; 