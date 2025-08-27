-- EMERGENCY DATA DIAGNOSTIC
-- This script will identify why restaurant data is not appearing after login

-- 1. Check current user authentication state
SELECT '1. AUTHENTICATION DIAGNOSTIC:' as section;
SELECT 
    'Current auth.uid():' as info,
    auth.uid() as current_user_id;

-- 2. Check if the current user exists in public.users
SELECT '2. USER EXISTENCE CHECK:' as section;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.restaurant_id,
    u.is_active,
    u.has_completed_onboarding,
    u.plan_status,
    u.created_at
FROM users u
WHERE u.id = auth.uid();

-- 3. Check restaurant connection
SELECT '3. RESTAURANT CONNECTION CHECK:' as section;
SELECT 
    u.id as user_id,
    u.email,
    u.restaurant_id,
    r.id as restaurant_id_from_restaurants,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    r.is_active as restaurant_active
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
WHERE u.id = auth.uid();

-- 4. Check if restaurant has menu items
SELECT '4. MENU ITEMS CHECK:' as section;
SELECT 
    COUNT(*) as total_menu_items,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_menu_items
FROM menu_items mi
JOIN users u ON mi.restaurant_id = u.restaurant_id
WHERE u.id = auth.uid();

-- 5. Check if restaurant has orders
SELECT '5. ORDERS CHECK:' as section;
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
FROM orders o
JOIN users u ON o.restaurant_id = u.restaurant_id
WHERE u.id = auth.uid();

-- 6. Check RLS policies on users table
SELECT '6. RLS POLICIES CHECK:' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 7. Check RLS policies on restaurants table
SELECT '7. RESTAURANTS RLS CHECK:' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'restaurants' 
AND schemaname = 'public';

-- 8. Check RLS policies on menu_items table
SELECT '8. MENU_ITEMS RLS CHECK:' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'menu_items' 
AND schemaname = 'public';

-- 9. Check RLS policies on orders table
SELECT '9. ORDERS RLS CHECK:' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders' 
AND schemaname = 'public';

-- 10. Test direct queries without RLS
SELECT '10. DIRECT QUERY TEST (WITHOUT RLS):' as section;

-- Temporarily disable RLS for testing
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Test restaurant query
SELECT 'Restaurant data (RLS disabled):' as test_type;
SELECT 
    r.id,
    r.name,
    r.slug,
    r.is_active
FROM restaurants r
JOIN users u ON r.id = u.restaurant_id
WHERE u.id = auth.uid();

-- Test menu items query
SELECT 'Menu items (RLS disabled):' as test_type;
SELECT 
    mi.id,
    mi.name,
    mi.price,
    mi.is_active
FROM menu_items mi
JOIN users u ON mi.restaurant_id = u.restaurant_id
WHERE u.id = auth.uid()
LIMIT 5;

-- Test orders query
SELECT 'Orders (RLS disabled):' as test_type;
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount
FROM orders o
JOIN users u ON o.restaurant_id = u.restaurant_id
WHERE u.id = auth.uid()
LIMIT 5;

-- Re-enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 11. Check if there are any orphaned records
SELECT '11. ORPHANED RECORDS CHECK:' as section;

-- Orphaned menu items
SELECT 
    'Orphaned menu items:' as record_type,
    COUNT(*) as count
FROM menu_items mi
LEFT JOIN restaurants r ON mi.restaurant_id = r.id
WHERE r.id IS NULL;

-- Orphaned orders
SELECT 
    'Orphaned orders:' as record_type,
    COUNT(*) as count
FROM orders o
LEFT JOIN restaurants r ON o.restaurant_id = r.id
WHERE r.id IS NULL;

-- 12. Check all restaurants in the system
SELECT '12. ALL RESTAURANTS IN SYSTEM:' as section;
SELECT 
    r.id,
    r.name,
    r.slug,
    r.is_active,
    COUNT(u.id) as user_count,
    COUNT(mi.id) as menu_items_count,
    COUNT(o.id) as orders_count
FROM restaurants r
LEFT JOIN users u ON r.id = u.restaurant_id
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id
LEFT JOIN orders o ON r.id = o.restaurant_id
GROUP BY r.id, r.name, r.slug, r.is_active
ORDER BY r.created_at DESC;

-- 13. Emergency fix suggestions
SELECT '13. EMERGENCY FIX SUGGESTIONS:' as section;
SELECT 'If data exists but is not accessible, the issue is likely RLS policies' as suggestion;
SELECT 'If no data exists, the user-restaurant connection was lost' as suggestion;
SELECT 'Check the restaurant_id in the users table for the current user' as suggestion;
SELECT 'Verify that the restaurant exists and has the correct data' as suggestion;



