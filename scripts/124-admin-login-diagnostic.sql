-- Admin Login Diagnostic
-- This script checks the admin login process step by step

-- 1. Verify admin user exists in both tables
SELECT '1. Admin user verification:' as info;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    last_sign_in_at
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

SELECT 
    'public.users' as table_name,
    id,
    email,
    role,
    plan_status,
    created_at
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 2. Check if IDs match between tables
SELECT '2. ID consistency check:' as info;
SELECT 
    au.id as auth_id,
    pu.id as public_id,
    CASE 
        WHEN au.id = pu.id THEN '✅ IDs MATCH'
        ELSE '❌ IDs DO NOT MATCH'
    END as id_status
FROM auth.users au
LEFT JOIN users pu ON au.email = pu.email
WHERE au.email = 'ortizvicenteesteban@gmail.com';

-- 3. Test password hash
SELECT '3. Password hash test:' as info;
SELECT 
    email,
    encrypted_password,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✅ HAS PASSWORD HASH'
        ELSE '❌ NO PASSWORD HASH'
    END as password_status
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 4. Check if admin role is properly set
SELECT '4. Admin role check:' as info;
SELECT 
    email,
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN ROLE'
        ELSE '❌ NOT ADMIN ROLE'
    END as role_status
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 5. Check subscription plans (needed for admin panel)
SELECT '5. Subscription plans check:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    is_active
FROM subscription_plans
ORDER BY price;

-- 6. Check upgrade_requests table
SELECT '6. Upgrade requests table check:' as info;
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests
FROM upgrade_requests;

-- 7. Test admin access simulation
SELECT '7. Admin access simulation:' as info;
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

-- 8. Browser testing instructions
SELECT '8. Browser testing instructions:' as info;
SELECT '1. Open browser developer tools (F12)' as instruction;
SELECT '2. Go to Network tab' as instruction;
SELECT '3. Go to /admin/upgrade-requests' as instruction;
SELECT '4. Try to login with ortizvicenteesteban@gmail.com / Admin123!' as instruction;
SELECT '5. Check for any failed requests in Network tab' as instruction;
SELECT '6. Check Console tab for any JavaScript errors' as instruction;
