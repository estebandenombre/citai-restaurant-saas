-- Diagnose Restaurant Not Found Issue
-- This script helps identify why restaurants are not being found in orders and reservations

-- 1. Check all restaurants and their status
SELECT '1. ALL RESTAURANTS:' as section;
SELECT 
    id,
    name,
    slug,
    is_active,
    created_at,
    updated_at
FROM restaurants
ORDER BY created_at DESC;

-- 2. Check restaurants with their users
SELECT '2. RESTAURANTS WITH USERS:' as section;
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    r.is_active as restaurant_active,
    u.id as user_id,
    u.email as user_email,
    u.first_name,
    u.last_name,
    u.plan_status
FROM restaurants r
LEFT JOIN users u ON r.id = u.restaurant_id
ORDER BY r.created_at DESC;

-- 3. Check for orphaned restaurants (no users)
SELECT '3. ORPHANED RESTAURANTS (NO USERS):' as section;
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    r.is_active as restaurant_active,
    r.created_at
FROM restaurants r
LEFT JOIN users u ON r.id = u.restaurant_id
WHERE u.id IS NULL
ORDER BY r.created_at DESC;

-- 4. Check for users without restaurants
SELECT '4. USERS WITHOUT RESTAURANTS:' as section;
SELECT 
    u.id as user_id,
    u.email as user_email,
    u.first_name,
    u.last_name,
    u.restaurant_id,
    u.plan_status
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
WHERE r.id IS NULL
ORDER BY u.created_at DESC;

-- 5. Check recent orders and their restaurants
SELECT '5. RECENT ORDERS AND RESTAURANTS:' as section;
SELECT 
    o.id as order_id,
    o.order_number,
    o.restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    r.is_active as restaurant_active,
    o.status as order_status,
    o.created_at
FROM orders o
LEFT JOIN restaurants r ON o.restaurant_id = r.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 6. Check recent reservations and their restaurants
SELECT '6. RECENT RESERVATIONS AND RESTAURANTS:' as section;
SELECT 
    res.id as reservation_id,
    res.restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    r.is_active as restaurant_active,
    res.customer_name,
    res.status as reservation_status,
    res.created_at
FROM reservations res
LEFT JOIN restaurants r ON res.restaurant_id = r.id
ORDER BY res.created_at DESC
LIMIT 10;

-- 7. Check for orders with invalid restaurant_id
SELECT '7. ORDERS WITH INVALID RESTAURANT_ID:' as section;
SELECT 
    o.id as order_id,
    o.order_number,
    o.restaurant_id,
    o.status as order_status,
    o.created_at,
    CASE 
        WHEN r.id IS NULL THEN '❌ RESTAURANT NOT FOUND'
        ELSE '✅ RESTAURANT FOUND'
    END as restaurant_status
FROM orders o
LEFT JOIN restaurants r ON o.restaurant_id = r.id
WHERE r.id IS NULL
ORDER BY o.created_at DESC;

-- 8. Check for reservations with invalid restaurant_id
SELECT '8. RESERVATIONS WITH INVALID RESTAURANT_ID:' as section;
SELECT 
    res.id as reservation_id,
    res.restaurant_id,
    res.customer_name,
    res.status as reservation_status,
    res.created_at,
    CASE 
        WHEN r.id IS NULL THEN '❌ RESTAURANT NOT FOUND'
        ELSE '✅ RESTAURANT FOUND'
    END as restaurant_status
FROM reservations res
LEFT JOIN restaurants r ON res.restaurant_id = r.id
WHERE r.id IS NULL
ORDER BY res.created_at DESC;

-- 9. Summary
SELECT '9. SUMMARY:' as section;
SELECT 
    'Total restaurants:' as metric,
    COUNT(*) as value
FROM restaurants
UNION ALL
SELECT 
    'Active restaurants:' as metric,
    COUNT(*) as value
FROM restaurants WHERE is_active = true
UNION ALL
SELECT 
    'Restaurants with users:' as metric,
    COUNT(DISTINCT r.id) as value
FROM restaurants r
JOIN users u ON r.id = u.restaurant_id
UNION ALL
SELECT 
    'Total orders:' as metric,
    COUNT(*) as value
FROM orders
UNION ALL
SELECT 
    'Orders with valid restaurants:' as metric,
    COUNT(*) as value
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
UNION ALL
SELECT 
    'Total reservations:' as metric,
    COUNT(*) as value
FROM reservations
UNION ALL
SELECT 
    'Reservations with valid restaurants:' as metric,
    COUNT(*) as value
FROM reservations res
JOIN restaurants r ON res.restaurant_id = r.id;


