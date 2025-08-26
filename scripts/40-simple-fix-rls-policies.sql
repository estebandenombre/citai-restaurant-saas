-- Simple fix for RLS policies
-- This script fixes RLS policies without complex queries

-- Drop existing policies
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

-- Verify policies were created
SELECT 
  'POLICIES CREATED' as status,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('subscription_plans', 'user_subscriptions', 'restaurant_subscriptions')
ORDER BY tablename, cmd;
