-- Quick Users Table Fix
-- Fix the role constraint and make user admin

-- 1. Drop the existing role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Create new constraint that includes admin role
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('owner', 'manager', 'staff', 'admin', 'user', 'trial', 'starter', 'pro', 'multi'));

-- 3. Update your user to admin role
UPDATE users 
SET role = 'admin',
    plan_status = 'active',
    updated_at = NOW()
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 4. Verify the result
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
