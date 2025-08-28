-- Simple RLS Fix for Registration
-- This script temporarily disables RLS to allow user registration

-- 1. Check current RLS status
SELECT '1. Current RLS status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 2. Disable RLS completely for users table
SELECT '2. Disabling RLS for users table:' as info;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Drop all problematic policies
SELECT '3. Dropping all policies:' as info;
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

-- 4. Verify RLS is disabled
SELECT '4. Verification:' as info;
SELECT 
    'RLS status:' as check_type,
    CASE WHEN rowsecurity THEN '❌ STILL ENABLED' ELSE '✅ DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

SELECT 
    'Policies remaining:' as check_type,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 5. Test instructions
SELECT '5. Test instructions:' as info;
SELECT 'RLS is now disabled for users table' as status;
SELECT 'Try creating a new account - registration should work now' as instruction;
SELECT 'The infinite recursion error should be resolved' as note;

-- 6. Optional: Re-enable RLS later with safe policies
SELECT '6. Optional re-enablement:' as info;
SELECT 'To re-enable RLS later, run:' as instruction;
SELECT 'ALTER TABLE users ENABLE ROW LEVEL SECURITY;' as command;
SELECT 'Then create simple policies without recursion' as note;




