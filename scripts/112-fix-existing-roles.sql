-- Fix Existing Roles Before Applying Constraint
-- This script checks and fixes existing role values before applying the new constraint

-- 1. Check what role values currently exist
SELECT '1. Current role values in users table:' as info;
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role 
ORDER BY role;

-- 2. Show all users with their current roles
SELECT '2. All users with their roles:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 3. Check for problematic role values
SELECT '3. Checking for problematic role values:' as info;
SELECT 
    email,
    role,
    CASE 
        WHEN role IS NULL THEN 'NULL - needs fixing'
        WHEN role = '' THEN 'Empty - needs fixing'
        WHEN role NOT IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi') THEN 'Invalid value - needs fixing'
        ELSE 'Valid'
    END as status
FROM users 
WHERE role IS NULL 
   OR role = '' 
   OR role NOT IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi');

-- 4. Fix problematic role values
SELECT '4. Fixing problematic role values:' as info;
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Fix NULL roles
    UPDATE users 
    SET role = 'user'
    WHERE role IS NULL;
    
    -- Fix empty roles
    UPDATE users 
    SET role = 'user'
    WHERE role = '';
    
    -- Fix invalid roles (map them to valid ones)
    UPDATE users 
    SET role = 'user'
    WHERE role NOT IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi');
    
    RAISE NOTICE 'Fixed problematic role values';
END $$;

-- 5. Verify all roles are now valid
SELECT '5. Verifying all roles are now valid:' as info;
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role 
ORDER BY role;

-- 6. Now drop the old constraint and create the new one
SELECT '6. Applying new role constraint:' as info;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi'));

-- 7. Update your user to admin role
SELECT '7. Updating user to admin role:' as info;
UPDATE users 
SET role = 'admin',
    plan_status = 'active',
    updated_at = NOW()
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 8. Verify the admin user
SELECT '8. Verifying admin user:' as info;
SELECT 
    email,
    role,
    plan_status,
    first_name,
    last_name,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN USER'
        ELSE '❌ NOT ADMIN'
    END as status
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 9. Show final state
SELECT '9. Final state - all users:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 10. Show constraint verification
SELECT '10. Constraint verification:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%role%';
