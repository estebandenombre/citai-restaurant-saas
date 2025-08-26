-- Admin Authentication Diagnostic
-- This script checks why admin login is not working

-- 1. Check if admin user exists in auth.users
SELECT '1. Checking auth.users table:' as info;
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 2. Check if admin user exists in public.users
SELECT '2. Checking public.users table:' as info;
SELECT 
    id,
    email,
    role,
    plan_status,
    is_active,
    has_completed_onboarding,
    created_at,
    updated_at
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 3. Check if the IDs match between auth.users and public.users
SELECT '3. Checking ID consistency:' as info;
SELECT 
    au.id as auth_id,
    pu.id as public_id,
    au.email as auth_email,
    pu.email as public_email,
    CASE 
        WHEN au.id = pu.id THEN '✅ IDs MATCH'
        ELSE '❌ IDs DO NOT MATCH'
    END as id_status
FROM auth.users au
FULL OUTER JOIN users pu ON au.email = pu.email
WHERE au.email = 'ortizvicenteesteban@gmail.com' OR pu.email = 'ortizvicenteesteban@gmail.com';

-- 4. Check if admin user has confirmed email
SELECT '4. Email confirmation status:' as info;
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMED'
        ELSE '❌ EMAIL NOT CONFIRMED'
    END as confirmation_status
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 5. Check if admin user has password
SELECT '5. Password status:' as info;
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✅ HAS PASSWORD'
        ELSE '❌ NO PASSWORD'
    END as password_status
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 6. Show all users in auth.users for reference
SELECT '6. All users in auth.users:' as info;
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    encrypted_password IS NOT NULL as has_password,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 7. Show all users in public.users for reference
SELECT '7. All users in public.users:' as info;
SELECT 
    id,
    email,
    role,
    plan_status,
    created_at
FROM users 
ORDER BY created_at DESC;
