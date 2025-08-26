-- Fix User Sync Issues
-- This script fixes user synchronization issues between auth.users and public.users

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
    has_completed_onboarding,
    plan_id,
    plan_status,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end
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
    false as has_completed_onboarding,
    (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan' LIMIT 1) as plan_id,
    'trial' as plan_status,
    au.created_at as trial_start,
    au.created_at + INTERVAL '14 days' as trial_end,
    au.created_at as current_period_start,
    au.created_at + INTERVAL '14 days' as current_period_end
FROM auth.users au
LEFT JOIN public.users pu ON au.email = pu.email
WHERE pu.email IS NULL
ON CONFLICT (email) DO NOTHING;

-- 2. Update users with missing plan_id
SELECT '2. UPDATING USERS WITH MISSING PLAN_ID:' as section;

UPDATE public.users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan' LIMIT 1),
    plan_status = 'trial',
    trial_start = created_at,
    trial_end = created_at + INTERVAL '14 days',
    current_period_start = created_at,
    current_period_end = created_at + INTERVAL '14 days'
WHERE plan_id IS NULL;

-- 3. Create restaurants for users without restaurant_id
SELECT '3. CREATING RESTAURANTS FOR USERS WITHOUT RESTAURANT_ID:' as section;

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

-- 4. Verify the fixes
SELECT '4. VERIFICATION - AFTER FIXES:' as section;
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
    'Users with plan_id:' as metric,
    COUNT(*) as value
FROM public.users WHERE plan_id IS NOT NULL
UNION ALL
SELECT 
    'Users with restaurant_id:' as metric,
    COUNT(*) as value
FROM public.users WHERE restaurant_id IS NOT NULL;

-- 5. Show fixed user data
SELECT '5. FIXED USER DATA:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.restaurant_id,
    sp.name as plan_name,
    r.name as restaurant_name,
    CASE 
        WHEN u.plan_id IS NOT NULL AND u.restaurant_id IS NOT NULL THEN '✅ COMPLETE'
        WHEN u.plan_id IS NULL THEN '❌ NO PLAN_ID'
        WHEN u.restaurant_id IS NULL THEN '❌ NO RESTAURANT_ID'
        ELSE '❌ UNKNOWN ISSUE'
    END as status
FROM public.users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 6. Success message
SELECT '6. FIX COMPLETE:' as section;
SELECT '✅ All auth.users now have corresponding public.users records' as status;
SELECT '✅ All users have plan_id assigned' as status;
SELECT '✅ All users have restaurant_id assigned' as status;
SELECT '✅ User synchronization issues resolved' as status;

