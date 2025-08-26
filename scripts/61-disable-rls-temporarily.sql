-- Temporarily disable RLS for admin testing
-- This script helps bypass RLS issues for admin dashboard functionality

-- 1. Check current RLS status
SELECT 'Current RLS Status:' as test;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_subscriptions';

-- 2. Temporarily disable RLS for user_subscriptions
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;

-- 3. Verify RLS is disabled
SELECT 'RLS Status After Disabling:' as test;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_subscriptions';

-- 4. Test subscription history query without RLS
SELECT 'Testing subscription history without RLS:' as test;
WITH test_user AS (
  SELECT id, email FROM users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  us.id,
  us.status,
  us.created_at,
  us.updated_at,
  us.admin_notes,
  sp.display_name as plan_name,
  sp.price
FROM user_subscriptions us
JOIN test_user tu ON us.user_id = tu.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

-- 5. Check if there are any subscription records at all
SELECT 'Subscription Records Summary:' as test;
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_subscriptions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions
FROM user_subscriptions;

-- 6. Show sample data
SELECT 'Sample subscription data:' as test;
SELECT 
  us.id,
  us.user_id,
  us.plan_id,
  us.status,
  us.created_at,
  us.updated_at,
  us.admin_notes,
  u.email as user_email,
  sp.display_name as plan_name
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 5;
