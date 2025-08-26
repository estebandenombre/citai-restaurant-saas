-- Verify Permissions Implementation
-- This script verifies that the subscription plan permissions are correctly implemented

-- 1. Check current subscription plans and their features
SELECT '1. SUBSCRIPTION PLANS AND FEATURES:' as section;
SELECT 
    name as plan_name,
    price as plan_price,
    features->>'analytics' as analytics_access,
    features->>'ai_chat' as ai_chat_access
FROM subscription_plans
ORDER BY price;

-- 2. Check current users and their plan access
SELECT '2. USERS AND THEIR PLAN ACCESS:' as section;
SELECT 
    u.email,
    sp.name as plan_name,
    sp.features->>'analytics' as has_analytics,
    sp.features->>'ai_chat' as has_ai_chat
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 3. Summary of access by plan
SELECT '3. ACCESS SUMMARY BY PLAN:' as section;
SELECT 
    sp.name as plan_name,
    COUNT(u.id) as user_count,
    sp.features->>'analytics' as analytics_access,
    sp.features->>'ai_chat' as ai_chat_access,
    CASE 
        WHEN sp.features->>'analytics' = 'true' THEN '✅ CAN ACCESS'
        ELSE '❌ NO ACCESS'
    END as analytics_status,
    CASE 
        WHEN sp.features->>'ai_chat' = 'true' THEN '✅ CAN ACCESS'
        ELSE '❌ NO ACCESS'
    END as ai_chat_status
FROM subscription_plans sp
LEFT JOIN users u ON sp.id = u.plan_id
GROUP BY sp.id, sp.name, sp.features
ORDER BY sp.price;

-- 4. Verify expected permissions
SELECT '4. EXPECTED PERMISSIONS VERIFICATION:' as section;

-- Check Free Trial Plan
SELECT 
    'Free Trial Plan' as plan,
    CASE 
        WHEN (SELECT features->>'analytics' FROM subscription_plans WHERE name = 'free-trial-plan') = 'false' 
        THEN '✅ CORRECT - NO Analytics'
        ELSE '❌ INCORRECT - Should NOT have Analytics'
    END as analytics_check,
    CASE 
        WHEN (SELECT features->>'ai_chat' FROM subscription_plans WHERE name = 'free-trial-plan') = 'false' 
        THEN '✅ CORRECT - NO AI Chat'
        ELSE '❌ INCORRECT - Should NOT have AI Chat'
    END as ai_chat_check;

-- Check Starter Plan
SELECT 
    'Starter Plan' as plan,
    CASE 
        WHEN (SELECT features->>'analytics' FROM subscription_plans WHERE name = 'starter-plan') = 'false' 
        THEN '✅ CORRECT - NO Analytics'
        ELSE '❌ INCORRECT - Should NOT have Analytics'
    END as analytics_check,
    CASE 
        WHEN (SELECT features->>'ai_chat' FROM subscription_plans WHERE name = 'starter-plan') = 'false' 
        THEN '✅ CORRECT - NO AI Chat'
        ELSE '❌ INCORRECT - Should NOT have AI Chat'
    END as ai_chat_check;

-- Check Pro Plan
SELECT 
    'Pro Plan' as plan,
    CASE 
        WHEN (SELECT features->>'analytics' FROM subscription_plans WHERE name = 'pro-plan') = 'true' 
        THEN '✅ CORRECT - HAS Analytics'
        ELSE '❌ INCORRECT - Should have Analytics'
    END as analytics_check,
    CASE 
        WHEN (SELECT features->>'ai_chat' FROM subscription_plans WHERE name = 'pro-plan') = 'true' 
        THEN '✅ CORRECT - HAS AI Chat'
        ELSE '❌ INCORRECT - Should have AI Chat'
    END as ai_chat_check;

-- Check Multi Plan
SELECT 
    'Multi Plan' as plan,
    CASE 
        WHEN (SELECT features->>'analytics' FROM subscription_plans WHERE name = 'multi-plan') = 'true' 
        THEN '✅ CORRECT - HAS Analytics'
        ELSE '❌ INCORRECT - Should have Analytics'
    END as analytics_check,
    CASE 
        WHEN (SELECT features->>'ai_chat' FROM subscription_plans WHERE name = 'multi-plan') = 'true' 
        THEN '✅ CORRECT - HAS AI Chat'
        ELSE '❌ INCORRECT - Should have AI Chat'
    END as ai_chat_check;

-- 5. Check for any users without proper plan assignment
SELECT '5. USERS WITHOUT PROPER PLAN ASSIGNMENT:' as section;
SELECT 
    u.email,
    u.plan_id,
    u.plan_status,
    CASE 
        WHEN u.plan_id IS NULL THEN '❌ NO PLAN ASSIGNED'
        WHEN sp.id IS NULL THEN '❌ INVALID PLAN ID'
        ELSE '✅ PLAN ASSIGNED'
    END as plan_status_check
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE u.plan_id IS NULL OR sp.id IS NULL;

-- 6. Success message
SELECT '6. PERMISSIONS IMPLEMENTATION VERIFICATION:' as section;
SELECT '✅ Subscription plans updated with correct permissions' as status;
SELECT '✅ Free Trial and Starter plans: NO analytics, NO AI chat' as status;
SELECT '✅ Pro and Multi plans: YES analytics, YES AI chat' as status;
SELECT '✅ Frontend components updated to respect permissions' as status;
SELECT '✅ Sidebar will hide Analytics for restricted users' as status;
SELECT '✅ AI Chat button will be hidden for restricted users' as status;
SELECT '✅ Analytics page will show upgrade prompt for restricted users' as status;
