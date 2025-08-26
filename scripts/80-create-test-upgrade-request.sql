-- Create test upgrade request if none exist
-- This script creates a test upgrade request for testing the approval functionality

-- 1. Check if there are any upgrade requests
SELECT 'Checking existing upgrade requests:' as info;
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests
FROM upgrade_requests;

-- 2. Get sample user and plans for testing
SELECT 'Getting sample user and plans:' as info;
SELECT 
  u.id as user_id,
  u.email,
  u.plan_id as current_plan_id,
  sp1.name as current_plan_name
FROM users u
LEFT JOIN subscription_plans sp1 ON u.plan_id = sp1.id
WHERE u.plan_status = 'trial'
LIMIT 1;

SELECT 'Available plans for upgrade:' as info;
SELECT 
  id as requested_plan_id,
  name as requested_plan_name,
  display_name,
  price
FROM subscription_plans
WHERE name != 'free-trial-plan'
ORDER BY price;

-- 3. Create test upgrade request if none exist
DO $$
DECLARE
  test_user_id UUID;
  current_plan_id UUID;
  requested_plan_id UUID;
  request_count INTEGER;
BEGIN
  -- Check if there are any pending requests
  SELECT COUNT(*) INTO request_count FROM upgrade_requests WHERE status = 'pending';
  
  IF request_count = 0 THEN
    RAISE NOTICE 'No pending requests found, creating test request...';
    
    -- Get a test user (first user with trial status)
    SELECT u.id, u.plan_id INTO test_user_id, current_plan_id
    FROM users u
    WHERE u.plan_status = 'trial'
    LIMIT 1;
    
    -- Get a plan to upgrade to (first paid plan)
    SELECT id INTO requested_plan_id
    FROM subscription_plans
    WHERE name != 'free-trial-plan'
    ORDER BY price
    LIMIT 1;
    
    IF test_user_id IS NOT NULL AND requested_plan_id IS NOT NULL THEN
      -- Create test upgrade request
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
        'Test upgrade request for approval functionality',
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Created test upgrade request for user: %', test_user_id;
      RAISE NOTICE 'Upgrade: % -> %', current_plan_id, requested_plan_id;
    ELSE
      RAISE NOTICE 'Could not find suitable user or plan for test request';
    END IF;
  ELSE
    RAISE NOTICE 'Found % pending requests, no need to create test request', request_count;
  END IF;
END $$;

-- 4. Show the created test request
SELECT 'Test upgrade request created:' as info;
SELECT 
  ur.id,
  ur.status,
  ur.created_at,
  u.email as user_email,
  cp.name as current_plan,
  rp.name as requested_plan,
  ur.reason
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans cp ON ur.current_plan_id = cp.id
LEFT JOIN subscription_plans rp ON ur.requested_plan_id = rp.id
WHERE ur.status = 'pending'
ORDER BY ur.created_at DESC;

-- 5. Show user's current plan
SELECT 'User current plan:' as info;
SELECT 
  u.id,
  u.email,
  u.plan_id,
  u.plan_status,
  sp.name as plan_name
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.id IN (
  SELECT user_id FROM upgrade_requests WHERE status = 'pending'
)
ORDER BY u.created_at DESC;
