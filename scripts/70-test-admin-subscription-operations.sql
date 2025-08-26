-- Test admin subscription operations
-- This script verifies that admin users can perform subscription operations

-- 1. Check current admin user
SELECT 'Current admin user status:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active
FROM admin_users
WHERE email = 'admin@tably.com';

-- 2. Check current RLS policies for user_subscriptions
SELECT 'Current RLS policies for user_subscriptions:' as info;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  CASE WHEN qual IS NOT NULL THEN 'HAS CONDITIONS' ELSE 'NO CONDITIONS' END as has_conditions
FROM pg_policies
WHERE tablename = 'user_subscriptions'
ORDER BY policyname;

-- 3. Check if RLS is enabled
SELECT 'RLS status for user_subscriptions:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'user_subscriptions';

-- 4. Test basic subscription queries (should work for admin)
SELECT 'Testing basic subscription queries:' as info;
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions
FROM user_subscriptions;

-- 5. Show sample subscription data
SELECT 'Sample subscription data:' as info;
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.created_at,
  us.trial_end,
  us.current_period_end,
  sp.display_name as plan_name
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 5;

-- 6. Check for any subscription issues
SELECT 'Checking for subscription issues:' as info;
SELECT 
  'Subscriptions without plan_id' as issue,
  COUNT(*) as count
FROM user_subscriptions
WHERE plan_id IS NULL
UNION ALL
SELECT 
  'Subscriptions without user_id' as issue,
  COUNT(*) as count
FROM user_subscriptions
WHERE user_id IS NULL
UNION ALL
SELECT 
  'Subscriptions with invalid plan_id' as issue,
  COUNT(*) as count
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- 7. Test subscription plan data
SELECT 'Available subscription plans:' as info;
SELECT 
  id,
  name,
  display_name,
  price,
  billing_cycle,
  trial_days
FROM subscription_plans
ORDER BY price;

-- 8. Check user subscription distribution
SELECT 'User subscription distribution:' as info;
SELECT 
  COALESCE(us.status, 'no_subscription') as status,
  COUNT(*) as count
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
GROUP BY us.status
ORDER BY count DESC;

-- 9. Show users without subscriptions
SELECT 'Users without subscriptions:' as info;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 10. Test trial expiration calculation
SELECT 'Trial expiration status:' as info;
SELECT 
  u.email,
  us.status,
  us.trial_end,
  CASE 
    WHEN us.status = 'trial' AND us.trial_end > NOW() THEN 
      EXTRACT(DAY FROM (us.trial_end - NOW())) || ' days left'
    WHEN us.status = 'trial' AND us.trial_end <= NOW() THEN 'Expired'
    ELSE us.status
  END as trial_status
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.status = 'trial'
ORDER BY us.trial_end DESC
LIMIT 10;
