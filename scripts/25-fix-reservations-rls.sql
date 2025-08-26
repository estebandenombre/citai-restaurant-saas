-- Fix RLS policies for reservations table
-- This script ensures unauthenticated users can create reservations while maintaining security

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Restaurant owners can view their reservations" ON reservations;
DROP POLICY IF EXISTS "Restaurant owners can insert reservations" ON reservations;
DROP POLICY IF EXISTS "Restaurant owners can update their reservations" ON reservations;
DROP POLICY IF EXISTS "Restaurant owners can delete their reservations" ON reservations;
DROP POLICY IF EXISTS "Unauthenticated users can create reservations" ON reservations;

-- Recreate policies in the correct order
-- Policy for unauthenticated users to create reservations (for landing pages)
-- This must be created first and should allow all inserts
CREATE POLICY "Unauthenticated users can create reservations" ON reservations
    FOR INSERT WITH CHECK (true);

-- Policy for restaurant owners to view their own reservations
CREATE POLICY "Restaurant owners can view their reservations" ON reservations
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for restaurant owners to insert reservations (for manual creation)
CREATE POLICY "Restaurant owners can insert reservations" ON reservations
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for restaurant owners to update their reservations
CREATE POLICY "Restaurant owners can update their reservations" ON reservations
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for restaurant owners to delete their reservations
CREATE POLICY "Restaurant owners can delete their reservations" ON reservations
    FOR DELETE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Add a comment to document the fix
COMMENT ON TABLE reservations IS 'Restaurant reservations table with fixed RLS policies for unauthenticated users'; 