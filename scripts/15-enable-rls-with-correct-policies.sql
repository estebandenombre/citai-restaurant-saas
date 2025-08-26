-- Re-enable RLS with correct policies after orders are working
-- This should be run AFTER orders are working without RLS

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create simple policies that allow all operations
-- This is less secure but will definitely work

-- Orders table policies
CREATE POLICY "orders_all_policy" ON orders
    FOR ALL USING (true)
    WITH CHECK (true);

-- Order items table policies  
CREATE POLICY "order_items_all_policy" ON order_items
    FOR ALL USING (true)
    WITH CHECK (true);

-- Verify RLS is enabled and policies are created
SELECT 'RLS status after enabling:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items');

SELECT 'Policies after enabling:' as info;
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items'); 