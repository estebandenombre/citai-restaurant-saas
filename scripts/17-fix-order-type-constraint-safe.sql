-- Safe fix for order_type constraint - updates existing data first
-- This script handles existing data that might violate the new constraint

-- First, let's see what order types currently exist in the table
SELECT 'Current order types in the table:' as info;
SELECT DISTINCT order_type, COUNT(*) as count
FROM orders 
GROUP BY order_type;

-- Let's see the current constraint
SELECT 'Current constraint definition:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass AND conname = 'orders_order_type_check';

-- Update any invalid order types to valid ones
-- This handles existing data that might violate the new constraint
UPDATE orders 
SET order_type = 'pickup' 
WHERE order_type NOT IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway', 'restaurant_service')
   OR order_type IS NULL;

-- Also update 'restaurant_service' to 'table_service' if it exists
UPDATE orders 
SET order_type = 'table_service' 
WHERE order_type = 'restaurant_service';

-- Verify all order types are now valid
SELECT 'Order types after cleanup:' as info;
SELECT DISTINCT order_type, COUNT(*) as count
FROM orders 
GROUP BY order_type;

-- Now drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;

-- Create the new constraint
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
    CHECK (order_type IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway'));

-- Verify the new constraint
SELECT 'New constraint created:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass AND conname = 'orders_order_type_check';

-- Test that the constraint works
SELECT 'Testing constraint with current data:' as info;
SELECT order_type, 
       order_type IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway') as is_valid
FROM orders 
GROUP BY order_type; 