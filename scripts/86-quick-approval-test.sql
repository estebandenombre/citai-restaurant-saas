-- Quick approval test - check current state and test functionality
-- This script helps verify if the approval system is working

-- 1. Check if there are any pending requests
SELECT 'Checking for pending requests:' as info;
SELECT 
  COUNT(*) as pending_count
FROM upgrade_requests 
WHERE status = 'pending';

-- 2. If no pending requests, create one for testing
DO $$
DECLARE
  pending_count INTEGER;
  test_user_id UUID;
  current_plan_id UUID;
  requested_plan_id UUID;
BEGIN
  -- Check pending requests
  SELECT COUNT(*) INTO pending_count FROM upgrade_requests WHERE status = 'pending';
  
  IF pending_count = 0 THEN
    RAISE NOTICE 'No pending requests found, creating test request...';
    
    -- Get a test user with trial status
    SELECT u.id, u.plan_id INTO test_user_id, current_plan_id
    FROM users u
    WHERE u.plan_status = 'trial'
    LIMIT 1;
    
    -- Get a plan to upgrade to
    SELECT id INTO requested_plan_id
    FROM subscription_plans
    WHERE name != 'free-trial-plan'
    ORDER BY price
    LIMIT 1;
    
    IF test_user_id IS NOT NULL AND requested_plan_id IS NOT NULL THEN
      INSERT INTO upgrade_requests (
        user_id,
        current_plan_id,
        requested_plan_id,
        status,
        reason,
        created_at,
        updated_at
      ) VALUES (
        test_user_id,
        current_plan_id,
        requested_plan_id,
        'pending',
        'Test request for approval testing',
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Created test request for user: %', test_user_id;
    ELSE
      RAISE NOTICE 'Could not create test request - no suitable user or plan found';
    END IF;
  ELSE
    RAISE NOTICE 'Found % pending requests, no need to create test request', pending_count;
  END IF;
END $$;

-- 3. Show current pending requests
SELECT 'Current pending requests:' as info;
SELECT 
  ur.id as request_id,
  ur.user_id,
  ur.requested_plan_id,
  u.email,
  u.plan_id as current_plan_id,
  u.plan_status,
  cp.name as current_plan_name,
  rp.name as requested_plan_name
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans cp ON ur.current_plan_id = cp.id
LEFT JOIN subscription_plans rp ON ur.requested_plan_id = rp.id
WHERE ur.status = 'pending'
ORDER BY ur.created_at DESC;

-- 4. Test the exact user plan update that the app does
SELECT 'Testing user plan update (same as app):' as info;
DO $$
DECLARE
  test_user_id UUID;
  test_plan_id UUID;
  update_count INTEGER;
BEGIN
  -- Get a pending request
  SELECT ur.user_id, ur.requested_plan_id INTO test_user_id, test_plan_id
  FROM upgrade_requests ur
  WHERE ur.status = 'pending'
  LIMIT 1;
  
  IF test_user_id IS NOT NULL AND test_plan_id IS NOT NULL THEN
    RAISE NOTICE 'Testing user plan update for user: %', test_user_id;
    RAISE NOTICE 'Updating to plan: %', test_plan_id;
    
    -- This is exactly what the app does
    UPDATE users 
    SET 
      plan_id = test_plan_id,
      plan_status = 'active',
      current_period_end = NOW() + INTERVAL '30 days',
      trial_end = NULL
    WHERE id = test_user_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    RAISE NOTICE 'User plan update affected % rows', update_count;
    
    IF update_count > 0 THEN
      RAISE NOTICE '✅ SUCCESS: User plan update worked!';
    ELSE
      RAISE NOTICE '❌ FAILED: User plan update failed';
    END IF;
  ELSE
    RAISE NOTICE 'No pending requests found for testing';
  END IF;
END $$;

-- 5. Show the result
SELECT 'User plan after update:' as info;
SELECT 
  u.id,
  u.email,
  u.plan_id,
  u.plan_status,
  u.current_period_end,
  u.trial_end,
  sp.name as plan_name
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.id IN (
  SELECT user_id FROM upgrade_requests WHERE status = 'pending'
)
ORDER BY u.created_at DESC;

-- 6. Instructions for testing
SELECT 'READY FOR TESTING:' as info;
SELECT '1. Go to admin dashboard' as instruction;
SELECT '2. Go to Requests tab' as instruction;
SELECT '3. Find a pending request' as instruction;
SELECT '4. Click "Review" then "Approve"' as instruction;
SELECT '5. Check browser console for logs' as instruction;
