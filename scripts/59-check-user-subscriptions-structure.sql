-- Check the current structure of user_subscriptions table
-- This script helps identify what columns actually exist

-- 1. Check table structure
SELECT 'User Subscriptions Table Structure:' as test;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if admin_notes column exists
SELECT 'Checking for admin_notes column:' as test;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_subscriptions' 
      AND column_name = 'admin_notes'
      AND table_schema = 'public'
    ) THEN 'admin_notes column EXISTS'
    ELSE 'admin_notes column DOES NOT EXIST'
  END as admin_notes_status;

-- 3. Show sample data structure
SELECT 'Sample data from user_subscriptions:' as test;
SELECT * FROM user_subscriptions LIMIT 3;

-- 4. Check what columns are actually available
SELECT 'Available columns in user_subscriptions:' as test;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
AND table_schema = 'public'
ORDER BY ordinal_position;
