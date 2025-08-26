-- Test the trigger for new users
-- This script verifies that the trigger correctly assigns trial subscriptions

-- 1. First, check if the trigger exists and is working
SELECT '=== TRIGGER STATUS CHECK ===' as test;

-- Check trigger function
SELECT 'Trigger function status:' as test;
SELECT 
  proname as function_name,
  CASE WHEN prosrc IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_proc 
WHERE proname = 'assign_trial_subscription_to_new_user';

-- Check trigger
SELECT 'Trigger status:' as test;
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  CASE WHEN tgname IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_trigger
WHERE tgname = 'auto_assign_trial_subscription';

-- 2. Test the trigger by creating a test user (if it doesn't exist)
SELECT '=== TESTING TRIGGER ===' as test;

-- Check if test user already exists
SELECT 'Checking for existing test user:' as test;
SELECT 
  id,
  email,
  created_at
FROM users 
WHERE email = 'test-trigger@example.com';

-- If test user doesn't exist, create one to test the trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'test-trigger@example.com') THEN
    INSERT INTO users (
      email,
      password_hash,
      first_name,
      last_name,
      role
    ) VALUES (
      'test-trigger@example.com',
      'test-hash',
      'Test',
      'Trigger',
      'owner'
    );
    RAISE NOTICE 'Created test user to trigger subscription assignment';
  ELSE
    RAISE NOTICE 'Test user already exists';
  END IF;
END $$;

-- 3. Check if the trigger worked
SELECT 'Checking if trigger assigned subscription:' as test;
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  us.id as subscription_id,
  us.status,
  us.created_at as subscription_created,
  us.trial_end,
  sp.display_name as plan_name
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE u.email = 'test-trigger@example.com';

-- 4. Show recent users and their subscription status
SELECT 'Recent users and their subscription status:' as test;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at as user_created,
  us.id as subscription_id,
  us.status,
  us.created_at as subscription_created,
  us.trial_end,
  sp.display_name as plan_name,
  CASE 
    WHEN us.status = 'trial' AND us.trial_end > NOW() THEN 
      'Trial Active (' || EXTRACT(DAY FROM (us.trial_end - NOW())) || ' days left)'
    WHEN us.status = 'trial' AND us.trial_end <= NOW() THEN 'Trial Expired'
    WHEN us.status = 'active' THEN 'Active Subscription'
    WHEN us.id IS NULL THEN 'No Subscription'
    ELSE us.status
  END as subscription_details
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE u.created_at >= NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Check subscription distribution for recent users
SELECT 'Subscription distribution for recent users:' as test;
SELECT 
  COALESCE(us.status, 'no_subscription') as status,
  COUNT(*) as count
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.created_at >= NOW() - INTERVAL '7 days'
GROUP BY us.status
ORDER BY count DESC;

-- 6. Verify trigger function logic
SELECT 'Trigger function source code:' as test;
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'assign_trial_subscription_to_new_user';

-- 7. Test manual trigger execution (if needed)
SELECT 'Manual trigger test (if needed):' as test;
-- This would be used if the trigger isn't working automatically
-- Uncomment the following if you need to manually test the trigger function
/*
DO $$
DECLARE
  test_user_id UUID;
  trial_plan_id UUID;
BEGIN
  -- Get the test user ID
  SELECT id INTO test_user_id FROM users WHERE email = 'test-trigger@example.com';
  
  -- Get the free trial plan ID
  SELECT id INTO trial_plan_id FROM subscription_plans WHERE name = 'free-trial';
  
  -- Manually call the trigger function
  IF test_user_id IS NOT NULL AND trial_plan_id IS NOT NULL THEN
    PERFORM assign_trial_subscription_to_new_user();
    RAISE NOTICE 'Manually executed trigger function for test user';
  ELSE
    RAISE NOTICE 'Test user or trial plan not found';
  END IF;
END $$;
*/

-- 8. Clean up test user (optional)
SELECT 'Cleanup instructions:' as test;
SELECT 
  'To clean up test user, run:' as instruction,
  'DELETE FROM user_subscriptions WHERE user_id = (SELECT id FROM users WHERE email = ''test-trigger@example.com'');' as sql1,
  'DELETE FROM users WHERE email = ''test-trigger@example.com'';' as sql2;
