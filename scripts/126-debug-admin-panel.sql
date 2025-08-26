-- Debug Admin Panel
-- This script helps identify issues with the admin panel

-- 1. Check if all required tables exist
SELECT '1. Required tables check:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'upgrade_requests', 'subscription_plans') THEN '✅ REQUIRED'
        ELSE '⚠️ OPTIONAL'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'upgrade_requests', 'subscription_plans', 'admin_audit_log')
ORDER BY table_name;

-- 2. Check RLS policies
SELECT '2. RLS policies check:' as info;
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN policyname LIKE '%Admin%' THEN '🔒 ADMIN POLICY'
        WHEN policyname LIKE '%User%' THEN '👤 USER POLICY'
        ELSE '⚙️ OTHER POLICY'
    END as policy_type
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
ORDER BY tablename, policyname;

-- 3. Check if RLS is enabled
SELECT '3. RLS enabled check:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as status
FROM pg_tables 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
AND schemaname = 'public';

-- 4. Check admin user details
SELECT '4. Admin user details:' as info;
SELECT 
    'auth.users' as source,
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    last_sign_in_at
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com'

UNION ALL

SELECT 
    'public.users' as source,
    id,
    email,
    password_hash IS NOT NULL as has_password,
    true as email_confirmed,
    updated_at as last_sign_in_at
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 5. Check for any potential issues
SELECT '5. Potential issues check:' as info;

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

-- Check if subscription plans exist
SELECT 
    'Subscription plans count' as issue,
    COUNT(*) as count
FROM subscription_plans;

-- 6. Test admin access with current user
SELECT '6. Admin access test:' as info;
-- This simulates what the admin panel would do
SELECT 
    'Current user can access upgrade_requests' as test,
    COUNT(*) as result
FROM upgrade_requests;

SELECT 
    'Current user can access users' as test,
    COUNT(*) as result
FROM users;

SELECT 
    'Current user can access subscription_plans' as test,
    COUNT(*) as result
FROM subscription_plans;

-- 7. Browser debugging instructions
SELECT '7. Browser debugging steps:' as info;
SELECT '1. Open browser developer tools (F12)' as step;
SELECT '2. Go to Console tab' as step;
SELECT '3. Go to /admin/upgrade-requests' as step;
SELECT '4. Try to login' as step;
SELECT '5. Look for any error messages in console' as step;
SELECT '6. Check Network tab for failed requests' as step;
SELECT '7. Look for any CORS or authentication errors' as step;
