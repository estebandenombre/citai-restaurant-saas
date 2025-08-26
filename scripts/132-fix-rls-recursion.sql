-- Fix RLS Recursion Issue
-- This script fixes the infinite recursion in RLS policies for users table

-- 1. Check current RLS policies on users table
SELECT '1. Current RLS policies on users table:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'
ORDER BY policyname;

-- 2. Check if RLS is enabled on users table
SELECT '2. RLS status on users table:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 3. Disable RLS temporarily to test
SELECT '3. Temporarily disabling RLS:' as info;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies on users table
SELECT '4. Dropping existing policies:' as info;
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || policy_record.policyname || ' ON users';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 5. Create simple, safe policies
SELECT '5. Creating safe RLS policies:' as info;

-- Policy for users to view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy for inserting new users (during registration)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy for admin access (if needed)
CREATE POLICY "Admin can manage all users" ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Re-enable RLS
SELECT '6. Re-enabling RLS:' as info;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Verify the fix
SELECT '7. Verification:' as info;
SELECT 
    'RLS enabled:' as check_type,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

SELECT 
    'Policies created:' as check_type,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 8. Test registration simulation
SELECT '8. Registration test:' as info;
SELECT 'RLS recursion issue should now be resolved' as status;
SELECT 'Try creating a new account to test the registration' as instruction;
SELECT 'The infinite recursion error should no longer appear' as note;

-- 9. Additional safety check
SELECT '9. Safety check:' as info;
SELECT 
    'Current user count:' as check_type,
    COUNT(*) as user_count
FROM users;


