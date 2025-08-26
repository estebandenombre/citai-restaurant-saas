-- Verify plan_status system is working correctly
-- This script checks that all users have proper plan_status values

-- 1. Check current plan_status distribution
SELECT 'Current plan_status distribution:' as info;
SELECT 
  plan_status,
  COUNT(*) as count
FROM users
GROUP BY plan_status
ORDER BY count DESC;

-- 2. Check users without plan_status
SELECT 'Users without plan_status:' as info;
SELECT 
  COUNT(*) as users_without_plan_status
FROM users
WHERE plan_status IS NULL OR plan_status = '';

-- 3. Check users without plan_id but with plan_status
SELECT 'Users without plan_id but with plan_status:' as info;
SELECT 
  COUNT(*) as inconsistent_users
FROM users
WHERE plan_id IS NULL AND plan_status NOT IN ('no_subscription', 'cancelled');

-- 4. Check users with plan_id but no plan_status
SELECT 'Users with plan_id but no plan_status:' as info;
SELECT 
  COUNT(*) as inconsistent_users
FROM users
WHERE plan_id IS NOT NULL AND (plan_status IS NULL OR plan_status = '');

-- 5. Show sample users with their plan information
SELECT 'Sample users with plan information:' as info;
SELECT 
  u.email,
  u.plan_status,
  u.plan_id,
  sp.display_name as plan_name,
  u.trial_end,
  u.current_period_end,
  CASE 
    WHEN u.plan_status = 'trial' AND u.trial_end > NOW() THEN 
      EXTRACT(DAY FROM (u.trial_end - NOW())) || ' days left'
    WHEN u.plan_status = 'trial' AND u.trial_end <= NOW() THEN 'EXPIRED'
    ELSE u.plan_status
  END as status_summary
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 6. Check for orphaned plan references
SELECT 'Orphaned plan references:' as info;
SELECT 
  COUNT(*) as orphaned_references
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_id IS NOT NULL AND sp.id IS NULL;

-- 7. Test the exact queries that the service uses
SELECT 'Testing service queries:' as info;

-- Test getAllUsers query
SELECT 
  u.id,
  u.email,
  u.plan_status,
  u.plan_id,
  u.trial_end,
  u.current_period_end
FROM users u
ORDER BY u.created_at DESC
LIMIT 5;

-- Test getUserById query
SELECT 
  u.id,
  u.email,
  u.plan_status,
  u.plan_id,
  u.trial_end,
  u.current_period_end
FROM users u
WHERE u.id = (SELECT id FROM users LIMIT 1);

-- 8. Check if all users have proper trial_end dates for trial status
SELECT 'Trial users without trial_end:' as info;
SELECT 
  COUNT(*) as trial_users_without_trial_end
FROM users
WHERE plan_status = 'trial' AND trial_end IS NULL;

-- 9. Check if all users have proper current_period_end dates
SELECT 'Users without current_period_end:' as info;
SELECT 
  COUNT(*) as users_without_period_end
FROM users
WHERE plan_status IN ('active', 'trial') AND current_period_end IS NULL;

-- 10. Show subscription plans available
SELECT 'Available subscription plans:' as info;
SELECT 
  id,
  name,
  display_name,
  price,
  is_active
FROM subscription_plans
ORDER BY price;

-- 11. Test admin access to users table
SELECT 'Testing admin access to users table:' as info;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN plan_status = 'trial' THEN 1 END) as trial_users,
  COUNT(CASE WHEN plan_status = 'active' THEN 1 END) as active_users,
  COUNT(CASE WHEN plan_status = 'cancelled' THEN 1 END) as cancelled_users,
  COUNT(CASE WHEN plan_status = 'no_subscription' THEN 1 END) as no_subscription_users
FROM users;
