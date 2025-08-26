-- Verify subscription data and authentication issues
-- This script helps diagnose why the admin dashboard can't access subscription data

-- 1. Check if there are any subscription records at all
SELECT 'Subscription Data Check:' as test;
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_subscriptions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions
FROM user_subscriptions;

-- 2. Check if there are any users
SELECT 'Users Check:' as test;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN has_completed_onboarding = true THEN 1 END) as completed_onboarding,
  COUNT(CASE WHEN has_completed_onboarding = false THEN 1 END) as pending_onboarding
FROM users;

-- 3. Check if there are any subscription plans
SELECT 'Subscription Plans Check:' as test;
SELECT 
  COUNT(*) as total_plans,
  name,
  display_name,
  price
FROM subscription_plans
ORDER BY price;

-- 4. Check for users without subscriptions
SELECT 'Users Without Subscriptions:' as test;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at,
  u.has_completed_onboarding
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status IN ('active', 'trial')
WHERE us.user_id IS NULL
ORDER BY u.created_at DESC;

-- 5. Check for users with subscriptions
SELECT 'Users With Subscriptions:' as test;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  us.status,
  us.created_at as subscription_created,
  sp.display_name as plan_name
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trial')
ORDER BY us.created_at DESC;

-- 6. Check admin user status
SELECT 'Admin User Status:' as test;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM admin_users
WHERE email = 'admin@tably.com';

-- 7. Check if admin user exists in auth.users
SELECT 'Admin User in Auth:' as test;
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'admin@tably.com';

-- 8. Test a simple query without any joins
SELECT 'Simple user_subscriptions query:' as test;
SELECT 
  id,
  user_id,
  plan_id,
  status,
  created_at
FROM user_subscriptions
ORDER BY created_at DESC
LIMIT 5;

-- 9. Check if the issue is with the specific user_id
SELECT 'Testing with specific user_id:' as test;
WITH sample_user AS (
  SELECT id, email FROM users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  su.id as user_id,
  su.email,
  us.id as subscription_id,
  us.status,
  us.created_at
FROM sample_user su
LEFT JOIN user_subscriptions us ON su.id = us.user_id
ORDER BY us.created_at DESC;

-- 10. Check RLS status
SELECT 'RLS Status for user_subscriptions:' as test;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_subscriptions';
