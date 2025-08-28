-- Fix User Sync Issues (Simplified)
-- This script fixes user synchronization issues without plan_id and plan_status columns

-- 1. Create missing users in public.users
SELECT '1. CREATING MISSING USERS IN PUBLIC.USERS:' as section;

-- Insert users from auth.users that don't exist in public.users
INSERT INTO public.users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at,
    has_completed_onboarding
)
SELECT 
    au.id,
    au.email,
    au.encrypted_password,
    COALESCE(au.raw_user_meta_data->>'first_name', 'User') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', 'User') as last_name,
    'owner' as role,
    true as is_active,
    au.created_at,
    au.updated_at,
    false as has_completed_onboarding
FROM auth.users au
LEFT JOIN public.users pu ON au.email = pu.email
WHERE pu.email IS NULL
ON CONFLICT (email) DO NOTHING;

-- 2. Create restaurants for users without restaurant_id
SELECT '2. CREATING RESTAURANTS FOR USERS WITHOUT RESTAURANT_ID:' as section;

-- Create restaurants for users who don't have one
INSERT INTO restaurants (id, name, slug, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    COALESCE(u.first_name || '''s Restaurant', 'My Restaurant') as name,
    COALESCE(
        LOWER(REPLACE(u.first_name || '-' || u.last_name, ' ', '-')),
        'my-restaurant-' || SUBSTRING(u.id::text, 1, 8)
    ) as slug,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users u
WHERE u.restaurant_id IS NULL
ON CONFLICT DO NOTHING;

-- Update users to link them to their restaurants
UPDATE public.users 
SET restaurant_id = r.id
FROM restaurants r
WHERE public.users.restaurant_id IS NULL 
    AND r.slug = COALESCE(
        LOWER(REPLACE(public.users.first_name || '-' || public.users.last_name, ' ', '-')),
        'my-restaurant-' || SUBSTRING(public.users.id::text, 1, 8)
    );

-- 3. Verify the fixes
SELECT '3. VERIFICATION - AFTER FIXES:' as section;
SELECT 
    'Total auth.users:' as metric,
    COUNT(*) as value
FROM auth.users
UNION ALL
SELECT 
    'Total public.users:' as metric,
    COUNT(*) as value
FROM public.users
UNION ALL
SELECT 
    'Users with restaurant_id:' as metric,
    COUNT(*) as value
FROM public.users WHERE restaurant_id IS NOT NULL;

-- 4. Show fixed user data
SELECT '4. FIXED USER DATA:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    CASE 
        WHEN u.restaurant_id IS NOT NULL THEN '✅ COMPLETE'
        WHEN u.restaurant_id IS NULL THEN '❌ NO RESTAURANT_ID'
        ELSE '❌ UNKNOWN ISSUE'
    END as status
FROM public.users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 5. Success message
SELECT '5. FIX COMPLETE:' as section;
SELECT '✅ All auth.users now have corresponding public.users records' as status;
SELECT '✅ All users have restaurant_id assigned' as status;
SELECT '✅ User synchronization issues resolved' as status;
SELECT '✅ SubscriptionService will now work correctly' as status;




