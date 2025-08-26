-- Simplify to plan_id only - Remove plan_status column
-- This script simplifies the plan management system

-- 1. Create a function to calculate plan status dynamically
CREATE OR REPLACE FUNCTION get_user_plan_status(user_trial_end TIMESTAMPTZ, user_current_period_end TIMESTAMPTZ)
RETURNS TEXT AS $$
BEGIN
    -- If user has trial and it's not expired
    IF user_trial_end IS NOT NULL AND user_trial_end > NOW() THEN
        RETURN 'trial';
    -- If user has active subscription period
    ELSIF user_current_period_end IS NOT NULL AND user_current_period_end > NOW() THEN
        RETURN 'active';
    -- If subscription period has expired
    ELSIF user_current_period_end IS NOT NULL AND user_current_period_end <= NOW() THEN
        RETURN 'expired';
    -- No plan assigned
    ELSE
        RETURN 'no_plan';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Show current data before migration
SELECT 'Current data before migration:' as info;
SELECT 
    u.email,
    u.plan_id,
    u.plan_status as old_status,
    u.trial_end,
    u.current_period_end,
    get_user_plan_status(u.trial_end, u.current_period_end) as calculated_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 3. Verify the function works correctly
SELECT 'Status calculation verification:' as info;
SELECT 
    u.email,
    u.plan_status as stored_status,
    get_user_plan_status(u.trial_end, u.current_period_end) as calculated_status,
    CASE 
        WHEN u.plan_status = get_user_plan_status(u.trial_end, u.current_period_end) 
        THEN '✅ MATCH' 
        ELSE '❌ DIFFERENT' 
    END as status_match
FROM users u
ORDER BY u.created_at DESC;

-- 4. Remove plan_status column (COMMENTED OUT - UNCOMMENT TO EXECUTE)
-- ALTER TABLE users DROP COLUMN IF EXISTS plan_status;

-- 5. Show simplified structure
SELECT 'Simplified structure (after removing plan_status):' as info;
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

-- 6. Example queries with new approach
SELECT 'EXAMPLE QUERIES WITH NEW APPROACH:' as info;
SELECT '-- Get user with plan info and calculated status:' as example;
SELECT 'SELECT u.email, sp.name as plan_name, get_user_plan_status(u.trial_end, u.current_period_end) as status FROM users u LEFT JOIN subscription_plans sp ON u.plan_id = sp.id;' as example;
SELECT '' as example;
SELECT '-- Find users with expired trials:' as example;
SELECT 'SELECT u.email FROM users u WHERE get_user_plan_status(u.trial_end, u.current_period_end) = "expired";' as example;
SELECT '' as example;
SELECT '-- Find active users:' as example;
SELECT 'SELECT u.email FROM users u WHERE get_user_plan_status(u.trial_end, u.current_period_end) = "active";' as example;

-- 7. Migration instructions
SELECT 'MIGRATION INSTRUCTIONS:' as info;
SELECT '1. Run this script to create the function' as step;
SELECT '2. Test the function with current data' as step;
SELECT '3. Update all application code to use get_user_plan_status()' as step;
SELECT '4. Uncomment the ALTER TABLE line to remove plan_status' as step;
SELECT '5. Update all queries to use the function instead of plan_status' as step;

-- 8. Benefits of this approach
SELECT 'BENEFITS:' as info;
SELECT '✅ Single source of truth: plan_id only' as benefit;
SELECT '✅ Status calculated dynamically (always accurate)' as benefit;
✅ No data redundancy' as benefit;
SELECT '✅ Simpler schema' as benefit;
SELECT '✅ Easier to understand and maintain' as benefit;
