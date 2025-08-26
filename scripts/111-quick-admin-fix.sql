-- Quick Admin Fix
-- Simple script to fix the role constraint and make user admin

-- 1. Drop the problematic constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Create a new constraint that allows admin role
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi'));

-- 3. Update your user to admin role
UPDATE users 
SET role = 'admin',
    plan_status = 'active',
    updated_at = NOW()
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 4. Verify the change
SELECT 
    email,
    role,
    plan_status,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN USER'
        ELSE '❌ NOT ADMIN'
    END as status
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 5. Show all admin users
SELECT 'All admin users:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;
