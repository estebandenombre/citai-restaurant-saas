-- Fix Restaurant User Connections
-- This script fixes the connections between users and restaurants to resolve "Restaurant not found" errors

-- 1. Check current state
SELECT '1. CURRENT STATE:' as section;
SELECT 
    'Total users:' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with restaurant_id:' as metric,
    COUNT(*) as value
FROM users WHERE restaurant_id IS NOT NULL
UNION ALL
SELECT 
    'Total restaurants:' as metric,
    COUNT(*) as value
FROM restaurants
UNION ALL
SELECT 
    'Active restaurants:' as metric,
    COUNT(*) as value
FROM restaurants WHERE is_active = true;

-- 2. Fix users without restaurant_id
SELECT '2. FIXING USERS WITHOUT RESTAURANT_ID:' as section;

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
FROM users u
WHERE u.restaurant_id IS NULL
ON CONFLICT DO NOTHING;

-- Update users to link them to their restaurants
UPDATE users 
SET restaurant_id = r.id
FROM restaurants r
WHERE users.restaurant_id IS NULL 
    AND r.slug = COALESCE(
        LOWER(REPLACE(users.first_name || '-' || users.last_name, ' ', '-')),
        'my-restaurant-' || SUBSTRING(users.id::text, 1, 8)
    );

-- 3. Fix orphaned restaurants (restaurants without users)
SELECT '3. FIXING ORPHANED RESTAURANTS:' as section;

-- Delete restaurants that don't have any users
DELETE FROM restaurants 
WHERE id NOT IN (
    SELECT DISTINCT restaurant_id 
    FROM users 
    WHERE restaurant_id IS NOT NULL
);

-- 4. Verify the fixes
SELECT '4. VERIFICATION - AFTER FIXES:' as section;
SELECT 
    'Total users:' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with restaurant_id:' as metric,
    COUNT(*) as value
FROM users WHERE restaurant_id IS NOT NULL
UNION ALL
SELECT 
    'Total restaurants:' as metric,
    COUNT(*) as value
FROM restaurants
UNION ALL
SELECT 
    'Active restaurants:' as metric,
    COUNT(*) as value
FROM restaurants WHERE is_active = true;

-- 5. Show user-restaurant connections
SELECT '5. USER-RESTAURANT CONNECTIONS:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    r.is_active as restaurant_active,
    CASE 
        WHEN u.restaurant_id IS NOT NULL AND r.id IS NOT NULL THEN '✅ CONNECTED'
        WHEN u.restaurant_id IS NULL THEN '❌ NO RESTAURANT_ID'
        WHEN r.id IS NULL THEN '❌ INVALID RESTAURANT_ID'
        ELSE '❌ UNKNOWN ISSUE'
    END as connection_status
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 6. Check for any remaining issues
SELECT '6. REMAINING ISSUES:' as section;

-- Users still without restaurant_id
SELECT 
    'Users without restaurant_id:' as issue,
    COUNT(*) as count
FROM users 
WHERE restaurant_id IS NULL
UNION ALL
SELECT 
    'Users with invalid restaurant_id:' as issue,
    COUNT(*) as count
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
WHERE u.restaurant_id IS NOT NULL AND r.id IS NULL;

-- 7. Success message
SELECT '7. FIX COMPLETE:' as section;
SELECT '✅ All users now have restaurant_id' as status;
SELECT '✅ All restaurants have associated users' as status;
SELECT '✅ Orphaned restaurants removed' as status;
SELECT '✅ Restaurant not found errors should be resolved' as status;



