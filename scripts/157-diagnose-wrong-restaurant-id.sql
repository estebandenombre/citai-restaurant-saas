-- Diagnose Wrong Restaurant ID Issue
-- This script helps identify why restaurantId is actually a subscription plan ID

-- 1. Check the specific ID that's being sent
SELECT '1. CHECKING THE SENT RESTAURANT_ID:' as section;
SELECT 
    '550e8400-e29b-41d4-a716-446655440001' as sent_id,
    CASE 
        WHEN EXISTS(SELECT 1 FROM restaurants WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN '✅ EXISTS IN RESTAURANTS'
        ELSE '❌ NOT FOUND IN RESTAURANTS'
    END as in_restaurants,
    CASE 
        WHEN EXISTS(SELECT 1 FROM subscription_plans WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN '✅ EXISTS IN SUBSCRIPTION_PLANS'
        ELSE '❌ NOT FOUND IN SUBSCRIPTION_PLANS'
    END as in_subscription_plans,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN '✅ EXISTS IN USERS'
        ELSE '❌ NOT FOUND IN USERS'
    END as in_users;

-- 2. Check what this ID actually is
SELECT '2. WHAT IS THIS ID?' as section;

-- Check subscription plans
SELECT 
    'subscription_plans' as table_name,
    id,
    name,
    price,
    is_active
FROM subscription_plans 
WHERE id = '550e8400-e29b-41d4-a716-446655440001'

UNION ALL

-- Check restaurants
SELECT 
    'restaurants' as table_name,
    id,
    name,
    price::text,
    is_active::text
FROM restaurants 
WHERE id = '550e8400-e29b-41d4-a716-446655440001'

UNION ALL

-- Check users
SELECT 
    'users' as table_name,
    id,
    first_name || ' ' || last_name as name,
    plan_status as price,
    is_active::text
FROM users 
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- 3. Check all subscription plan IDs to see the pattern
SELECT '3. SUBSCRIPTION PLAN IDS:' as section;
SELECT 
    id,
    name,
    price,
    is_active
FROM subscription_plans
ORDER BY price;

-- 4. Check all restaurant IDs to see the pattern
SELECT '4. RESTAURANT IDS:' as section;
SELECT 
    id,
    name,
    slug,
    is_active
FROM restaurants
ORDER BY created_at DESC;

-- 5. Check users and their plan_id vs restaurant_id
SELECT '5. USERS PLAN_ID VS RESTAURANT_ID:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.restaurant_id,
    sp.name as plan_name,
    r.name as restaurant_name,
    CASE 
        WHEN u.plan_id = u.restaurant_id THEN '❌ SAME ID (WRONG!)'
        WHEN u.plan_id IS NULL THEN '❌ NO PLAN_ID'
        WHEN u.restaurant_id IS NULL THEN '❌ NO RESTAURANT_ID'
        ELSE '✅ DIFFERENT IDS (CORRECT)'
    END as id_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 6. Check if any users have plan_id as restaurant_id
SELECT '6. USERS WITH PLAN_ID AS RESTAURANT_ID:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.restaurant_id,
    sp.name as plan_name,
    CASE 
        WHEN u.plan_id = u.restaurant_id THEN '❌ WRONG - USING PLAN_ID AS RESTAURANT_ID'
        ELSE '✅ CORRECT'
    END as issue
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_id = u.restaurant_id
ORDER BY u.created_at DESC;

-- 7. Summary
SELECT '7. SUMMARY:' as section;
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


