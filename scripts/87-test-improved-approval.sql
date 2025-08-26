-- Test improved approval functionality
-- This script creates test data and verifies the approval process

-- 1. Check current state
SELECT 'Current state before testing:' as info;
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests
FROM upgrade_requests;

-- 2. Create test upgrade request if none exist
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
    RAISE NOTICE 'Creating test upgrade request...';
    
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
        'Test request for improved approval testing',
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Created test request for user: %', test_user_id;
      RAISE NOTICE 'Upgrade: % -> %', current_plan_id, requested_plan_id;
    ELSE
      RAISE NOTICE 'Could not create test request - no suitable user or plan found';
    END IF;
  ELSE
    RAISE NOTICE 'Found % pending requests, no need to create test request', pending_count;
  END IF;
END $$;

-- 3. Show test request details
SELECT 'Test request details:' as info;
SELECT 
  ur.id as request_id,
  ur.user_id,
  ur.requested_plan_id,
  u.email,
  u.plan_id as current_plan_id,
  u.plan_status,
  cp.name as current_plan_name,
  rp.name as requested_plan_name,
  ur.reason
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans cp ON ur.current_plan_id = cp.id
LEFT JOIN subscription_plans rp ON ur.requested_plan_id = rp.id
WHERE ur.status = 'pending'
ORDER BY ur.created_at DESC;

-- 4. Show user's current plan before approval
SELECT 'User current plan before approval:' as info;
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

-- 5. Instructions for testing
SELECT 'READY FOR TESTING IMPROVED APPROVAL:' as info;
SELECT '1. Go to admin dashboard: http://localhost:3000/admin' as instruction;
SELECT '2. Go to Requests tab' as instruction;
SELECT '3. Find the pending request' as instruction;
SELECT '4. Click "Review" then "Approve"' as instruction;
SELECT '5. You should see a detailed confirmation message' as instruction;
SELECT '6. The request should disappear from pending list' as instruction;
SELECT '7. Check the Processed Requests History section' as instruction;

-- 6. Expected behavior
SELECT 'EXPECTED BEHAVIOR:' as info;
SELECT '✅ Detailed confirmation: "user@email.com has been successfully upgraded from Plan A to Plan B"' as expected;
SELECT '✅ Request disappears from pending list' as expected;
SELECT '✅ Request appears in Processed Requests History' as expected;
SELECT '✅ User plan is updated in database' as expected;
