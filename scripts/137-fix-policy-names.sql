-- Fix Policy Names with Spaces
-- This script properly handles policy names that contain spaces

-- 1. First, let's see what policies exist
SELECT '1. Current policies on users table:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'
ORDER BY policyname;

-- 2. Disable RLS temporarily
SELECT '2. Disabling RLS:' as info;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Drop policies with proper quoting for names with spaces
SELECT '3. Dropping existing policies:' as info;
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
        -- Use proper quoting for policy names that might contain spaces
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON users';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 4. Create new policies with simple names (no spaces)
SELECT '4. Creating new policies with simple names:' as info;

-- Policy for users to view their own data
CREATE POLICY "users_view_own_data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "users_update_own_data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy for inserting new users (during registration)
CREATE POLICY "users_allow_registration" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy for admin access
CREATE POLICY "admin_manage_all_users" ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 5. Re-enable RLS
SELECT '5. Re-enabling RLS:' as info;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Verify the new policies
SELECT '6. Verification of new policies:' as info;
SELECT 
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ Users can view own data'
        WHEN cmd = 'UPDATE' THEN '✅ Users can update own data'
        WHEN cmd = 'INSERT' THEN '✅ Users can register'
        WHEN cmd = 'ALL' THEN '✅ Admins can manage all'
        ELSE 'ℹ️ Other'
    END as description
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'
ORDER BY policyname;

-- 7. Test RLS status
SELECT '7. RLS status:' as info;
SELECT 
    'RLS enabled:' as check_type,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 8. Success message
SELECT '8. Policy fix complete:' as info;
SELECT '✅ All policies have been recreated with simple names' as status;
SELECT '✅ No more syntax errors with spaces in policy names' as status;
SELECT '✅ Registration should now work correctly' as status;



