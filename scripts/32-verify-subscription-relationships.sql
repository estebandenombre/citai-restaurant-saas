-- Diagnostic script to verify subscription relationships
-- Run this script to check if users are properly linked to subscription plans

-- 1. Check if subscription plans exist
SELECT 'SUBSCRIPTION PLANS' as check_type, COUNT(*) as count FROM subscription_plans;

-- 2. Check if any user subscriptions exist
SELECT 'USER SUBSCRIPTIONS' as check_type, COUNT(*) as count FROM user_subscriptions;

-- 3. Check if any users exist in auth.users
SELECT 'AUTH USERS' as check_type, COUNT(*) as count FROM auth.users;

-- 4. Check if any users exist in public.users table
SELECT 'PUBLIC USERS' as check_type, COUNT(*) as count FROM users;

-- 5. Check for orphaned user subscriptions (user_id not in auth.users)
SELECT 'ORPHANED USER SUBSCRIPTIONS' as check_type, COUNT(*) as count 
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE au.id IS NULL;

-- 6. Check for orphaned user subscriptions (plan_id not in subscription_plans)
SELECT 'INVALID PLAN REFERENCES' as check_type, COUNT(*) as count 
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- 7. Check for users without subscriptions
SELECT 'USERS WITHOUT SUBSCRIPTIONS' as check_type, COUNT(*) as count 
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
WHERE us.id IS NULL;

-- 8. Check for users with multiple active subscriptions
SELECT 'USERS WITH MULTIPLE ACTIVE SUBSCRIPTIONS' as check_type, COUNT(*) as count 
FROM (
  SELECT user_id, COUNT(*) as subscription_count
  FROM user_subscriptions 
  WHERE status IN ('active', 'trial')
  GROUP BY user_id
  HAVING COUNT(*) > 1
) multiple_subs;

-- 9. Detailed view of all user subscriptions with plan details
SELECT 
  'DETAILED SUBSCRIPTIONS' as check_type,
  us.id as subscription_id,
  us.user_id,
  au.email as user_email,
  us.plan_id,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.trial_start,
  us.trial_end,
  us.created_at
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

-- 10. Check for users in public.users table without corresponding auth.users
SELECT 'PUBLIC USERS WITHOUT AUTH USERS' as check_type, COUNT(*) as count 
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- 11. Check for auth.users without corresponding public.users
SELECT 'AUTH USERS WITHOUT PUBLIC USERS' as check_type, COUNT(*) as count 
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 12. Check subscription plan details
SELECT 
  'SUBSCRIPTION PLAN DETAILS' as check_type,
  id,
  name,
  display_name,
  price,
  billing_cycle,
  trial_days,
  is_active
FROM subscription_plans
ORDER BY price;

-- 13. Check for any RLS policy issues
SELECT 
  'RLS POLICIES' as check_type,
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
  AND tablename IN ('subscription_plans', 'user_subscriptions', 'restaurant_subscriptions');

-- 14. Check for any foreign key constraint violations
SELECT 'FOREIGN KEY VIOLATIONS' as check_type, 
  'user_subscriptions.user_id -> auth.users.id' as constraint_name,
  COUNT(*) as violation_count
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE au.id IS NULL

UNION ALL

SELECT 'FOREIGN KEY VIOLATIONS' as check_type,
  'user_subscriptions.plan_id -> subscription_plans.id' as constraint_name,
  COUNT(*) as violation_count
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;
