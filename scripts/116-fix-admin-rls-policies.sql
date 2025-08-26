-- Fix Admin RLS Policies
-- This script ensures admin users can access all necessary tables for the admin panel

-- 1. Check current RLS policies
SELECT '1. Current RLS policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
ORDER BY tablename, policyname;

-- 2. Enable RLS on tables if not already enabled
SELECT '2. Enabling RLS on tables:' as info;
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing admin policies (if any)
SELECT '3. Dropping existing admin policies:' as info;
DROP POLICY IF EXISTS "Admin can manage all upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Admin can read subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admin can view audit logs" ON admin_audit_log;

-- 4. Create comprehensive admin policies
SELECT '4. Creating comprehensive admin policies:' as info;

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

-- Policy for admin_audit_log - admin can view
CREATE POLICY "Admin can view audit logs" ON admin_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- 5. Create fallback policies for regular users
SELECT '5. Creating fallback policies for regular users:' as info;

-- Regular users can only see their own upgrade requests
CREATE POLICY "Users can view own upgrade requests" ON upgrade_requests
    FOR SELECT USING (
        user_email = auth.jwt() ->> 'email'
    );

-- Regular users can only see their own user data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (
        email = auth.jwt() ->> 'email'
    );

-- Regular users can read subscription plans
CREATE POLICY "Users can read subscription plans" ON subscription_plans
    FOR SELECT USING (true);

-- 6. Verify admin user exists and has correct role
SELECT '6. Verifying admin user:' as info;
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

-- 7. Test admin access to tables
SELECT '7. Testing admin access to tables:' as info;
SELECT 
    'upgrade_requests' as table_name,
    COUNT(*) as record_count,
    'Admin should have access' as access_level
FROM upgrade_requests;

SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    'Admin should have access' as access_level
FROM users;

SELECT 
    'subscription_plans' as table_name,
    COUNT(*) as record_count,
    'Admin should have access' as access_level
FROM subscription_plans;

-- 8. Show final RLS policies
SELECT '8. Final RLS policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
ORDER BY tablename, policyname;

-- 9. Instructions for testing
SELECT '9. Testing instructions:' as info;
SELECT '1. Navigate to /admin/upgrade-requests' as instruction;
SELECT '2. Login with ortizvicenteesteban@gmail.com' as instruction;
SELECT '3. You should now see the admin panel' as instruction;
SELECT '4. If still not working, check browser console for errors' as instruction;
