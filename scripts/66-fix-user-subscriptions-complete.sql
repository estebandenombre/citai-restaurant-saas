-- Complete fix for user subscriptions
-- This script ensures all users have proper subscription records

-- 1. First, check current state
SELECT '=== CURRENT STATE ANALYSIS ===' as test;

-- Check how many users exist
SELECT 'Total users in system:' as test;
SELECT COUNT(*) as total_users FROM users;

-- Check how many users have subscriptions
SELECT 'Users with subscriptions:' as test;
SELECT COUNT(DISTINCT us.user_id) as users_with_subscriptions 
FROM user_subscriptions us;

-- Check how many users don't have subscriptions
SELECT 'Users without subscriptions:' as test;
SELECT COUNT(*) as users_without_subscriptions
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- Show users without subscriptions
SELECT 'Users without subscriptions (details):' as test;
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

-- 2. Check subscription plans
SELECT 'Available subscription plans:' as test;
SELECT 
  id,
  name,
  display_name,
  price,
  billing_cycle
FROM subscription_plans
ORDER BY price;

-- 3. Get the free trial plan ID
SELECT 'Free trial plan details:' as test;
SELECT 
  id,
  name,
  display_name,
  price,
  billing_cycle
FROM subscription_plans
WHERE name = 'free-trial'
LIMIT 1;

-- 4. Clean up any existing problematic subscriptions
SELECT 'Cleaning up problematic subscriptions...' as test;

-- Remove any subscriptions that don't have valid plan references
DELETE FROM user_subscriptions 
WHERE plan_id NOT IN (SELECT id FROM subscription_plans);

-- Remove any subscriptions that don't have valid user references
DELETE FROM user_subscriptions 
WHERE user_id NOT IN (SELECT id FROM users);

-- 5. Assign trial subscriptions to users who don't have any
SELECT 'Assigning trial subscriptions to users without subscriptions...' as test;

INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  trial_start,
  trial_end,
  created_at,
  updated_at,
  admin_notes
)
SELECT 
  u.id as user_id,
  sp.id as plan_id,
  'trial' as status,
  u.created_at as current_period_start,
  u.created_at + INTERVAL '14 days' as current_period_end,
  u.created_at as trial_start,
  u.created_at + INTERVAL '14 days' as trial_end,
  NOW() as created_at,
  NOW() as updated_at,
  'Auto-assigned trial subscription for existing user' as admin_notes
FROM users u
CROSS JOIN subscription_plans sp
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE sp.name = 'free-trial'
  AND us.user_id IS NULL;

-- 6. Verify the assignments were made
SELECT 'Verification - Users with subscriptions after assignment:' as test;
SELECT 
  COUNT(DISTINCT us.user_id) as total_users_with_subscriptions
FROM user_subscriptions us;

-- 7. Show sample of newly assigned subscriptions
SELECT 'Sample of newly assigned subscriptions:' as test;
SELECT 
  u.email,
  u.first_name,
  u.last_name,
  us.status,
  us.created_at,
  sp.display_name as plan_name,
  us.admin_notes
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.admin_notes = 'Auto-assigned trial subscription for existing user'
ORDER BY us.created_at DESC
LIMIT 5;

-- 8. Check final subscription distribution
SELECT 'Final subscription status distribution:' as test;
SELECT 
  us.status,
  COUNT(*) as count
FROM user_subscriptions us
GROUP BY us.status
ORDER BY us.status;

-- 9. Verify all users now have subscriptions
SELECT 'Final verification - Users without subscriptions:' as test;
SELECT 
  COUNT(*) as remaining_users_without_subscriptions
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- 10. Show complete user subscription overview
SELECT 'Complete user subscription overview:' as test;
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
        WHEN us.trial_end > NOW() THEN 
          'Trial Active (' || EXTRACT(DAY FROM (us.trial_end - NOW())) || ' days left)'
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

-- 11. Check for any remaining issues
SELECT 'Checking for remaining issues...' as test;

-- Check for orphaned subscriptions
SELECT 'Orphaned subscriptions (should be 0):' as test;
SELECT COUNT(*) as orphaned_subscriptions
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- Check for orphaned plan references
SELECT 'Orphaned plan references (should be 0):' as test;
SELECT COUNT(*) as orphaned_plan_references
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- 12. Final summary
SELECT '=== FINAL SUMMARY ===' as test;
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
WHERE us.status = 'trial' AND us.trial_end > NOW()
UNION ALL
SELECT 
  'Expired Trials' as metric,
  COUNT(*) as value
FROM user_subscriptions us
WHERE us.status = 'trial' AND us.trial_end <= NOW()
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
