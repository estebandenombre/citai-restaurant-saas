-- Check Current Users Schema
-- This script checks the current structure of the users table

-- 1. Check current users table structure
SELECT '1. CURRENT USERS TABLE STRUCTURE:' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if plan_id and plan_status columns exist
SELECT '2. CHECKING FOR PLAN COLUMNS:' as section;
SELECT 
    'plan_id exists:' as check_column,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
                AND table_schema = 'public' 
                AND column_name = 'plan_id'
        ) THEN '✅ YES'
        ELSE '❌ NO'
    END as exists
UNION ALL
SELECT 
    'plan_status exists:' as check_column,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
                AND table_schema = 'public' 
                AND column_name = 'plan_status'
        ) THEN '✅ YES'
        ELSE '❌ NO'
    END as exists;

-- 3. Show sample user data
SELECT '3. SAMPLE USER DATA:' as section;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    restaurant_id,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check subscription_plans table
SELECT '4. SUBSCRIPTION PLANS:' as section;
SELECT 
    id,
    name,
    price,
    is_active
FROM subscription_plans
ORDER BY price;

-- 5. Check restaurants table
SELECT '5. RESTAURANTS:' as section;
SELECT 
    id,
    name,
    slug,
    is_active
FROM restaurants
ORDER BY created_at DESC
LIMIT 5;



