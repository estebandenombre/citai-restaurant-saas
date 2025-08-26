-- Simple test to verify admin system is working

-- Check if admin user exists
SELECT 'Admin User Check:' as test;
SELECT 
  email,
  first_name,
  last_name,
  role,
  is_active
FROM admin_users 
WHERE email = 'admin@tably.com';

-- Check if upgrade_requests table exists
SELECT 'Upgrade Requests Table Check:' as test;
SELECT 
  table_name,
  '✅ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'upgrade_requests';

-- Check if we have any upgrade requests
SELECT 'Upgrade Requests Count:' as test;
SELECT COUNT(*) as total_requests FROM upgrade_requests;

-- Show sample data if any exists
SELECT 'Sample Upgrade Requests:' as test;
SELECT 
  ur.id,
  ur.status,
  ur.created_at,
  u.email as user_email
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
ORDER BY ur.created_at DESC
LIMIT 3;

-- Final status
SELECT 'System Status:' as test;
SELECT 
  'Admin User' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@tably.com') 
    THEN '✅ READY'
    ELSE '❌ MISSING'
  END as status

UNION ALL

SELECT 
  'Upgrade Requests Table' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'upgrade_requests') 
    THEN '✅ READY'
    ELSE '❌ MISSING'
  END as status;
