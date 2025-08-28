-- Diagnose Data Loss Issue
-- This script checks what happened to existing user data after RLS fixes

-- 1. Check current users in the system
SELECT '1. Current users in system:' as info;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    restaurant_id,
    is_active,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Check restaurants
SELECT '2. Current restaurants:' as info;
SELECT 
    id,
    name,
    slug,
    is_active,
    created_at
FROM restaurants
ORDER BY created_at;

-- 3. Check if users have restaurant_id assigned
SELECT '3. Users with restaurant_id:' as info;
SELECT 
    u.id,
    u.email,
    u.restaurant_id,
    r.name as restaurant_name,
    CASE 
        WHEN u.restaurant_id IS NULL THEN '❌ NO RESTAURANT'
        WHEN r.id IS NULL THEN '❌ INVALID RESTAURANT'
        ELSE '✅ VALID RESTAURANT'
    END as status
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 4. Check menu items
SELECT '4. Menu items by restaurant:' as info;
SELECT 
    r.name as restaurant_name,
    COUNT(mi.id) as menu_items_count
FROM restaurants r
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id
GROUP BY r.id, r.name
ORDER BY r.created_at;

-- 5. Check orders
SELECT '5. Orders by restaurant:' as info;
SELECT 
    r.name as restaurant_name,
    COUNT(o.id) as orders_count
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
GROUP BY r.id, r.name
ORDER BY r.created_at;

-- 6. Check auth.users vs public.users
SELECT '6. Auth vs Public users comparison:' as info;
SELECT 
    'auth.users count:' as check_type,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'public.users count:' as check_type,
    COUNT(*) as count
FROM users;

-- 7. Check for orphaned data
SELECT '7. Orphaned data check:' as info;
SELECT 
    'Menu items without valid restaurant:' as check_type,
    COUNT(*) as count
FROM menu_items mi
LEFT JOIN restaurants r ON mi.restaurant_id = r.id
WHERE r.id IS NULL
UNION ALL
SELECT 
    'Orders without valid restaurant:' as check_type,
    COUNT(*) as count
FROM orders o
LEFT JOIN restaurants r ON o.restaurant_id = r.id
WHERE r.id IS NULL
UNION ALL
SELECT 
    'Users without valid restaurant:' as check_type,
    COUNT(*) as count
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
WHERE u.restaurant_id IS NOT NULL AND r.id IS NULL;

-- 8. Check RLS status
SELECT '8. RLS status:' as info;
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'restaurants', 'menu_items', 'orders')
ORDER BY tablename;

-- 9. Check recent activity
SELECT '9. Recent activity:' as info;
SELECT 
    'Recent users:' as check_type,
    COUNT(*) as count
FROM users 
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Recent orders:' as check_type,
    COUNT(*) as count
FROM orders 
WHERE created_at > NOW() - INTERVAL '24 hours';




