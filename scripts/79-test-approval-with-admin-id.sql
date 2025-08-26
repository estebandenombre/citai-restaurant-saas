-- Test approval functionality with correct admin ID
-- This script tests the upgrade approval process with the real admin ID

-- 1. Check current state
SELECT 'Current state before testing:' as info;
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

-- 2. Check user plans before approval
SELECT 'User plans before approval:' as info;
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

-- 3. Test approval process with correct admin ID
DO $$
DECLARE
  request_record RECORD;
  user_record RECORD;
  admin_id UUID := '29ab20d9-80c7-4dee-b108-12d5dff87fa3';
BEGIN
  -- Get the first pending request
  SELECT * INTO request_record 
  FROM upgrade_requests 
  WHERE status = 'pending' 
  LIMIT 1;
  
  IF FOUND THEN
    RAISE NOTICE 'Found pending request: % for user: %', request_record.id, request_record.user_id;
    
    -- Get user info
    SELECT * INTO user_record 
    FROM users 
    WHERE id = request_record.user_id;
    
    IF FOUND THEN
      RAISE NOTICE 'Current user plan: % -> %', user_record.plan_id, request_record.requested_plan_id;
      
      -- Update the request status (simulate approval)
      UPDATE upgrade_requests 
      SET 
        status = 'approved',
        admin_user_id = admin_id,
        admin_notes = 'Approved via test script with correct admin ID',
        processed_at = NOW(),
        updated_at = NOW()
      WHERE id = request_record.id;
      
      -- Update the user's plan
      UPDATE users 
      SET 
        plan_id = request_record.requested_plan_id,
        plan_status = 'active',
        current_period_end = NOW() + INTERVAL '30 days',
        trial_end = NULL
      WHERE id = request_record.user_id;
      
      RAISE NOTICE 'Successfully approved request and updated user plan with admin ID: %', admin_id;
    ELSE
      RAISE NOTICE 'User not found: %', request_record.user_id;
    END IF;
  ELSE
    RAISE NOTICE 'No pending requests found';
  END IF;
END $$;

-- 4. Check results after approval
SELECT 'Results after approval:' as info;

-- Check updated requests
SELECT 
  ur.id,
  ur.status,
  ur.admin_user_id,
  ur.admin_notes,
  ur.processed_at,
  u.email as user_email,
  cp.name as current_plan,
  rp.name as requested_plan
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans cp ON ur.current_plan_id = cp.id
LEFT JOIN subscription_plans rp ON ur.requested_plan_id = rp.id
WHERE ur.status = 'approved'
ORDER BY ur.processed_at DESC;

-- Check updated user plans
SELECT 
  u.id,
  u.email,
  u.plan_id,
  u.plan_status,
  u.trial_end,
  u.current_period_end,
  sp.name as plan_name
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.id IN (
  SELECT user_id FROM upgrade_requests WHERE status = 'approved'
)
ORDER BY u.created_at DESC;

-- 5. Verify admin user exists
SELECT 'Verify admin user exists:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active
FROM admin_users
WHERE id = '29ab20d9-80c7-4dee-b108-12d5dff87fa3';

-- 6. Show all upgrade requests with their final status
SELECT 'All upgrade requests with final status:' as info;
SELECT 
  ur.id,
  ur.status,
  ur.created_at,
  ur.processed_at,
  ur.admin_user_id,
  u.email as user_email,
  cp.name as current_plan,
  rp.name as requested_plan,
  ur.reason,
  ur.admin_notes
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans cp ON ur.current_plan_id = cp.id
LEFT JOIN subscription_plans rp ON ur.requested_plan_id = rp.id
ORDER BY ur.created_at DESC;

-- 7. Test the exact query that the service uses
SELECT 'Testing service query for pending requests:' as info;
SELECT 
  ur.id,
  ur.user_id,
  ur.current_plan_id,
  ur.requested_plan_id,
  ur.status,
  ur.created_at
FROM upgrade_requests ur
WHERE ur.status = 'pending'
ORDER BY ur.created_at DESC;
