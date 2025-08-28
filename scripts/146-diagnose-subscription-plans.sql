-- Diagnose Subscription Plans
-- This script checks the current state of subscription plans

-- 1. Check all subscription plans
SELECT '1. ALL SUBSCRIPTION PLANS:' as section;
SELECT 
    id,
    name,
    description,
    price,
    currency,
    interval,
    is_active,
    created_at
FROM subscription_plans
ORDER BY price, name;

-- 2. Check for duplicate plan names
SELECT '2. DUPLICATE PLAN NAMES:' as section;
SELECT 
    name,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as ids,
    STRING_AGG(price::text, ', ') as prices
FROM subscription_plans
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- 3. Check for similar plan names (potential duplicates)
SELECT '3. SIMILAR PLAN NAMES:' as section;
SELECT 
    name,
    COUNT(*) as count
FROM subscription_plans
WHERE name LIKE '%trial%' OR name LIKE '%free%'
GROUP BY name
ORDER BY name;

-- 4. Check users and their plans
SELECT '4. USERS AND THEIR PLANS:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_status,
    sp.name as plan_name,
    sp.price as plan_price,
    u.trial_end,
    CASE 
        WHEN u.trial_end < NOW() THEN 'EXPIRED'
        WHEN u.trial_end IS NULL THEN 'NO TRIAL'
        ELSE 'ACTIVE'
    END as trial_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 5. Check user_subscriptions table
SELECT '5. USER_SUBSCRIPTIONS TABLE:' as section;
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT plan_id) as unique_plans
FROM user_subscriptions;

-- 6. Check user_subscriptions details
SELECT '6. USER_SUBSCRIPTIONS DETAILS:' as section;
SELECT 
    us.user_id,
    u.email,
    sp.name as plan_name,
    us.status,
    us.created_at
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

-- 7. Check for orphaned references
SELECT '7. ORPHANED REFERENCES:' as section;

-- Users with plan_id that doesn't exist in subscription_plans
SELECT 'Users with invalid plan_id:' as issue;
SELECT 
    u.id,
    u.email,
    u.plan_id,
    u.plan_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_id IS NOT NULL AND sp.id IS NULL;

-- User_subscriptions with plan_id that doesn't exist
SELECT 'User_subscriptions with invalid plan_id:' as issue;
SELECT 
    us.user_id,
    us.plan_id,
    us.status
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- 8. Check trigger function
SELECT '8. TRIGGER FUNCTION:' as section;
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'assign_trial_to_new_user';

-- 9. Check triggers
SELECT '9. TRIGGERS:' as section;
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name,
    tgenabled as enabled
FROM pg_trigger
WHERE tgname LIKE '%trial%';

-- 10. Summary
SELECT '10. SUMMARY:' as section;
SELECT 
    'Total subscription plans:' as metric,
    COUNT(*) as value
FROM subscription_plans
UNION ALL
SELECT 
    'Total users:' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with plan_id:' as metric,
    COUNT(*) as value
FROM users WHERE plan_id IS NOT NULL
UNION ALL
SELECT 
    'Users with trial status:' as metric,
    COUNT(*) as value
FROM users WHERE plan_status = 'trial'
UNION ALL
SELECT 
    'Total user_subscriptions:' as metric,
    COUNT(*) as value
FROM user_subscriptions;




