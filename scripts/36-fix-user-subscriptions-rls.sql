-- Fix RLS policies for user_subscriptions to work with public.users table
-- This script addresses the issue where user_subscriptions references public.users instead of auth.users

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

-- Recreate policies with proper permissions for public.users

-- 1. Subscription Plans - Anyone can view active plans
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- 2. User Subscriptions - Users can view their own subscriptions
-- This policy now works with public.users table
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- 3. User Subscriptions - Users can insert their own subscriptions (IMPORTANT for registration)
CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
  FOR INSERT TO authenticated WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- 4. User Subscriptions - Users can update their own subscriptions
CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE TO authenticated USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- 5. Restaurant Subscriptions - Users can view their restaurant subscriptions
CREATE POLICY "Users can view their restaurant subscriptions" ON restaurant_subscriptions
  FOR SELECT TO authenticated USING (
    user_subscription_id IN (
      SELECT us.id FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

-- 6. Restaurant Subscriptions - Users can manage their restaurant subscriptions
CREATE POLICY "Users can manage their restaurant subscriptions" ON restaurant_subscriptions
  FOR ALL TO authenticated USING (
    user_subscription_id IN (
      SELECT us.id FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      WHERE u.email = auth.jwt() ->> 'email'
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
SELECT 
  'RLS TEST' as test_type,
  'user_subscriptions INSERT policy test' as description,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'user_subscriptions' 
        AND cmd = 'INSERT'
        AND permissive = 'PERMISSIVE'
    ) THEN 'PASS' 
    ELSE 'FAIL' 
  END as result;

-- Check if there are any existing user_subscriptions that need to be fixed
SELECT 
  'EXISTING SUBSCRIPTIONS' as check_type,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN us.user_id IN (SELECT id FROM users) THEN 1 END) as valid_user_references,
  COUNT(CASE WHEN us.user_id NOT IN (SELECT id FROM users) THEN 1 END) as invalid_user_references
FROM user_subscriptions us;

-- Show any orphaned subscriptions (user_id not in public.users)
SELECT 
  'ORPHANED SUBSCRIPTIONS' as check_type,
  us.id as subscription_id,
  us.user_id,
  us.plan_id,
  us.status,
  us.created_at
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;
