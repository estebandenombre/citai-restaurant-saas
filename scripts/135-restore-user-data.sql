-- Restore User Data Connection
-- This script restores the connection between users and their existing data

-- 1. First, let's see what we have
SELECT '1. Current state analysis:' as info;
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

-- 2. Check if there are users without restaurant_id but with data
SELECT '2. Users without restaurant_id but with data:' as info;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(mi.id) as menu_items,
    COUNT(o.id) as orders
FROM users u
LEFT JOIN menu_items mi ON mi.restaurant_id IN (
    SELECT r.id FROM restaurants r WHERE r.id IN (
        SELECT DISTINCT restaurant_id FROM menu_items WHERE restaurant_id IS NOT NULL
    )
)
LEFT JOIN orders o ON o.restaurant_id IN (
    SELECT r.id FROM restaurants r WHERE r.id IN (
        SELECT DISTINCT restaurant_id FROM orders WHERE restaurant_id IS NOT NULL
    )
)
WHERE u.restaurant_id IS NULL
GROUP BY u.id, u.email, u.first_name, u.last_name
HAVING COUNT(mi.id) > 0 OR COUNT(o.id) > 0;

-- 3. Find restaurants that might belong to users
SELECT '3. Restaurants without clear owner:' as info;
SELECT 
    r.id,
    r.name,
    r.slug,
    COUNT(mi.id) as menu_items,
    COUNT(o.id) as orders,
    r.created_at
FROM restaurants r
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id
LEFT JOIN orders o ON r.id = o.restaurant_id
LEFT JOIN users u ON r.id = u.restaurant_id
WHERE u.id IS NULL
GROUP BY r.id, r.name, r.slug, r.created_at
ORDER BY r.created_at;

-- 4. Restore user-restaurant connections
SELECT '4. Restoring user-restaurant connections:' as info;

-- Find the oldest user without restaurant_id and assign them to the oldest restaurant
UPDATE users 
SET restaurant_id = (
    SELECT r.id 
    FROM restaurants r 
    LEFT JOIN users u2 ON r.id = u2.restaurant_id 
    WHERE u2.id IS NULL 
    ORDER BY r.created_at 
    LIMIT 1
)
WHERE restaurant_id IS NULL 
AND id = (
    SELECT u3.id 
    FROM users u3 
    WHERE u3.restaurant_id IS NULL 
    ORDER BY u3.created_at 
    LIMIT 1
);

-- 5. Create missing restaurants for users without them
SELECT '5. Creating missing restaurants:' as info;
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

-- 6. Assign restaurant_id to users who still don't have one
SELECT '6. Assigning restaurant_id to remaining users:' as info;
UPDATE users 
SET restaurant_id = (
    SELECT r.id 
    FROM restaurants r 
    WHERE r.slug = COALESCE(LOWER(REPLACE(users.first_name || '-restaurant', ' ', '-')), 'my-restaurant')
    LIMIT 1
)
WHERE restaurant_id IS NULL;

-- 7. Verify the restoration
SELECT '7. Verification after restoration:' as info;
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
    'Restaurants with owners:' as metric,
    COUNT(DISTINCT r.id) as count
FROM restaurants r
JOIN users u ON r.id = u.restaurant_id
UNION ALL
SELECT 
    'Restaurants without owners:' as metric,
    COUNT(DISTINCT r.id) as count
FROM restaurants r
LEFT JOIN users u ON r.id = u.restaurant_id
WHERE u.id IS NULL;

-- 8. Show final user-restaurant mapping
SELECT '8. Final user-restaurant mapping:' as info;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    COUNT(mi.id) as menu_items,
    COUNT(o.id) as orders
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id
LEFT JOIN orders o ON r.id = o.restaurant_id
GROUP BY u.id, u.email, u.first_name, u.last_name, r.id, r.name, r.slug
ORDER BY u.created_at DESC;

-- 9. Success message
SELECT '9. Restoration complete:' as info;
SELECT 'User data connections have been restored' as status;
SELECT 'Users should now be able to access their data' as note;




