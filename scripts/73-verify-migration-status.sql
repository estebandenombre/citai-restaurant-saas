-- Verify migration status and check new columns
-- This script checks if the migration was successful

-- 1. Check if new columns exist in users table
SELECT 'Checking new columns in users table:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('plan_id', 'plan_status', 'trial_end', 'current_period_end')
ORDER BY column_name;

-- 2. Check current user data with plans
SELECT 'Current users with plan information:' as info;
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

-- 3. Check subscription distribution
SELECT 'Subscription status distribution:' as info;
SELECT 
  plan_status,
  COUNT(*) as count
FROM users
GROUP BY plan_status
ORDER BY count DESC;

-- 4. Check for users without plans
SELECT 'Users without plans:' as info;
SELECT 
  COUNT(*) as users_without_plans
FROM users
WHERE plan_id IS NULL OR plan_status = 'no_subscription';

-- 5. Check for orphaned plan references
SELECT 'Orphaned plan references:' as info;
SELECT 
  COUNT(*) as orphaned_references
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_id IS NOT NULL AND sp.id IS NULL;

-- 6. Test the exact query that the service uses
SELECT 'Testing service query:' as info;
SELECT 
  u.id,
  u.plan_id,
  u.plan_status,
  u.trial_end,
  u.current_period_end,
  u.created_at
FROM users u
WHERE u.id = (SELECT id FROM users LIMIT 1);

-- 7. Check if trigger exists
SELECT 'Checking trigger:' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_user_plan';

-- 8. Check function exists
SELECT 'Checking function:' as info;
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'update_user_plan_from_subscription';

-- 9. Show sample subscription plans
SELECT 'Available subscription plans:' as info;
SELECT 
  id,
  name,
  display_name,
  price,
  is_active
FROM subscription_plans
ORDER BY price;

-- 10. Test admin access to users table
SELECT 'Testing admin access to users table:' as info;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN plan_id IS NOT NULL THEN 1 END) as users_with_plans
FROM users;
