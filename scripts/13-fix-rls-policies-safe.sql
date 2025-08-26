-- Safe fix for RLS policies - checks and drops existing policies first
-- This script allows orders to be created from landing pages without user authentication

-- First, let's see what policies currently exist
SELECT 'Current policies on orders table:' as info;
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders';

SELECT 'Current policies on order_items table:' as info;
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'order_items';

-- Drop ALL existing policies on orders table
DROP POLICY IF EXISTS "Restaurant owners can insert orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can select orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update orders" ON orders;
DROP POLICY IF EXISTS "Allow order insertion" ON orders;
DROP POLICY IF EXISTS "Allow order items insertion" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can select order items" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update order items" ON orders;

-- Drop ALL existing policies on order_items table
DROP POLICY IF EXISTS "Restaurant owners can insert order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can select order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can update order items" ON order_items;
DROP POLICY IF EXISTS "Allow order items insertion" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can select order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can update order items" ON order_items;

-- Create new policies for orders table
CREATE POLICY "Allow order insertion" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Restaurant owners can select orders" ON orders
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Restaurant owners can update orders" ON orders
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Create new policies for order_items table
CREATE POLICY "Allow order items insertion" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Restaurant owners can select order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE restaurant_id IN (
                SELECT restaurant_id FROM users 
                WHERE id = auth.uid() AND role = 'owner'
            )
        )
    );

CREATE POLICY "Restaurant owners can update order items" ON order_items
    FOR UPDATE USING (
        order_id IN (
            SELECT id FROM orders WHERE restaurant_id IN (
                SELECT restaurant_id FROM users 
                WHERE id = auth.uid() AND role = 'owner'
            )
        )
    );

-- Verify new policies are created
SELECT 'New policies on orders table:' as info;
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders';

SELECT 'New policies on order_items table:' as info;
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'order_items'; 