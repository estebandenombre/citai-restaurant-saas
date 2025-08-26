-- Fix RLS policies for admin access to user_subscriptions
-- This script ensures admin users can access subscription data

-- 1. Check current RLS status
SELECT 'Current RLS status for user_subscriptions:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_subscriptions';

-- 2. Check existing policies
SELECT 'Existing policies for user_subscriptions:' as info;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_subscriptions'
ORDER BY policyname;

-- 3. Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admin can update all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admin can insert subscriptions" ON user_subscriptions;

-- 4. Create new policies that allow admin access
-- Policy for users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for users to insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for admin to view all subscriptions (for admin dashboard)
CREATE POLICY "Admin can view all subscriptions" ON user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = true
    )
  );

-- Policy for admin to update all subscriptions
CREATE POLICY "Admin can update all subscriptions" ON user_subscriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = true
    )
  );

-- Policy for admin to insert subscriptions
CREATE POLICY "Admin can insert subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = true
    )
  );

-- 5. Verify the new policies
SELECT 'New RLS Policies for user_subscriptions:' as info;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  CASE WHEN qual IS NOT NULL THEN 'HAS CONDITIONS' ELSE 'NO CONDITIONS' END as has_conditions
FROM pg_policies
WHERE tablename = 'user_subscriptions'
ORDER BY policyname;

-- 6. Test admin access
SELECT 'Testing admin access:' as info;
SELECT 
  'Admin user exists' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = 'admin@tably.com'
      AND is_active = true
    ) THEN 'YES'
    ELSE 'NO'
  END as result;

-- 7. Test subscription query (this should work for admin)
SELECT 'Testing subscription query:' as info;
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users
FROM user_subscriptions;

-- 8. Show sample subscription data
SELECT 'Sample subscription data:' as info;
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.created_at,
  sp.display_name as plan_name
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 5;
