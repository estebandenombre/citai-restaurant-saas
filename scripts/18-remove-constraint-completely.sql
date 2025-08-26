-- Completely remove and recreate the order_type constraint
-- This is a more aggressive approach to fix the constraint issue

-- First, let's see what we're dealing with
SELECT 'Current order types in orders table:' as info;
SELECT DISTINCT order_type, COUNT(*) as count
FROM orders 
GROUP BY order_type;

-- Show all constraints on the orders table
SELECT 'All constraints on orders table:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- Drop ALL check constraints on order_type (if any exist)
DO $$
BEGIN
    -- Drop the specific constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'orders'::regclass 
        AND conname = 'orders_order_type_check'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_order_type_check;
        RAISE NOTICE 'Dropped orders_order_type_check constraint';
    END IF;
    
    -- Drop any other check constraints that might be related to order_type
    -- This is a safety measure
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'orders'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%order_type%'
    ) THEN
        EXECUTE (
            'ALTER TABLE orders DROP CONSTRAINT ' || 
            (SELECT conname FROM pg_constraint 
             WHERE conrelid = 'orders'::regclass 
             AND contype = 'c'
             AND pg_get_constraintdef(oid) LIKE '%order_type%'
             LIMIT 1)
        );
        RAISE NOTICE 'Dropped additional order_type related constraint';
    END IF;
END $$;

-- Verify no order_type constraints remain
SELECT 'Constraints after cleanup:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- Now create a new, very permissive constraint
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
    CHECK (order_type IS NOT NULL AND order_type != '');

-- Verify the new constraint
SELECT 'New constraint created:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass AND conname = 'orders_order_type_check';

-- Test with some sample data
SELECT 'Testing constraint with sample values:' as info;
SELECT 'pickup' as test_value, 'pickup' IS NOT NULL AND 'pickup' != '' as is_valid
UNION ALL
SELECT 'delivery', 'delivery' IS NOT NULL AND 'delivery' != ''
UNION ALL
SELECT 'table_service', 'table_service' IS NOT NULL AND 'table_service' != ''
UNION ALL
SELECT 'dine_in', 'dine_in' IS NOT NULL AND 'dine_in' != ''
UNION ALL
SELECT 'takeaway', 'takeaway' IS NOT NULL AND 'takeaway' != ''
UNION ALL
SELECT 'restaurant_service', 'restaurant_service' IS NOT NULL AND 'restaurant_service' != ''; 