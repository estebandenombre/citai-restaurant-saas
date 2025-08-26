-- User Plan Management Script for Supabase
-- Use this script to manage user plans directly from Supabase SQL Editor

-- 1. View all users and their current plans
SELECT 'All Users and Their Plans:' as info;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.plan_status,
    u.trial_end,
    u.current_period_end,
    sp.name as plan_name,
    sp.price as plan_price,
    u.created_at,
    CASE 
        WHEN u.plan_status = 'trial' AND u.trial_end < NOW() THEN 'TRIAL EXPIRED'
        WHEN u.plan_status = 'active' AND u.current_period_end < NOW() THEN 'SUBSCRIPTION EXPIRED'
        ELSE 'ACTIVE'
    END as status_summary
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 2. View available subscription plans
SELECT 'Available Subscription Plans:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    billing_cycle,
    features,
    is_active
FROM subscription_plans
ORDER BY price;

-- 3. Update a user's plan (replace the values below)
-- Example: Upgrade user to Pro plan
/*
UPDATE users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro-plan'),
    plan_status = 'active',
    current_period_end = NOW() + INTERVAL '30 days',
    trial_end = NULL
WHERE email = 'user@example.com';
*/

-- 4. Extend a user's trial
-- Example: Extend trial by 14 days
/*
UPDATE users 
SET 
    trial_end = trial_end + INTERVAL '14 days',
    current_period_end = trial_end + INTERVAL '14 days'
WHERE email = 'user@example.com' AND plan_status = 'trial';
*/

-- 5. Cancel a user's subscription
-- Example: Cancel subscription
/*
UPDATE users 
SET 
    plan_status = 'cancelled',
    current_period_end = NOW()
WHERE email = 'user@example.com';
*/

-- 6. Reset user to trial
-- Example: Reset user to trial plan
/*
UPDATE users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan'),
    plan_status = 'trial',
    trial_end = NOW() + INTERVAL '14 days',
    current_period_end = NOW() + INTERVAL '14 days'
WHERE email = 'user@example.com';
*/

-- 7. Find users with expired trials
SELECT 'Users with Expired Trials:' as info;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.trial_end,
    u.plan_status,
    sp.name as plan_name
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_status = 'trial' 
AND u.trial_end < NOW()
ORDER BY u.trial_end;

-- 8. Find users with expired subscriptions
SELECT 'Users with Expired Subscriptions:' as info;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.current_period_end,
    u.plan_status,
    sp.name as plan_name
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_status = 'active' 
AND u.current_period_end < NOW()
ORDER BY u.current_period_end;

-- 9. Statistics
SELECT 'User Plan Statistics:' as info;
SELECT 
    plan_status,
    COUNT(*) as user_count
FROM users 
GROUP BY plan_status
ORDER BY user_count DESC;

-- 10. Instructions for common operations
SELECT 'COMMON OPERATIONS:' as info;
SELECT '1. To upgrade a user: Update plan_id, plan_status to "active", set current_period_end' as operation;
SELECT '2. To extend trial: Update trial_end and current_period_end' as operation;
SELECT '3. To cancel: Set plan_status to "cancelled"' as operation;
SELECT '4. To reset to trial: Set plan_id to trial plan, plan_status to "trial"' as operation;
SELECT '5. Always use WHERE email = "user@example.com" to target specific users' as operation;
