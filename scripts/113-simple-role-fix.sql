-- Simple Role Fix
-- Fix all role values and make user admin

-- 1. Fix all problematic role values first
UPDATE users SET role = 'user' WHERE role IS NULL;
UPDATE users SET role = 'user' WHERE role = '';
UPDATE users SET role = 'user' WHERE role NOT IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi');

-- 2. Drop and recreate the constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'trial', 'starter', 'pro', 'multi'));

-- 3. Make your user admin
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
