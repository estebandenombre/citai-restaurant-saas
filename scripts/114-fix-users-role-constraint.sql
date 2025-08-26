-- Fix Users Table Role Constraint
-- This script fixes the role constraint in the users table to allow admin role

-- 1. Check current role constraint
SELECT '1. Current role constraint in users table:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%role%';

-- 2. Show current role values
SELECT '2. Current role values in users table:' as info;
SELECT 
    role,
    COUNT(*) as count
FROM users 
GROUP BY role 
ORDER BY role;

-- 3. Show all users
SELECT '3. All users with their roles:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 4. Drop the existing role constraint
SELECT '4. Dropping existing role constraint:' as info;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 5. Create new constraint that includes admin role
SELECT '5. Creating new role constraint with admin:' as info;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('owner', 'manager', 'staff', 'admin', 'user', 'trial', 'starter', 'pro', 'multi'));

-- 6. Verify the new constraint
SELECT '6. Verifying new constraint:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%role%';

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

-- 9. Show all admin users
SELECT '9. All admin users:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 10. Show final state of all users
SELECT '10. Final state - all users:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users 
ORDER BY created_at DESC;
