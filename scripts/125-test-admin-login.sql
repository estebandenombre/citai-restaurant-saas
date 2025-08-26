-- Test Admin Login
-- This script verifies that admin login credentials work

-- 1. Check if admin user exists and has proper setup
SELECT '1. Admin user setup verification:' as info;
SELECT 
    au.email,
    au.encrypted_password IS NOT NULL as has_password,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    pu.role,
    pu.plan_status,
    CASE 
        WHEN au.encrypted_password IS NOT NULL 
         AND au.email_confirmed_at IS NOT NULL 
         AND pu.role = 'admin' 
         AND pu.plan_status = 'active'
        THEN '✅ READY FOR LOGIN'
        ELSE '❌ NOT READY FOR LOGIN'
    END as login_status
FROM auth.users au
LEFT JOIN users pu ON au.email = pu.email
WHERE au.email = 'ortizvicenteesteban@gmail.com';

-- 2. Test password verification
SELECT '2. Password verification test:' as info;
SELECT 
    email,
    CASE 
        WHEN crypt('Admin123!', encrypted_password) = encrypted_password THEN '✅ PASSWORD MATCHES'
        ELSE '❌ PASSWORD DOES NOT MATCH'
    END as password_test
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 3. Check if admin can access required tables
SELECT '3. Admin access test:' as info;
SELECT 
    'upgrade_requests' as table_name,
    COUNT(*) as record_count
FROM upgrade_requests;

SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users;

SELECT 
    'subscription_plans' as table_name,
    COUNT(*) as record_count
FROM subscription_plans;

-- 4. Manual login test instructions
SELECT '4. Manual login test:' as info;
SELECT 'Step 1: Go to http://localhost:3000/admin/upgrade-requests' as step;
SELECT 'Step 2: Enter email: ortizvicenteesteban@gmail.com' as step;
SELECT 'Step 3: Enter password: Admin123!' as step;
SELECT 'Step 4: Click "Login as Admin"' as step;
SELECT 'Step 5: Check browser console for any errors' as step;

-- 5. Alternative login test
SELECT '5. Alternative login test:' as info;
SELECT 'If the above doesn''t work, try:' as note;
SELECT '1. Clear browser cache and cookies' as step;
SELECT '2. Try incognito/private browsing mode' as step;
SELECT '3. Check if you get any error messages' as step;
SELECT '4. Verify the URL shows /admin/upgrade-requests' as step;
