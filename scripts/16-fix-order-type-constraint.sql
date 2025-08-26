-- Fix order_type check constraint to allow all valid order types
-- The current constraint is too restrictive

-- First, let's see the current constraint
SELECT 'Current constraints on orders table:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- Drop the existing check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;

-- Create a new, more permissive check constraint
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
    CHECK (order_type IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway'));

-- Verify the new constraint
SELECT 'New constraints on orders table:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- Test the constraint with valid values
SELECT 'Testing constraint with valid order types:' as info;
SELECT 'pickup' as test_value, 'pickup' IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway') as is_valid
UNION ALL
SELECT 'delivery', 'delivery' IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway')
UNION ALL
SELECT 'table_service', 'table_service' IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway')
UNION ALL
SELECT 'dine_in', 'dine_in' IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway')
UNION ALL
SELECT 'takeaway', 'takeaway' IN ('pickup', 'delivery', 'table_service', 'dine_in', 'takeaway'); 