-- Diagnose Permissions Issue
-- This script helps identify why users with starter plan can access analytics

-- 1. Check all subscription plans and their current features
SELECT '1. ALL SUBSCRIPTION PLANS:' as section;
SELECT 
    id,
    name as plan_name,
    price,
    features->>'analytics' as analytics_access,
    features->>'ai_chat' as ai_chat_access,
    features
FROM subscription_plans
ORDER BY price;

-- 2. Check specific starter plan
SELECT '2. STARTER PLAN DETAILS:' as section;
SELECT 
    id,
    name as plan_name,
    price,
    features->>'analytics' as analytics_access,
    features->>'ai_chat' as ai_chat_access,
    features
FROM subscription_plans
WHERE name = 'starter-plan';

-- 3. Check all users and their current plan access
SELECT '3. ALL USERS AND THEIR ACCESS:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.plan_status,
    sp.name as plan_name,
    sp.features->>'analytics' as has_analytics,
    sp.features->>'ai_chat' as has_ai_chat,
    u.trial_end,
    CASE 
        WHEN u.trial_end < NOW() THEN 'EXPIRED'
        WHEN u.trial_end IS NULL THEN 'NO TRIAL'
        ELSE 'ACTIVE'
    END as trial_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 4. Check users specifically with starter plan
SELECT '4. USERS WITH STARTER PLAN:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.plan_status,
    sp.name as plan_name,
    sp.features->>'analytics' as has_analytics,
    sp.features->>'ai_chat' as has_ai_chat,
    sp.features as full_features
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE sp.name = 'starter-plan'
ORDER BY u.created_at DESC;

-- 5. Check if there are any users with wrong plan_id
SELECT '5. USERS WITH POTENTIALLY WRONG PLAN_ID:' as section;
SELECT 
    u.email,
    u.plan_id,
    sp.name as plan_name,
    CASE 
        WHEN sp.name IS NULL THEN '❌ INVALID PLAN_ID'
        ELSE '✅ VALID PLAN_ID'
    END as plan_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE sp.name IS NULL OR u.plan_id IS NULL;

-- 6. Summary
SELECT '6. SUMMARY:' as section;
SELECT 
    'Total users:' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with starter plan:' as metric,
    COUNT(*) as value
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE sp.name = 'starter-plan'
UNION ALL
SELECT 
    'Users with analytics access:' as metric,
    COUNT(*) as value
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE sp.features->>'analytics' = 'true'
UNION ALL
SELECT 
    'Users with AI chat access:' as metric,
    COUNT(*) as value
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE sp.features->>'ai_chat' = 'true';




