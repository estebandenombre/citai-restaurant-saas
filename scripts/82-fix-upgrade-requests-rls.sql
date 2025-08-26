-- Fix RLS policies for upgrade_requests table
-- This script ensures that admin users can update upgrade requests

-- 1. Check current RLS policies
SELECT 'Current RLS policies for upgrade_requests:' as info;
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

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Users can create upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Admin users can view all upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Admin users can update all upgrade requests" ON upgrade_requests;

-- 3. Create new policies that allow admin access
-- Policy for users to view their own requests
CREATE POLICY "Users can view their own upgrade requests" ON upgrade_requests
FOR SELECT USING (
  auth.jwt() ->> 'email' IN (
    SELECT email FROM users WHERE id = user_id
  )
);

-- Policy for users to create requests
CREATE POLICY "Users can create upgrade requests" ON upgrade_requests
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' IN (
    SELECT email FROM users WHERE id = user_id
  )
);

-- Policy for users to update their own pending requests (cancel)
CREATE POLICY "Users can update their own pending requests" ON upgrade_requests
FOR UPDATE USING (
  auth.jwt() ->> 'email' IN (
    SELECT email FROM users WHERE id = user_id
  )
  AND status = 'pending'
);

-- Policy for admin users to view all requests
CREATE POLICY "Admin users can view all upgrade requests" ON upgrade_requests
FOR SELECT USING (
  auth.jwt() ->> 'email' IN (
    SELECT email FROM admin_users WHERE is_active = true
  )
);

-- Policy for admin users to update all requests
CREATE POLICY "Admin users can update all upgrade requests" ON upgrade_requests
FOR UPDATE USING (
  auth.jwt() ->> 'email' IN (
    SELECT email FROM admin_users WHERE is_active = true
  )
);

-- 4. Verify the new policies
SELECT 'New RLS policies for upgrade_requests:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'upgrade_requests'
ORDER BY policyname;

-- 5. Test admin access to upgrade_requests
SELECT 'Testing admin access to upgrade_requests:' as info;
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests
FROM upgrade_requests;

-- 6. Check if RLS is enabled on the table
SELECT 'Checking if RLS is enabled:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'upgrade_requests' 
AND schemaname = 'public';

-- 7. Enable RLS if not already enabled
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;

-- 8. Test a simple update operation
SELECT 'Testing update operation:' as info;
DO $$
DECLARE
  test_request_id UUID;
  update_count INTEGER;
BEGIN
  -- Get a pending request
  SELECT id INTO test_request_id 
  FROM upgrade_requests 
  WHERE status = 'pending' 
  LIMIT 1;
  
  IF test_request_id IS NOT NULL THEN
    RAISE NOTICE 'Testing update on request: %', test_request_id;
    
    -- Try to update the request
    UPDATE upgrade_requests 
    SET updated_at = NOW()
    WHERE id = test_request_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    RAISE NOTICE 'Update affected % rows', update_count;
  ELSE
    RAISE NOTICE 'No pending requests found for testing';
  END IF;
END $$;
