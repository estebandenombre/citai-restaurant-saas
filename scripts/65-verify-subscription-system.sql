-- Comprehensive verification of the subscription system
-- This script ensures all components are working correctly

-- 1. Check overall system status
SELECT '=== SUBSCRIPTION SYSTEM VERIFICATION ===' as test;

-- 2. Check subscription plans
SELECT 'Subscription Plans:' as test;
SELECT 
  id,
  name,
  display_name,
  price,
  features
FROM subscription_plans
ORDER BY price;

-- 3. Check users and their subscription status
SELECT 'Users and Subscription Status:' as test;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at as user_created,
  us.id as subscription_id,
  us.status as subscription_status,
  us.created_at as subscription_created,
  sp.display_name as plan_name,
  sp.price as plan_price,
  CASE 
    WHEN us.status = 'trial' THEN 
      CASE 
        WHEN us.created_at + INTERVAL '14 days' > NOW() THEN 
          'Trial Active (' || EXTRACT(DAY FROM (us.created_at + INTERVAL '14 days' - NOW())) || ' days left)'
        ELSE 'Trial Expired'
      END
    WHEN us.status = 'active' THEN 'Active Subscription'
    WHEN us.status = 'cancelled' THEN 'Cancelled'
    WHEN us.status = 'expired' THEN 'Expired'
    WHEN us.id IS NULL THEN 'No Subscription'
    ELSE us.status
  END as subscription_details
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 4. Check subscription distribution
SELECT 'Subscription Status Distribution:' as test;
SELECT 
  COALESCE(us.status, 'no_subscription') as status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
GROUP BY us.status
ORDER BY count DESC;

-- 5. Check trial expiration
SELECT 'Trial Status Check:' as test;
SELECT 
  u.email,
  us.created_at as trial_start,
  us.created_at + INTERVAL '14 days' as trial_end,
  CASE 
    WHEN us.created_at + INTERVAL '14 days' > NOW() THEN 
      EXTRACT(DAY FROM (us.created_at + INTERVAL '14 days' - NOW())) || ' days left'
    ELSE 'Expired ' || EXTRACT(DAY FROM (NOW() - (us.created_at + INTERVAL '14 days'))) || ' days ago'
  END as trial_status
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.status = 'trial'
ORDER BY us.created_at DESC;

-- 6. Check for users without subscriptions
SELECT 'Users Without Subscriptions:' as test;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL
ORDER BY u.created_at DESC;

-- 7. Check trigger function
SELECT 'Trigger Function Status:' as test;
SELECT 
  proname as function_name,
  CASE WHEN prosrc IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_proc 
WHERE proname = 'assign_trial_subscription_to_new_user';

-- 8. Check trigger
SELECT 'Trigger Status:' as test;
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  CASE WHEN tgname IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_trigger
WHERE tgname = 'auto_assign_trial_subscription';

-- 9. Check RLS policies
SELECT 'RLS Policies for user_subscriptions:' as test;
SELECT 
  policyname,
  cmd,
  permissive,
  CASE WHEN qual IS NOT NULL THEN 'HAS CONDITIONS' ELSE 'NO CONDITIONS' END as has_conditions
FROM pg_policies
WHERE tablename = 'user_subscriptions'
ORDER BY policyname;

-- 10. Test admin access
SELECT 'Admin Access Test:' as test;
SELECT 
  'Admin user exists' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@tably.com') THEN 'YES'
    ELSE 'NO'
  END as result
UNION ALL
SELECT 
  'Admin user active' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@tably.com' AND is_active = true) THEN 'YES'
    ELSE 'NO'
  END as result;

-- 11. Check for orphaned subscriptions
SELECT 'Orphaned Subscriptions Check:' as test;
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.created_at
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- 12. Check for orphaned plan references
SELECT 'Orphaned Plan References Check:' as test;
SELECT 
  us.id,
  us.plan_id,
  us.status,
  us.created_at
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- 13. Summary
SELECT '=== SYSTEM SUMMARY ===' as test;
SELECT 
  'Total Users' as metric,
  COUNT(*) as value
FROM users
UNION ALL
SELECT 
  'Users with Subscriptions' as metric,
  COUNT(DISTINCT us.user_id) as value
FROM user_subscriptions us
UNION ALL
SELECT 
  'Active Trials' as metric,
  COUNT(*) as value
FROM user_subscriptions us
WHERE us.status = 'trial' AND us.created_at + INTERVAL '14 days' > NOW()
UNION ALL
SELECT 
  'Expired Trials' as metric,
  COUNT(*) as value
FROM user_subscriptions us
WHERE us.status = 'trial' AND us.created_at + INTERVAL '14 days' <= NOW()
UNION ALL
SELECT 
  'Active Subscriptions' as metric,
  COUNT(*) as value
FROM user_subscriptions us
WHERE us.status = 'active'
UNION ALL
SELECT 
  'Users without Subscriptions' as metric,
  COUNT(*) as value
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL;
