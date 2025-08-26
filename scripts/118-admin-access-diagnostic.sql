-- Admin Access Diagnostic
-- This script helps diagnose why admin can't access the admin panel

-- 1. Check if admin user exists and has correct role
SELECT '1. Admin user verification:' as info;
SELECT 
    id,
    email,
    role,
    plan_status,
    is_active,
    has_completed_onboarding,
    created_at,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN ROLE'
        ELSE '❌ NOT ADMIN ROLE'
    END as role_status
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 2. Check if upgrade_requests table exists and has data
SELECT '2. Upgrade requests table check:' as info;
SELECT 
    'upgrade_requests' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests
FROM upgrade_requests;

-- 3. Check RLS policies
SELECT '3. RLS policies check:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
ORDER BY tablename, policyname;

-- 4. Check if RLS is enabled on tables
SELECT '4. RLS enabled check:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
AND schemaname = 'public';

-- 5. Check subscription plans
SELECT '5. Subscription plans check:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    billing_cycle,
    is_active
FROM subscription_plans
ORDER BY price;

-- 6. Test admin access simulation
SELECT '6. Admin access simulation:' as info;
-- This simulates what the admin panel would query
SELECT 
    'upgrade_requests' as table_name,
    COUNT(*) as accessible_records
FROM upgrade_requests;

SELECT 
    'users' as table_name,
    COUNT(*) as accessible_records
FROM users;

SELECT 
    'subscription_plans' as table_name,
    COUNT(*) as accessible_records
FROM subscription_plans;

-- 7. Check for any potential issues
SELECT '7. Potential issues check:' as info;

-- Check if there are any users without roles
SELECT 
    'Users without roles' as issue,
    COUNT(*) as count
FROM users 
WHERE role IS NULL OR role = '';

-- Check if there are any upgrade requests without user_email
SELECT 
    'Upgrade requests without user_email' as issue,
    COUNT(*) as count
FROM upgrade_requests 
WHERE user_email IS NULL OR user_email = '';

-- 8. Instructions for manual testing
SELECT '8. Manual testing instructions:' as info;
SELECT '1. Open browser developer tools (F12)' as instruction;
SELECT '2. Go to /admin/upgrade-requests' as instruction;
SELECT '3. Check Console tab for any errors' as instruction;
SELECT '4. Check Network tab for failed requests' as instruction;
SELECT '5. Try logging out and logging back in' as instruction;
SELECT '6. Clear browser cache and cookies' as instruction;
