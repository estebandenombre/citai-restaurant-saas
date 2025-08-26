-- Test admin authentication and RLS policies
-- This script helps diagnose authentication issues

-- 1. Check if admin user exists and is properly configured
SELECT 'Admin User Configuration:' as test;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at,
  updated_at
FROM admin_users
WHERE email = 'admin@tably.com';

-- 2. Check current authentication context
SELECT 'Current Auth Context:' as test;
SELECT 
  auth.jwt() as current_jwt,
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 3. Test RLS policies for user_subscriptions
SELECT 'Testing RLS Policies for user_subscriptions:' as test;

-- Test as regular user (should fail for admin operations)
SELECT 'Testing as regular user (should be limited):' as test;
SELECT COUNT(*) as subscription_count
FROM user_subscriptions;

-- 4. Check if we can bypass RLS temporarily for testing
SELECT 'Testing without RLS (temporary):' as test;
SET row_security = off;
SELECT COUNT(*) as total_subscriptions_no_rls
FROM user_subscriptions;
SET row_security = on;

-- 5. Check subscription data structure
SELECT 'Subscription Data Structure:' as test;
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

-- 6. Test specific user subscription history
SELECT 'Testing specific user subscription history:' as test;
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

-- 7. Check if there are any subscription records at all
SELECT 'Subscription Records Summary:' as test;
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_subscriptions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions
FROM user_subscriptions;

-- 8. Check for any orphaned subscriptions
SELECT 'Checking for orphaned subscriptions:' as test;
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.created_at
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- 9. Check for any orphaned plan references
SELECT 'Checking for orphaned plan references:' as test;
SELECT 
  us.id,
  us.plan_id,
  us.status,
  us.created_at
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- 10. Test admin user authentication simulation
SELECT 'Admin Authentication Test:' as test;
-- This simulates what the admin service should be able to do
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = 'admin@tably.com' 
      AND is_active = true
    ) THEN 'Admin user exists and is active'
    ELSE 'Admin user not found or inactive'
  END as admin_status;
