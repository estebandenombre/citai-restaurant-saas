-- Fix RLS policies for orders table to allow insertion without authentication
-- This script allows orders to be created from landing pages without user authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Restaurant owners can insert orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can select orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update orders" ON orders;

-- Create new policies that allow insertion without authentication
-- Policy for INSERT: Allow insertion of orders for any restaurant
CREATE POLICY "Allow order insertion" ON orders
    FOR INSERT WITH CHECK (true);

-- Policy for SELECT: Allow restaurant owners to view their orders
CREATE POLICY "Restaurant owners can select orders" ON orders
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for UPDATE: Allow restaurant owners to update their orders
CREATE POLICY "Restaurant owners can update orders" ON orders
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Also fix order_items table policies
DROP POLICY IF EXISTS "Restaurant owners can insert order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can select order items" ON order_items;
DROP POLICY IF EXISTS "Restaurant owners can update order items" ON order_items;

-- Create new policies for order_items
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

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items'); 