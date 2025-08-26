-- Quick Admin Access Fix
-- Fix RLS policies to allow admin access to the admin panel

-- 1. Enable RLS on tables
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Admin can manage all upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Admin can read subscription plans" ON subscription_plans;

-- 3. Create admin policies
CREATE POLICY "Admin can manage all upgrade requests" ON upgrade_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can read subscription plans" ON subscription_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- 4. Create user policies
CREATE POLICY "Users can view own upgrade requests" ON upgrade_requests
    FOR SELECT USING (
        user_email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (
        email = auth.jwt() ->> 'email'
    );

CREATE POLICY "Users can read subscription plans" ON subscription_plans
    FOR SELECT USING (true);

-- 5. Verify admin user
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
