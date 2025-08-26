-- Verify trial system setup
-- This script verifies that the trial system is working correctly

-- 1. Check if trigger exists
SELECT 'Checking trigger setup:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_assign_trial'
AND event_object_table = 'users';

-- 2. Check if functions exist
SELECT 'Checking function setup:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('assign_trial_to_new_user', 'is_user_trial_expired', 'get_user_subscription_status')
AND routine_schema = 'public';

-- 3. Check subscription plans
SELECT 'Available subscription plans:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    billing_cycle,
    is_active
FROM subscription_plans
ORDER BY price;

-- 4. Check current users and their trial status
SELECT 'Current users and trial status:' as info;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.plan_status,
    u.trial_start,
    u.trial_end,
    u.current_period_end,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    CASE 
        WHEN u.trial_end > NOW() THEN 'TRIAL ACTIVE'
        WHEN u.trial_end <= NOW() THEN 'TRIAL EXPIRED'
        ELSE 'NO TRIAL'
    END as trial_status,
    CASE 
        WHEN u.trial_end > NOW() THEN EXTRACT(DAYS FROM u.trial_end - NOW())
        ELSE 0
    END as days_remaining
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 5. Test the subscription status function
SELECT 'Testing subscription status function:' as info;
SELECT 
    u.email,
    get_user_subscription_status(u.email) as calculated_status,
    u.plan_status as stored_status
FROM users u
ORDER BY u.created_at DESC;

-- 6. Show users with expired trials
SELECT 'Users with expired trials:' as info;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.trial_end,
    EXTRACT(DAYS FROM NOW() - u.trial_end) as days_expired,
    get_user_subscription_status(u.email) as status
FROM users u
WHERE u.trial_end IS NOT NULL AND u.trial_end < NOW()
ORDER BY u.trial_end;

-- 7. Show users with active trials
SELECT 'Users with active trials:' as info;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.trial_end,
    EXTRACT(DAYS FROM u.trial_end - NOW()) as days_remaining,
    get_user_subscription_status(u.email) as status
FROM users u
WHERE u.trial_end IS NOT NULL AND u.trial_end > NOW()
ORDER BY u.trial_end;

-- 8. Test creating a new user (commented out)
-- INSERT INTO users (email, first_name, last_name, restaurant_name) 
-- VALUES ('test-trial@example.com', 'Test', 'Trial', 'Test Restaurant');

-- 9. Instructions for testing
SELECT 'TESTING INSTRUCTIONS:' as info;
SELECT '1. Create a new user account to test automatic trial assignment' as instruction;
SELECT '2. Check that trial_end is set to 14 days from creation' as instruction;
SELECT '3. Test trial expiration by manually updating trial_end to past date' as instruction;
SELECT '4. Verify that expired users see trial_expired status' as instruction;
SELECT '5. Check that application shows expiration banner/card' as instruction;

-- 10. Manual test queries
SELECT 'MANUAL TEST QUERIES:' as info;
SELECT '-- Test trial expiration for a specific user:' as example;
SELECT 'UPDATE users SET trial_end = NOW() - INTERVAL "1 day" WHERE email = "user@example.com";' as example;
SELECT '' as example;
SELECT '-- Check status after expiration:' as example;
SELECT 'SELECT get_user_subscription_status("user@example.com");' as example;
SELECT '' as example;
SELECT '-- Reset trial for testing:' as example;
SELECT 'UPDATE users SET trial_end = NOW() + INTERVAL "14 days" WHERE email = "user@example.com";' as example;
