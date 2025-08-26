-- Diagnose User Sync Issue
-- This script helps identify and fix user synchronization issues

-- 1. Check auth.users vs public.users
SELECT '1. AUTH.USERS VS PUBLIC.USERS:' as section;
SELECT 
    'Total auth.users:' as metric,
    COUNT(*) as value
FROM auth.users
UNION ALL
SELECT 
    'Total public.users:' as metric,
    COUNT(*) as value
FROM public.users;

-- 2. Show users in auth.users but not in public.users
SELECT '2. USERS IN AUTH BUT NOT IN PUBLIC:' as section;
SELECT 
    au.id as auth_id,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.email = pu.email
WHERE pu.email IS NULL
ORDER BY au.created_at DESC;

-- 3. Show users with missing plan_id
SELECT '3. USERS WITH MISSING PLAN_ID:' as section;
SELECT 
    pu.email,
    pu.first_name,
    pu.last_name,
    pu.plan_id,
    pu.plan_status
FROM public.users pu
WHERE pu.plan_id IS NULL
ORDER BY pu.created_at DESC;
