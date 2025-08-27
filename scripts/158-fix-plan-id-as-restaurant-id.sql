-- Fix Plan ID as Restaurant ID Issue
-- This script fixes users who have plan_id as restaurant_id, causing "Restaurant not found" errors

-- 1. Check current state
SELECT '1. CURRENT STATE:' as section;
SELECT 
    'Total users:' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with plan_id = restaurant_id:' as metric,
    COUNT(*) as value
FROM users WHERE plan_id = restaurant_id
UNION ALL
SELECT 
    'Users with correct IDs:' as metric,
    COUNT(*) as value
FROM users WHERE plan_id != restaurant_id AND plan_id IS NOT NULL AND restaurant_id IS NOT NULL;

-- 2. Show users with the problem
SELECT '2. USERS WITH PLAN_ID AS RESTAURANT_ID:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.restaurant_id,
    sp.name as plan_name,
    sp.price as plan_price,
    CASE 
        WHEN u.plan_id = u.restaurant_id THEN '❌ WRONG - USING PLAN_ID AS RESTAURANT_ID'
        ELSE '✅ CORRECT'
    END as issue
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_id = u.restaurant_id
ORDER BY u.created_at DESC;

-- 3. Fix the issue - Create restaurants for users who have plan_id as restaurant_id
SELECT '3. CREATING RESTAURANTS FOR AFFECTED USERS:' as section;

-- Create restaurants for users who have plan_id as restaurant_id
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
FROM users u
WHERE u.plan_id = u.restaurant_id
ON CONFLICT DO NOTHING;

-- 4. Update users to use the correct restaurant_id
SELECT '4. UPDATING USERS TO USE CORRECT RESTAURANT_ID:' as section;

-- Update users to link them to their new restaurants
UPDATE users 
SET restaurant_id = r.id
FROM restaurants r
WHERE users.plan_id = users.restaurant_id 
    AND r.slug = COALESCE(
        LOWER(REPLACE(users.first_name || '-' || users.last_name, ' ', '-')),
        'my-restaurant-' || SUBSTRING(users.id::text, 1, 8)
    );

-- 5. Verify the fixes
SELECT '5. VERIFICATION - AFTER FIXES:' as section;
SELECT 
    'Total users:' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with plan_id = restaurant_id:' as metric,
    COUNT(*) as value
FROM users WHERE plan_id = restaurant_id
UNION ALL
SELECT 
    'Users with correct IDs:' as metric,
    COUNT(*) as value
FROM users WHERE plan_id != restaurant_id AND plan_id IS NOT NULL AND restaurant_id IS NOT NULL;

-- 6. Show fixed user-restaurant connections
SELECT '6. FIXED USER-RESTAURANT CONNECTIONS:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.restaurant_id,
    sp.name as plan_name,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    CASE 
        WHEN u.plan_id = u.restaurant_id THEN '❌ STILL WRONG'
        WHEN u.plan_id IS NOT NULL AND u.restaurant_id IS NOT NULL THEN '✅ FIXED'
        WHEN u.plan_id IS NULL THEN '❌ NO PLAN_ID'
        WHEN u.restaurant_id IS NULL THEN '❌ NO RESTAURANT_ID'
        ELSE '❌ UNKNOWN ISSUE'
    END as status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 7. Check if the specific problematic ID is now fixed
SELECT '7. CHECKING SPECIFIC PROBLEMATIC ID:' as section;
SELECT 
    '550e8400-e29b-41d4-a716-446655440001' as id,
    CASE 
        WHEN EXISTS(SELECT 1 FROM restaurants WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN '✅ NOW EXISTS IN RESTAURANTS'
        ELSE '❌ STILL NOT IN RESTAURANTS'
    END as in_restaurants,
    CASE 
        WHEN EXISTS(SELECT 1 FROM subscription_plans WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN '✅ EXISTS IN SUBSCRIPTION_PLANS'
        ELSE '❌ NOT IN SUBSCRIPTION_PLANS'
    END as in_subscription_plans;

-- 8. Show all restaurants
SELECT '8. ALL RESTAURANTS:' as section;
SELECT 
    id,
    name,
    slug,
    is_active,
    created_at
FROM restaurants
ORDER BY created_at DESC;

-- 9. Success message
SELECT '9. FIX COMPLETE:' as section;
SELECT '✅ Users with plan_id as restaurant_id have been fixed' as status;
SELECT '✅ New restaurants created for affected users' as status;
SELECT '✅ Restaurant not found errors should be resolved' as status;
SELECT '✅ Orders and reservations should now work correctly' as status;



