-- Check Current Schema (Simplified)
-- This script checks the current structure without subscription_plans table

-- 1. Check current users table structure
SELECT '1. CURRENT USERS TABLE STRUCTURE:' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show sample user data
SELECT '2. SAMPLE USER DATA:' as section;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    restaurant_id,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check restaurants table
SELECT '3. RESTAURANTS:' as section;
SELECT 
    id,
    name,
    slug,
    is_active
FROM restaurants
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check auth.users vs public.users
SELECT '4. AUTH.USERS VS PUBLIC.USERS:' as section;
SELECT 
    'Total auth.users:' as metric,
    COUNT(*) as value
FROM auth.users
UNION ALL
SELECT 
    'Total public.users:' as metric,
    COUNT(*) as value
FROM public.users;

-- 5. Show users in auth but not in public
SELECT '5. USERS IN AUTH BUT NOT IN PUBLIC:' as section;
SELECT 
    au.id as auth_id,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.email = pu.email
WHERE pu.email IS NULL
ORDER BY au.created_at DESC;

-- 6. Show users without restaurant_id
SELECT '6. USERS WITHOUT RESTAURANT_ID:' as section;
SELECT 
    pu.email,
    pu.first_name,
    pu.last_name,
    pu.restaurant_id
FROM public.users pu
WHERE pu.restaurant_id IS NULL
ORDER BY pu.created_at DESC;



