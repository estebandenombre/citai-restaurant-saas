-- Final Admin RLS Fix
-- This script handles existing policies and missing tables properly

-- 1. Drop existing policies for tables that exist
SELECT '1. Dropping existing policies:' as info;

-- Drop policies for upgrade_requests (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'upgrade_requests') THEN
        DROP POLICY IF EXISTS "Admin can manage all upgrade requests" ON upgrade_requests;
        DROP POLICY IF EXISTS "Users can view own upgrade requests" ON upgrade_requests;
        DROP POLICY IF EXISTS "Enable read access for all users" ON upgrade_requests;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON upgrade_requests;
        DROP POLICY IF EXISTS "Enable update for users based on user_email" ON upgrade_requests;
        DROP POLICY IF EXISTS "Enable delete for users based on user_email" ON upgrade_requests;
        RAISE NOTICE 'Dropped policies for upgrade_requests';
    ELSE
        RAISE NOTICE 'Table upgrade_requests does not exist, skipping';
    END IF;
END $$;

-- Drop policies for users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP POLICY IF EXISTS "Admin can manage all users" ON users;
        DROP POLICY IF EXISTS "Users can view own data" ON users;
        DROP POLICY IF EXISTS "Enable read access for all users" ON users;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;
        RAISE NOTICE 'Dropped policies for users';
    ELSE
        RAISE NOTICE 'Table users does not exist, skipping';
    END IF;
END $$;

-- Drop policies for subscription_plans (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        DROP POLICY IF EXISTS "Admin can read subscription plans" ON subscription_plans;
        DROP POLICY IF EXISTS "Users can read subscription plans" ON subscription_plans;
        DROP POLICY IF EXISTS "Enable read access for all users" ON subscription_plans;
        RAISE NOTICE 'Dropped policies for subscription_plans';
    ELSE
        RAISE NOTICE 'Table subscription_plans does not exist, skipping';
    END IF;
END $$;

-- 2. Enable RLS on tables that exist
SELECT '2. Enabling RLS on tables:' as info;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'upgrade_requests') THEN
        ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on upgrade_requests';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on users';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on subscription_plans';
    END IF;
END $$;

-- 3. Create admin policies
SELECT '3. Creating admin policies:' as info;

-- Policy for upgrade_requests - admin can do everything
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'upgrade_requests') THEN
        CREATE POLICY "Admin can manage all upgrade requests" ON upgrade_requests
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE email = auth.jwt() ->> 'email' 
                    AND role = 'admin'
                )
            );
        RAISE NOTICE 'Created admin policy for upgrade_requests';
    END IF;
END $$;

-- Policy for users - admin can do everything
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE POLICY "Admin can manage all users" ON users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE email = auth.jwt() ->> 'email' 
                    AND role = 'admin'
                )
            );
        RAISE NOTICE 'Created admin policy for users';
    END IF;
END $$;

-- Policy for subscription_plans - admin can read
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        CREATE POLICY "Admin can read subscription plans" ON subscription_plans
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE email = auth.jwt() ->> 'email' 
                    AND role = 'admin'
                )
            );
        RAISE NOTICE 'Created admin policy for subscription_plans';
    END IF;
END $$;

-- 4. Create user policies
SELECT '4. Creating user policies:' as info;

-- Regular users can only see their own upgrade requests
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'upgrade_requests') THEN
        CREATE POLICY "Users can view own upgrade requests" ON upgrade_requests
            FOR SELECT USING (
                user_email = auth.jwt() ->> 'email'
            );
        RAISE NOTICE 'Created user view policy for upgrade_requests';
        
        CREATE POLICY "Users can create own upgrade requests" ON upgrade_requests
            FOR INSERT WITH CHECK (
                user_email = auth.jwt() ->> 'email'
            );
        RAISE NOTICE 'Created user insert policy for upgrade_requests';
    END IF;
END $$;

-- Regular users can only see their own user data
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE POLICY "Users can view own data" ON users
            FOR SELECT USING (
                email = auth.jwt() ->> 'email'
            );
        RAISE NOTICE 'Created user view policy for users';
        
        CREATE POLICY "Users can update own data" ON users
            FOR UPDATE USING (
                email = auth.jwt() ->> 'email'
            );
        RAISE NOTICE 'Created user update policy for users';
    END IF;
END $$;

-- Regular users can read subscription plans
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        CREATE POLICY "Users can read subscription plans" ON subscription_plans
            FOR SELECT USING (true);
        RAISE NOTICE 'Created user read policy for subscription_plans';
    END IF;
END $$;

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

-- 7. Test admin access
SELECT '7. Testing admin access:' as info;
SELECT 
    'upgrade_requests' as table_name,
    COUNT(*) as record_count
FROM upgrade_requests;

SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users;

SELECT 
    'subscription_plans' as table_name,
    COUNT(*) as record_count
FROM subscription_plans;
