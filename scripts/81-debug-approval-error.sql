-- Debug approval error
-- This script helps identify what's causing the approval error

-- 1. Check if there are any pending requests
SELECT 'Checking pending requests:' as info;
SELECT 
  ur.id,
  ur.status,
  ur.created_at,
  ur.updated_at,
  ur.admin_user_id,
  ur.admin_notes,
  ur.processed_at,
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

-- 2. Check the structure of upgrade_requests table
SELECT 'Checking upgrade_requests table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'upgrade_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS policies for upgrade_requests
SELECT 'Checking RLS policies for upgrade_requests:' as info;
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

-- 4. Test a simple update to see if RLS is blocking it
SELECT 'Testing simple update on upgrade_requests:' as info;
DO $$
DECLARE
  test_request_id UUID;
  update_result RECORD;
BEGIN
  -- Get a pending request ID
  SELECT id INTO test_request_id 
  FROM upgrade_requests 
  WHERE status = 'pending' 
  LIMIT 1;
  
  IF test_request_id IS NOT NULL THEN
    RAISE NOTICE 'Testing update on request: %', test_request_id;
    
    -- Try to update just the updated_at field
    UPDATE upgrade_requests 
    SET updated_at = NOW()
    WHERE id = test_request_id;
    
    GET DIAGNOSTICS update_result = ROW_COUNT;
    RAISE NOTICE 'Update affected % rows', update_result;
  ELSE
    RAISE NOTICE 'No pending requests found for testing';
  END IF;
END $$;

-- 5. Check if admin user exists and is active
SELECT 'Checking admin user:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM admin_users
WHERE id = '29ab20d9-80c7-4dee-b108-12d5dff87fa3';

-- 6. Check user plans that would be affected
SELECT 'Checking user plans that would be affected:' as info;
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

-- 7. Check if there are any constraints that might be violated
SELECT 'Checking foreign key constraints:' as info;
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'upgrade_requests';

-- 8. Test the exact update that the service is trying to do
SELECT 'Testing the exact update operation:' as info;
DO $$
DECLARE
  test_request_id UUID;
  test_admin_id UUID := '29ab20d9-80c7-4dee-b108-12d5dff87fa3';
  update_result RECORD;
BEGIN
  -- Get a pending request ID
  SELECT id INTO test_request_id 
  FROM upgrade_requests 
  WHERE status = 'pending' 
  LIMIT 1;
  
  IF test_request_id IS NOT NULL THEN
    RAISE NOTICE 'Testing exact update on request: %', test_request_id;
    
    -- Try the exact update that the service does
    UPDATE upgrade_requests 
    SET 
      status = 'approved',
      admin_user_id = test_admin_id,
      admin_notes = 'Test approval via SQL',
      processed_at = NOW(),
      updated_at = NOW()
    WHERE id = test_request_id
    AND status = 'pending';
    
    GET DIAGNOSTICS update_result = ROW_COUNT;
    RAISE NOTICE 'Update affected % rows', update_result;
    
    IF update_result = 0 THEN
      RAISE NOTICE 'No rows were updated - possible RLS issue or status mismatch';
    END IF;
  ELSE
    RAISE NOTICE 'No pending requests found for testing';
  END IF;
END $$;

-- 9. Check current authentication context
SELECT 'Checking current authentication context:' as info;
SELECT 
  current_user,
  session_user,
  current_database(),
  current_schema;
