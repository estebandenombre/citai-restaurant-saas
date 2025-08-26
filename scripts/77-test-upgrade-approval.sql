-- Test upgrade approval functionality
-- This script verifies that upgrade requests can be approved and user plans updated

-- 1. Check current upgrade requests
SELECT 'Current upgrade requests:' as info;
SELECT 
  ur.id,
  ur.status,
  ur.created_at,
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

-- 2. Check user plans before approval
SELECT 'User plans before approval:' as info;
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
  SELECT user_id FROM upgrade_requests WHERE status = 'pending'
)
ORDER BY u.created_at DESC;

-- 3. Show pending requests that can be approved
SELECT 'Pending requests that can be approved:' as info;
SELECT 
  ur.id as request_id,
  ur.user_id,
  u.email,
  cp.name as current_plan,
  rp.name as requested_plan,
  ur.reason,
  ur.created_at
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans cp ON ur.current_plan_id = cp.id
LEFT JOIN subscription_plans rp ON ur.requested_plan_id = rp.id
WHERE ur.status = 'pending'
ORDER BY ur.created_at DESC;

-- 4. Test the approval process manually (if there are pending requests)
-- This simulates what the approveUpgradeRequest function does
DO $$
DECLARE
  request_record RECORD;
  user_record RECORD;
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
        admin_user_id = 'test-admin-id',
        admin_notes = 'Approved via test script',
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
      
      RAISE NOTICE 'Successfully approved request and updated user plan';
    ELSE
      RAISE NOTICE 'User not found: %', request_record.user_id;
    END IF;
  ELSE
    RAISE NOTICE 'No pending requests found';
  END IF;
END $$;

-- 5. Check results after approval
SELECT 'Results after approval:' as info;

-- Check updated requests
SELECT 
  ur.id,
  ur.status,
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

-- 6. Show all upgrade requests with their final status
SELECT 'All upgrade requests with final status:' as info;
SELECT 
  ur.id,
  ur.status,
  ur.created_at,
  ur.processed_at,
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

-- 7. Test RLS policies for upgrade_requests
SELECT 'Testing RLS policies for upgrade_requests:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'upgrade_requests';

-- 8. Check if admin can access upgrade_requests
SELECT 'Testing admin access to upgrade_requests:' as info;
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests
FROM upgrade_requests;
