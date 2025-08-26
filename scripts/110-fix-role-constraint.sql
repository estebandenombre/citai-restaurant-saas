-- Fix Role Constraint Issue
-- This script checks and fixes the role constraint that's preventing admin role

-- 1. Check current role constraint
SELECT '1. Checking current role constraint:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%role%';

-- 2. Show current allowed values for role column
SELECT '2. Current role values in users table:' as info;
SELECT DISTINCT role FROM users ORDER BY role;

-- 3. Check if there's a check constraint on role column
SELECT '3. Checking for role check constraint:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'users' 
AND cc.check_clause LIKE '%role%';

-- 4. Drop the problematic constraint (if exists)
SELECT '4. Attempting to drop role constraint:' as info;
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'users'::regclass 
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No role constraint found to drop';
    END IF;
END $$;

-- 5. Create a new constraint that allows 'admin' role
SELECT '5. Creating new role constraint:' as info;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi'));

-- 6. Verify the new constraint
SELECT '6. Verifying new constraint:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%role%';

-- 7. Now try to update the user to admin role
SELECT '7. Updating user to admin role:' as info;
DO $$
DECLARE
    target_email TEXT := 'ortizvicenteesteban@gmail.com'; -- Your email
BEGIN
    -- Update existing user to admin role
    UPDATE users 
    SET role = 'admin',
        plan_status = 'active',
        updated_at = NOW()
    WHERE email = target_email;
    
    IF FOUND THEN
        RAISE NOTICE 'User % converted to admin successfully', target_email;
    ELSE
        RAISE NOTICE 'User % not found. Please check the email address.', target_email;
    END IF;
END $$;

-- 8. Verify the update worked
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
SELECT '9. All admin users in system:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 10. Alternative approach: Update constraint to be more flexible
SELECT '10. Alternative: Making constraint more flexible:' as info;
-- If the above doesn't work, we can make the constraint more flexible
-- Uncomment the following lines if needed:
/*
DO $$
BEGIN
    -- Drop the constraint again
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    
    -- Create a more flexible constraint
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IS NOT NULL AND role != '');
    
    RAISE NOTICE 'Created flexible role constraint';
END $$;
*/

-- 11. Instructions for manual fix
SELECT '11. Manual fix instructions:' as info;
SELECT 'If the automatic fix fails, manually run these commands:' as instruction;
SELECT '1. ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;' as command;
SELECT '2. ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (''user'', ''admin'', ''trial'', ''starter'', ''pro'', ''multi''));' as command;
SELECT '3. UPDATE users SET role = ''admin'', plan_status = ''active'' WHERE email = ''your-email@example.com'';' as command;
