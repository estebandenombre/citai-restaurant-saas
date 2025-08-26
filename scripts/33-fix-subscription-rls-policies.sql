-- Fix RLS policies for subscription tables
-- This script addresses potential issues with Row Level Security that might prevent subscription creation

-- First, let's check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('subscription_plans', 'user_subscriptions', 'restaurant_subscriptions');

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their restaurant subscriptions" ON restaurant_subscriptions;
DROP POLICY IF EXISTS "Users can manage their restaurant subscriptions" ON restaurant_subscriptions;

-- Recreate policies with proper permissions

-- 1. Subscription Plans - Anyone can view active plans
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- 2. User Subscriptions - Users can view their own subscriptions
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 3. User Subscriptions - Users can insert their own subscriptions (IMPORTANT for registration)
CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 4. User Subscriptions - Users can update their own subscriptions
CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 5. Restaurant Subscriptions - Users can view their restaurant subscriptions
CREATE POLICY "Users can view their restaurant subscriptions" ON restaurant_subscriptions
  FOR SELECT TO authenticated USING (
    user_subscription_id IN (
      SELECT id FROM user_subscriptions WHERE user_id = auth.uid()
    )
  );

-- 6. Restaurant Subscriptions - Users can manage their restaurant subscriptions
CREATE POLICY "Users can manage their restaurant subscriptions" ON restaurant_subscriptions
  FOR ALL TO authenticated USING (
    user_subscription_id IN (
      SELECT id FROM user_subscriptions WHERE user_id = auth.uid()
    )
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('subscription_plans', 'user_subscriptions', 'restaurant_subscriptions')
ORDER BY tablename, cmd;

-- Test if a user can insert a subscription (this will help identify any remaining issues)
-- Note: This is just a test query structure, it won't actually insert anything
SELECT 
  'RLS TEST' as test_type,
  'user_subscriptions INSERT policy test' as description,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'user_subscriptions' 
        AND cmd = 'INSERT'
        AND permissive = true
    ) THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;
