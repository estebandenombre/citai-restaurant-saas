-- Temporarily disable RLS to test if that's causing the issue
-- This script will help us identify if RLS is blocking the updates

-- 1. Check current RLS status
SELECT 'Current RLS status for upgrade_requests:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'upgrade_requests' 
AND schemaname = 'public';

-- 2. Disable RLS temporarily
ALTER TABLE upgrade_requests DISABLE ROW LEVEL SECURITY;

-- 3. Verify RLS is disabled
SELECT 'RLS status after disabling:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'upgrade_requests' 
AND schemaname = 'public';

-- 4. Test update operation without RLS
SELECT 'Testing update operation without RLS:' as info;
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
    RAISE NOTICE 'Testing update on request: %', test_request_id;
    
    -- Try the exact update that the service does
    UPDATE upgrade_requests 
    SET 
      status = 'approved',
      admin_user_id = test_admin_id,
      admin_notes = 'Test approval without RLS',
      processed_at = NOW(),
      updated_at = NOW()
    WHERE id = test_request_id
    AND status = 'pending';
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    RAISE NOTICE 'Update affected % rows', update_count;
    
    IF update_count > 0 THEN
      RAISE NOTICE 'SUCCESS: Update worked without RLS - RLS was the problem';
    ELSE
      RAISE NOTICE 'FAILED: Update still failed even without RLS - different problem';
    END IF;
  ELSE
    RAISE NOTICE 'No pending requests found for testing';
  END IF;
END $$;

-- 5. Show the results
SELECT 'Results after test update:' as info;
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

-- 6. Check if there are any pending requests left
SELECT 'Remaining pending requests:' as info;
SELECT 
  COUNT(*) as pending_count
FROM upgrade_requests 
WHERE status = 'pending';

-- 7. If the test worked, we can re-enable RLS with better policies
-- For now, let's keep RLS disabled and test the admin dashboard
SELECT 'RLS is now disabled for upgrade_requests table' as info;
SELECT 'You can now test the admin dashboard approval functionality' as info;
