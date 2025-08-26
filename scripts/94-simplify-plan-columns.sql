-- Simplify plan columns - Remove redundancy
-- This script simplifies the plan management to use only plan_id

-- 1. Show current structure
SELECT 'Current plan columns in users table:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name LIKE '%plan%'
ORDER BY ordinal_position;

-- 2. Show current data
SELECT 'Current plan data:' as info;
SELECT 
    u.email,
    u.plan_id,
    u.plan_status,
    sp.name as plan_name,
    sp.display_name as plan_display_name
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 3. Analysis: Why we have both columns
SELECT 'ANALYSIS:' as info;
SELECT 'plan_id: References subscription_plans table - tells us WHICH plan' as explanation;
SELECT 'plan_status: Tells us the STATE (trial, active, expired, cancelled)' as explanation;
SELECT 'PROBLEM: This is redundant and confusing' as problem;
SELECT 'SOLUTION: Use only plan_id and calculate status dynamically' as solution;

-- 4. Show how status could be calculated
SELECT 'How status could be calculated dynamically:' as info;
SELECT 
    u.email,
    u.plan_id,
    sp.name as plan_name,
    u.trial_end,
    u.current_period_end,
    CASE 
        WHEN u.trial_end IS NOT NULL AND u.trial_end > NOW() THEN 'trial'
        WHEN u.current_period_end IS NOT NULL AND u.current_period_end > NOW() THEN 'active'
        WHEN u.current_period_end IS NOT NULL AND u.current_period_end <= NOW() THEN 'expired'
        ELSE 'no_plan'
    END as calculated_status,
    u.plan_status as stored_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 5. Recommendation
SELECT 'RECOMMENDATION:' as info;
SELECT 'Option 1: Keep plan_id only, calculate status dynamically' as option;
SELECT 'Option 2: Keep plan_status only, remove plan_id' as option;
SELECT 'Option 3: Keep both but make it clearer' as option;
SELECT 'RECOMMENDED: Option 1 - Use only plan_id' as recommended;

-- 6. Migration plan
SELECT 'MIGRATION PLAN:' as info;
SELECT '1. Update all code to use plan_id only' as step;
SELECT '2. Create function to calculate status dynamically' as step;
SELECT '3. Remove plan_status column' as step;
SELECT '4. Update all queries and services' as step;

-- 7. Example of simplified approach
SELECT 'SIMPLIFIED APPROACH EXAMPLE:' as info;
SELECT '-- Get user plan info:' as example;
SELECT 'SELECT u.email, sp.name as plan_name, sp.display_name FROM users u LEFT JOIN subscription_plans sp ON u.plan_id = sp.id;' as example;
SELECT '' as example;
SELECT '-- Calculate status dynamically:' as example;
SELECT 'CASE WHEN u.trial_end > NOW() THEN "trial" WHEN u.current_period_end > NOW() THEN "active" ELSE "expired" END' as example;
