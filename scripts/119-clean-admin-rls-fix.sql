-- Clean Admin RLS Fix
-- This script properly handles existing policies by dropping all of them first

-- 1. Drop ALL existing policies for these tables
SELECT '1. Dropping all existing policies:' as info;

-- Drop all policies for upgrade_requests
DROP POLICY IF EXISTS "Admin can manage all upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Users can view own upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON upgrade_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON upgrade_requests;
DROP POLICY IF EXISTS "Enable update for users based on user_email" ON upgrade_requests;
DROP POLICY IF EXISTS "Enable delete for users based on user_email" ON upgrade_requests;

-- Drop all policies for users
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;

-- Drop all policies for subscription_plans
DROP POLICY IF EXISTS "Admin can read subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can read subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Enable read access for all users" ON subscription_plans;

-- Drop all policies for admin_audit_log
DROP POLICY IF EXISTS "Admin can view audit logs" ON admin_audit_log;

-- 2. Enable RLS on tables
SELECT '2. Enabling RLS on tables:' as info;
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 3. Create admin policies
SELECT '3. Creating admin policies:' as info;

-- Policy for upgrade_requests - admin can do everything
CREATE POLICY "Admin can manage all upgrade requests" ON upgrade_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- Policy for users - admin can do everything
CREATE POLICY "Admin can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- Policy for subscription_plans - admin can read
CREATE POLICY "Admin can read subscription plans" ON subscription_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- 4. Create user policies
SELECT '4. Creating user policies:' as info;

-- Regular users can only see their own upgrade requests
CREATE POLICY "Users can view own upgrade requests" ON upgrade_requests
    FOR SELECT USING (
        user_email = auth.jwt() ->> 'email'
    );

-- Regular users can create their own upgrade requests
CREATE POLICY "Users can create own upgrade requests" ON upgrade_requests
    FOR INSERT WITH CHECK (
        user_email = auth.jwt() ->> 'email'
    );

-- Regular users can only see their own user data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (
        email = auth.jwt() ->> 'email'
    );

-- Regular users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (
        email = auth.jwt() ->> 'email'
    );

-- Regular users can read subscription plans
CREATE POLICY "Users can read subscription plans" ON subscription_plans
    FOR SELECT USING (true);

-- 5. Verify admin user
SELECT '5. Verifying admin user:' as info;
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

-- 6. Show final policies
SELECT '6. Final RLS policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
ORDER BY tablename, policyname;
