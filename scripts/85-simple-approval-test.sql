-- Simple approval test - focus on user plan update only
-- This script tests if we can update user plans directly

-- 1. Check current pending requests
SELECT 'Current pending requests:' as info;
SELECT 
  ur.id,
  ur.user_id,
  ur.requested_plan_id,
  u.email,
  u.plan_id as current_plan_id,
  u.plan_status
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
WHERE ur.status = 'pending'
ORDER BY ur.created_at DESC;

-- 2. Test direct user plan update (this is what we really need)
SELECT 'Testing direct user plan update:' as info;
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
    
    -- Try to update user plan directly
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
      RAISE NOTICE 'SUCCESS: User plan update worked!';
    ELSE
      RAISE NOTICE 'FAILED: User plan update failed';
    END IF;
  ELSE
    RAISE NOTICE 'No pending requests found for testing';
  END IF;
END $$;

-- 3. Show the updated user
SELECT 'Updated user details:' as info;
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

-- 4. Test upgrade_requests update separately
SELECT 'Testing upgrade_requests update:' as info;
DO $$
DECLARE
  test_request_id UUID;
  test_admin_id UUID := '29ab20d9-80c7-4dee-b108-12d5dff87fa3';
  update_count INTEGER;
BEGIN
  -- Get a pending request
  SELECT id INTO test_request_id 
  FROM upgrade_requests 
  WHERE status = 'pending' 
  LIMIT 1;
  
  IF test_request_id IS NOT NULL THEN
    RAISE NOTICE 'Testing upgrade_requests update for request: %', test_request_id;
    
    -- Try to update the request
    UPDATE upgrade_requests 
    SET 
      status = 'approved',
      admin_user_id = test_admin_id,
      admin_notes = 'Test approval via SQL',
      processed_at = NOW(),
      updated_at = NOW()
    WHERE id = test_request_id
    AND status = 'pending';
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    RAISE NOTICE 'Request update affected % rows', update_count;
    
    IF update_count > 0 THEN
      RAISE NOTICE 'SUCCESS: Request update worked!';
    ELSE
      RAISE NOTICE 'FAILED: Request update failed';
    END IF;
  ELSE
    RAISE NOTICE 'No pending requests found for testing';
  END IF;
END $$;

-- 5. Final status
SELECT 'Final status:' as info;
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests
FROM upgrade_requests;

-- 6. Show updated requests
SELECT 'Updated requests:' as info;
SELECT 
  ur.id,
  ur.status,
  ur.admin_user_id,
  ur.processed_at,
  u.email,
  sp.name as plan_name
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans sp ON ur.requested_plan_id = sp.id
WHERE ur.status = 'approved'
ORDER BY ur.processed_at DESC;
