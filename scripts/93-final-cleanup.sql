-- Final cleanup script - Remove all admin-related functionality
-- Run this script to complete the removal of admin functionality

-- 1. Drop admin-related tables
DROP TABLE IF EXISTS upgrade_requests CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. Show confirmation
SELECT 'ADMIN FUNCTIONALITY REMOVED:' as info;
SELECT '✅ upgrade_requests table dropped' as status;
SELECT '✅ admin_users table dropped' as status;
SELECT '✅ Admin dashboard removed from application' as status;
SELECT '✅ Upgrade request system removed' as status;
SELECT '✅ User plan management now handled via Supabase directly' as status;

-- 3. Show remaining tables
SELECT 'Remaining tables in database:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 4. Show users table structure (for reference)
SELECT 'Users table structure (for plan management):' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Instructions for managing user plans
SELECT 'HOW TO MANAGE USER PLANS:' as info;
SELECT '1. Use scripts/92-manage-user-plans.sql for common operations' as instruction;
SELECT '2. Run queries directly in Supabase SQL Editor' as instruction;
SELECT '3. Update users table directly for plan changes' as instruction;
SELECT '4. Contact support@tably.com for user inquiries' as instruction;

-- 6. Example queries for reference
SELECT 'EXAMPLE QUERIES:' as info;
SELECT '-- View all users and plans:' as example;
SELECT 'SELECT u.email, u.plan_status, sp.name as plan_name FROM users u LEFT JOIN subscription_plans sp ON u.plan_id = sp.id;' as example;
SELECT '' as example;
SELECT '-- Upgrade user to Pro plan:' as example;
SELECT 'UPDATE users SET plan_id = (SELECT id FROM subscription_plans WHERE name = "pro-plan"), plan_status = "active", current_period_end = NOW() + INTERVAL "30 days" WHERE email = "user@example.com";' as example;
