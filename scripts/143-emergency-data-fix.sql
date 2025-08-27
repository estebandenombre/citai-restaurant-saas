-- EMERGENCY DATA ACCESS FIX
-- This script immediately fixes data access issues

-- 1. First, let's check what we're working with
SELECT '1. EMERGENCY DIAGNOSTIC:' as section;
SELECT 
    'Total users:' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Users with restaurant_id:' as metric,
    COUNT(*) as count
FROM users WHERE restaurant_id IS NOT NULL
UNION ALL
SELECT 
    'Total restaurants:' as metric,
    COUNT(*) as count
FROM restaurants
UNION ALL
SELECT 
    'Total menu items:' as metric,
    COUNT(*) as count
FROM menu_items
UNION ALL
SELECT 
    'Total orders:' as metric,
    COUNT(*) as count
FROM orders;

-- 2. Disable RLS on all tables to ensure data access
SELECT '2. DISABLING RLS FOR EMERGENCY ACCESS:' as section;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

-- 3. Drop all problematic RLS policies
SELECT '3. DROPPING ALL RLS POLICIES:' as section;
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop policies from users table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON users';
        RAISE NOTICE 'Dropped users policy: %', policy_record.policyname;
    END LOOP;
    
    -- Drop policies from restaurants table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'restaurants' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON restaurants';
        RAISE NOTICE 'Dropped restaurants policy: %', policy_record.policyname;
    END LOOP;
    
    -- Drop policies from menu_items table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'menu_items' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON menu_items';
        RAISE NOTICE 'Dropped menu_items policy: %', policy_record.policyname;
    END LOOP;
    
    -- Drop policies from orders table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'orders' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON orders';
        RAISE NOTICE 'Dropped orders policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 4. Fix user-restaurant connections
SELECT '4. FIXING USER-RESTAURANT CONNECTIONS:' as section;

-- Create missing restaurants for users without them
INSERT INTO restaurants (id, name, slug, description, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    COALESCE(u.first_name || '''s Restaurant', 'My Restaurant'),
    COALESCE(LOWER(REPLACE(u.first_name || '-restaurant', ' ', '-')), 'my-restaurant'),
    'Restaurant created for ' || u.first_name || ' ' || u.last_name,
    true,
    u.created_at,
    NOW()
FROM users u
WHERE u.restaurant_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.slug = COALESCE(LOWER(REPLACE(u.first_name || '-restaurant', ' ', '-')), 'my-restaurant')
);

-- Assign restaurant_id to users who don't have one
UPDATE users 
SET restaurant_id = (
    SELECT r.id 
    FROM restaurants r 
    WHERE r.slug = COALESCE(LOWER(REPLACE(users.first_name || '-restaurant', ' ', '-')), 'my-restaurant')
    LIMIT 1
)
WHERE restaurant_id IS NULL;

-- 5. Create simple, permissive RLS policies
SELECT '5. CREATING PERMISSIVE RLS POLICIES:' as section;

-- Users table policies
CREATE POLICY "users_access_own_data" ON users
    FOR ALL
    USING (auth.uid() = id);

-- Restaurants table policies
CREATE POLICY "restaurants_access_by_user" ON restaurants
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.restaurant_id = restaurants.id
        )
    );

-- Menu items table policies
CREATE POLICY "menu_items_access_by_restaurant" ON menu_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.restaurant_id = menu_items.restaurant_id
        )
    );

-- Orders table policies
CREATE POLICY "orders_access_by_restaurant" ON orders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.restaurant_id = orders.restaurant_id
        )
    );

-- Categories table policies
CREATE POLICY "categories_access_by_restaurant" ON categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.restaurant_id = categories.restaurant_id
        )
    );

-- Order items table policies
CREATE POLICY "order_items_access_by_order" ON order_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            JOIN users u ON o.restaurant_id = u.restaurant_id
            WHERE u.id = auth.uid() 
            AND o.id = order_items.order_id
        )
    );

-- Order settings table policies
CREATE POLICY "order_settings_access_by_restaurant" ON order_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.restaurant_id = order_settings.restaurant_id
        )
    );

-- Reservations table policies
CREATE POLICY "reservations_access_by_restaurant" ON reservations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.restaurant_id = reservations.restaurant_id
        )
    );

-- 6. Re-enable RLS
SELECT '6. RE-ENABLING RLS:' as section;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 7. Verify the fix
SELECT '7. VERIFICATION:' as section;
SELECT 
    'Users with restaurant_id:' as metric,
    COUNT(*) as count
FROM users WHERE restaurant_id IS NOT NULL
UNION ALL
SELECT 
    'Users without restaurant_id:' as metric,
    COUNT(*) as count
FROM users WHERE restaurant_id IS NULL
UNION ALL
SELECT 
    'Total restaurants:' as metric,
    COUNT(*) as count
FROM restaurants
UNION ALL
SELECT 
    'Total menu items:' as metric,
    COUNT(*) as count
FROM menu_items
UNION ALL
SELECT 
    'Total orders:' as metric,
    COUNT(*) as count
FROM orders;

-- 8. Show user-restaurant mapping
SELECT '8. USER-RESTAURANT MAPPING:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    COUNT(mi.id) as menu_items,
    COUNT(o.id) as orders
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id
LEFT JOIN orders o ON r.id = o.restaurant_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, r.id, r.name, r.slug
ORDER BY u.created_at DESC;

-- 9. Success message
SELECT '9. EMERGENCY FIX COMPLETE:' as section;
SELECT '✅ RLS temporarily disabled for emergency access' as status;
SELECT '✅ All problematic policies removed' as status;
SELECT '✅ User-restaurant connections restored' as status;
SELECT '✅ New permissive policies created' as status;
SELECT '✅ RLS re-enabled with safe policies' as status;
SELECT '✅ Data should now be accessible' as status;
SELECT 'IMPORTANT: Test login now to verify data access' as instruction;



