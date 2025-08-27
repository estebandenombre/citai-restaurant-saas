-- Update Subscription Plans - Free Trial with Full Access
-- This script updates the subscription plans with the new permission strategy:
-- - Free Trial: FULL ACCESS (to try everything)
-- - Starter: NO analytics, NO AI chat
-- - Pro/Multi: FULL ACCESS

-- 1. First, let's see the current plans and their features
SELECT '1. CURRENT SUBSCRIPTION PLANS:' as section;
SELECT 
    id,
    name,
    description,
    price,
    features
FROM subscription_plans
ORDER BY price;

-- 2. Update the plans with new permissions
SELECT '2. UPDATING PLANS WITH NEW PERMISSIONS:' as section;

-- Update Free Trial Plan (FULL ACCESS - to try everything)
UPDATE subscription_plans 
SET 
    features = '{"ai_chat": true, "multiple_restaurants": false, "analytics": true, "menu_management": true, "order_management": true, "export": true}',
    description = '14-day free trial with FULL ACCESS to all features'
WHERE name = 'free-trial-plan';

-- Update Starter Plan (NO analytics, NO AI chat)
UPDATE subscription_plans 
SET 
    features = '{"ai_chat": false, "multiple_restaurants": false, "analytics": false, "menu_management": true, "order_management": true, "export": true}',
    description = 'Basic plan for small restaurants (no analytics or AI chat)'
WHERE name = 'starter-plan';

-- Update Pro Plan (FULL ACCESS)
UPDATE subscription_plans 
SET 
    features = '{"ai_chat": true, "multiple_restaurants": false, "analytics": true, "menu_management": true, "order_management": true, "export": true}',
    description = 'Professional plan with FULL ACCESS to all features'
WHERE name = 'pro-plan';

-- Update Multi Plan (FULL ACCESS)
UPDATE subscription_plans 
SET 
    features = '{"ai_chat": true, "multiple_restaurants": true, "analytics": true, "menu_management": true, "order_management": true, "export": true}',
    description = 'Multi-restaurant plan with FULL ACCESS to all features'
WHERE name = 'multi-plan';

-- 3. Verify the updates
SELECT '3. VERIFICATION - UPDATED PLANS:' as section;
SELECT 
    id,
    name,
    description,
    price,
    features
FROM subscription_plans
ORDER BY price;

-- 4. Check current users and their plan access
SELECT '4. CURRENT USERS AND THEIR ACCESS:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
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

-- 5. Show summary of access by plan
SELECT '5. ACCESS SUMMARY BY PLAN:' as section;
SELECT 
    sp.name as plan_name,
    sp.price as plan_price,
    sp.features->>'analytics' as analytics_access,
    sp.features->>'ai_chat' as ai_chat_access,
    sp.features->>'menu_management' as menu_management,
    sp.features->>'order_management' as order_management,
    sp.features->>'export' as export_access,
    sp.features->>'multiple_restaurants' as multi_restaurant
FROM subscription_plans sp
ORDER BY sp.price;

-- 6. Count users by plan
SELECT '6. USER COUNT BY PLAN:' as section;
SELECT 
    sp.name as plan_name,
    COUNT(u.id) as user_count,
    sp.features->>'analytics' as has_analytics,
    sp.features->>'ai_chat' as has_ai_chat
FROM subscription_plans sp
LEFT JOIN users u ON sp.id = u.plan_id
GROUP BY sp.id, sp.name, sp.features
ORDER BY sp.price;

-- 7. Success message
SELECT '7. NEW PERMISSIONS STRATEGY:' as section;
SELECT '✅ Free Trial Plan: FULL ACCESS (to try everything)' as status;
SELECT '✅ Starter Plan: NO analytics, NO AI chat' as status;
SELECT '✅ Pro Plan: FULL ACCESS' as status;
SELECT '✅ Multi Plan: FULL ACCESS' as status;
SELECT '✅ Better onboarding experience for new users' as status;
SELECT '✅ Clear value proposition for paid plans' as status;



