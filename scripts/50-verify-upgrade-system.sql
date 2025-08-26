-- Verify the upgrade request system is working correctly

-- Check if all tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('upgrade_requests', 'admin_users') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('upgrade_requests', 'admin_users');

-- Check upgrade_requests table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'upgrade_requests'
ORDER BY ordinal_position;

-- Check admin_users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'admin_users'
ORDER BY ordinal_position;

-- Check foreign key constraints
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
AND tc.table_name IN ('upgrade_requests', 'admin_users');

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'admin_users')
ORDER BY tablename, policyname;

-- Check if admin user exists
SELECT 
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM admin_users 
WHERE email = 'admin@tably.com';

-- Check if there are any upgrade requests
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_requests
FROM upgrade_requests;

-- Show sample upgrade requests (if any exist)
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
ORDER BY ur.created_at DESC
LIMIT 5;
