-- Remove admin-related tables and functionality
-- This script removes all admin-related tables and data

-- 1. Drop admin-related tables
DROP TABLE IF EXISTS upgrade_requests CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. Remove admin-related columns from users table (if they exist)
-- Note: We'll keep the plan-related columns as they're still useful for user management

-- 3. Show remaining tables
SELECT 'Remaining tables after cleanup:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 4. Show users table structure
SELECT 'Users table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Summary
SELECT 'CLEANUP COMPLETE:' as info;
SELECT '✅ Removed upgrade_requests table' as status;
SELECT '✅ Removed admin_users table' as status;
SELECT '✅ Kept user plan management columns in users table' as status;
SELECT '✅ Admin functionality removed from application' as status;
