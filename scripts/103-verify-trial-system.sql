-- Verify Trial System Setup
-- This script checks that the trial system is working correctly

-- 1. Check if all required columns exist
SELECT '1. Checking required columns in users table:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('plan_id', 'plan_status', 'trial_start', 'trial_end', 'current_period_start', 'current_period_end')
ORDER BY column_name;

-- 2. Check if trial assignment function exists
SELECT '2. Checking trial assignment function:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'assign_trial_to_new_user'
AND routine_schema = 'public';

-- 3. Check if trigger exists
SELECT '3. Checking trial assignment trigger:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_assign_trial'
AND event_object_table = 'users';

-- 4. Check subscription plans
SELECT '4. Available subscription plans:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    billing_cycle,
    is_active,
    created_at
FROM subscription_plans
ORDER BY price;

-- 5. Check current users and their trial status
SELECT '5. Current users and their trial status:' as info;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.plan_status,
    u.trial_start,
    u.trial_end,
    u.current_period_start,
    u.current_period_end,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    CASE 
        WHEN u.trial_end < NOW() AND u.plan_status = 'trial' THEN 'TRIAL_EXPIRED'
        WHEN u.trial_end >= NOW() AND u.plan_status = 'trial' THEN 'TRIAL_ACTIVE'
        WHEN u.plan_status = 'active' THEN 'PAID_PLAN'
        WHEN u.plan_status = 'canceled' THEN 'CANCELED'
        ELSE 'UNKNOWN'
    END as current_status,
    CASE 
        WHEN u.trial_end < NOW() AND u.plan_status = 'trial' THEN 'Contact required for upgrade'
        WHEN u.trial_end >= NOW() AND u.plan_status = 'trial' THEN CONCAT(EXTRACT(DAY FROM (u.trial_end - NOW())), ' days remaining')
        WHEN u.plan_status = 'active' THEN 'Active subscription'
        WHEN u.plan_status = 'canceled' THEN 'Subscription canceled'
        ELSE 'No plan assigned'
    END as status_description
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 6. Test trial expiration function
SELECT '6. Testing trial expiration function:' as info;
SELECT 
    u.email,
    u.plan_status,
    is_user_trial_expired(u.id) as is_trial_expired,
    get_user_subscription_status(u.id) as subscription_status
FROM users u
WHERE u.plan_status = 'trial'
ORDER BY u.trial_end;

-- 7. Check for users without proper trial setup
SELECT '7. Users that might need trial setup:' as info;
SELECT 
    u.email,
    u.plan_status,
    u.trial_start,
    u.trial_end,
    CASE 
        WHEN u.plan_id IS NULL THEN 'No plan assigned'
        WHEN u.plan_status IS NULL THEN 'No status assigned'
        WHEN u.trial_start IS NULL THEN 'No trial start date'
        WHEN u.trial_end IS NULL THEN 'No trial end date'
        ELSE 'OK'
    END as issue
FROM users u
WHERE u.plan_id IS NULL 
   OR u.plan_status IS NULL 
   OR u.trial_start IS NULL 
   OR u.trial_end IS NULL;

-- 8. Summary statistics
SELECT '8. Summary statistics:' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN plan_status = 'trial' THEN 1 END) as trial_users,
    COUNT(CASE WHEN plan_status = 'trial' AND trial_end < NOW() THEN 1 END) as expired_trials,
    COUNT(CASE WHEN plan_status = 'trial' AND trial_end >= NOW() THEN 1 END) as active_trials,
    COUNT(CASE WHEN plan_status = 'active' THEN 1 END) as paid_users,
    COUNT(CASE WHEN plan_status = 'canceled' THEN 1 END) as canceled_users
FROM users;

-- 9. Instructions for testing
SELECT '9. Testing instructions:' as info;
SELECT 'To test the trial system:' as instruction;
SELECT '1. Create a new user account' as step;
SELECT '2. Check that they automatically get a 14-day trial' as step;
SELECT '3. Verify trial_end is set to 14 days from creation' as step;
SELECT '4. Test trial expiration by manually setting trial_end to past date' as step;
SELECT '5. Verify trial_expired status is shown correctly' as step;

-- 10. Manual plan management examples
SELECT '10. Manual plan management examples:' as info;
SELECT '-- Upgrade user to Pro plan:' as example;
SELECT 'UPDATE users SET plan_id = (SELECT id FROM subscription_plans WHERE name = "pro-plan"), plan_status = "active" WHERE email = "user@example.com";' as sql_example;
SELECT '' as blank;
SELECT '-- Extend trial by 7 days:' as example;
SELECT 'UPDATE users SET trial_end = NOW() + INTERVAL "7 days" WHERE email = "user@example.com";' as sql_example;
SELECT '' as blank;
SELECT '-- Cancel subscription:' as example;
SELECT 'UPDATE users SET plan_status = "canceled" WHERE email = "user@example.com";' as sql_example;
