-- Fix Starter Plan Permissions
-- This script ensures that the starter plan does NOT have access to analytics and AI chat

-- 1. Check current permissions
SELECT '1. CURRENT PERMISSIONS:' as section;
SELECT 
    name as plan_name,
    price as plan_price,
    features->>'analytics' as analytics_access,
    features->>'ai_chat' as ai_chat_access,
    features->>'menu_management' as menu_management,
    features->>'order_management' as order_management,
    features->>'export' as export_access
FROM subscription_plans
ORDER BY price;

-- 2. Fix Starter Plan permissions (should NOT have analytics or AI chat)
SELECT '2. FIXING STARTER PLAN PERMISSIONS:' as section;

UPDATE subscription_plans 
SET 
    features = '{"ai_chat": false, "multiple_restaurants": false, "analytics": false, "menu_management": true, "order_management": true, "export": true}',
    description = 'Basic plan for small restaurants (no analytics or AI chat)'
WHERE name = 'starter-plan';

-- 3. Verify the fix
SELECT '3. VERIFICATION - UPDATED PERMISSIONS:' as section;
SELECT 
    name as plan_name,
    price as plan_price,
    features->>'analytics' as analytics_access,
    features->>'ai_chat' as ai_chat_access,
    CASE 
        WHEN features->>'analytics' = 'true' AND features->>'ai_chat' = 'true' THEN '✅ FULL ACCESS'
        WHEN features->>'analytics' = 'false' AND features->>'ai_chat' = 'false' THEN '❌ LIMITED ACCESS'
        ELSE '⚠️ MIXED ACCESS'
    END as access_level
FROM subscription_plans
ORDER BY price;

-- 4. Check users with starter plan
SELECT '4. USERS WITH STARTER PLAN:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_status,
    sp.name as plan_name,
    sp.features->>'analytics' as has_analytics,
    sp.features->>'ai_chat' as has_ai_chat,
    CASE 
        WHEN sp.features->>'analytics' = 'true' THEN '❌ SHOULD NOT HAVE'
        ELSE '✅ CORRECT - NO ACCESS'
    END as analytics_status,
    CASE 
        WHEN sp.features->>'ai_chat' = 'true' THEN '❌ SHOULD NOT HAVE'
        ELSE '✅ CORRECT - NO ACCESS'
    END as ai_chat_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
WHERE sp.name = 'starter-plan'
ORDER BY u.created_at DESC;

-- 5. Success message
SELECT '5. FIX COMPLETE:' as section;
SELECT '✅ Starter plan now has NO analytics access' as status;
SELECT '✅ Starter plan now has NO AI chat access' as status;
SELECT '✅ Starter plan has basic features only' as status;
SELECT '✅ Clear upgrade path to Pro for advanced features' as status;



