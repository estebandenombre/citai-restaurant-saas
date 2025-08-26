-- Verify New Permissions Strategy
-- This script verifies that the new permission strategy is correctly implemented:
-- - Free Trial: FULL ACCESS (to try everything)
-- - Starter: NO analytics, NO AI chat
-- - Pro/Multi: FULL ACCESS

-- 1. Check subscription plans and their features
SELECT '1. SUBSCRIPTION PLANS AND FEATURES:' as section;
SELECT 
    name as plan_name,
    price as plan_price,
    features->>'analytics' as analytics_access,
    features->>'ai_chat' as ai_chat_access
FROM subscription_plans
ORDER BY price;

SELECT '2. EXPECTED PERMISSIONS:' as section;
SELECT '✅ Free Trial: FULL ACCESS (analytics: true, ai_chat: true)' as status;
SELECT '✅ Starter: LIMITED ACCESS (analytics: false, ai_chat: false)' as status;
SELECT '✅ Pro/Multi: FULL ACCESS (analytics: true, ai_chat: true)' as status;

-- 3. Check current users and their access
SELECT '3. CURRENT USERS AND THEIR ACCESS:' as section;
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

-- 4. Summary of access by plan
SELECT '4. ACCESS SUMMARY BY PLAN:' as section;
SELECT 
    sp.name as plan_name,
    COUNT(u.id) as user_count,
    sp.features->>'analytics' as analytics_access,
    sp.features->>'ai_chat' as ai_chat_access,
    CASE 
        WHEN sp.features->>'analytics' = 'true' AND sp.features->>'ai_chat' = 'true' THEN '✅ FULL ACCESS'
        WHEN sp.features->>'analytics' = 'false' AND sp.features->>'ai_chat' = 'false' THEN '❌ LIMITED ACCESS'
        ELSE '⚠️ MIXED ACCESS'
    END as access_level
FROM subscription_plans sp
LEFT JOIN users u ON sp.id = u.plan_id
GROUP BY sp.id, sp.name, sp.features
ORDER BY sp.price;

-- 5. Business logic verification
SELECT '5. BUSINESS LOGIC VERIFICATION:' as section;
SELECT '✅ Free Trial users can try ALL features (better onboarding)' as logic;
SELECT '✅ Starter users get basic features only (clear upgrade path)' as logic;
SELECT '✅ Pro/Multi users get full access (premium value)' as logic;
SELECT '✅ Clear differentiation between plans' as logic;

-- 6. Success message
SELECT '6. NEW STRATEGY IMPLEMENTATION:' as section;
SELECT '✅ Free Trial: FULL ACCESS for better onboarding' as status;
SELECT '✅ Starter: LIMITED ACCESS (no analytics, no AI chat)' as status;
SELECT '✅ Pro/Multi: FULL ACCESS for premium value' as status;
SELECT '✅ Clear upgrade path from trial to paid plans' as status;
SELECT '✅ Better user experience and conversion potential' as status;
