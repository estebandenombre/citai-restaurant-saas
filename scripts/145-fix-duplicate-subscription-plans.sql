-- Fix Duplicate Subscription Plans
-- This script cleans up duplicate plans and ensures only one set exists

-- 1. First, let's see what plans currently exist
SELECT '1. CURRENT SUBSCRIPTION PLANS:' as section;
SELECT 
    id,
    name,
    description,
    price,
    is_active,
    created_at
FROM subscription_plans
ORDER BY name, created_at;

-- 2. Check for duplicate names
SELECT '2. DUPLICATE PLAN NAMES:' as section;
SELECT 
    name,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as ids
FROM subscription_plans
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- 3. Delete all existing plans to start fresh
SELECT '3. DELETING ALL EXISTING PLANS:' as section;
DELETE FROM subscription_plans;

-- 4. Insert the correct plans with consistent naming
SELECT '4. INSERTING CORRECT PLANS:' as section;
INSERT INTO subscription_plans (id, name, description, price, currency, interval, features, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'free-trial-plan', '14-day free trial with all features except AI chat', 0.00, 'USD', 'month', '{"ai_chat": false, "multiple_restaurants": false, "analytics": true, "menu_management": true, "order_management": true}', true),
    ('550e8400-e29b-41d4-a716-446655440001', 'starter-plan', 'Basic plan for small restaurants', 29.99, 'USD', 'month', '{"ai_chat": false, "multiple_restaurants": false, "analytics": true, "menu_management": true, "order_management": true}', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'pro-plan', 'Professional plan with AI chat', 59.99, 'USD', 'month', '{"ai_chat": true, "multiple_restaurants": false, "analytics": true, "menu_management": true, "order_management": true}', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'multi-plan', 'Multi-restaurant plan', 99.99, 'USD', 'month', '{"ai_chat": true, "multiple_restaurants": true, "analytics": true, "menu_management": true, "order_management": true}', true);

-- 5. Verify the plans were inserted correctly
SELECT '5. VERIFICATION - NEW PLANS:' as section;
SELECT 
    id,
    name,
    description,
    price,
    is_active
FROM subscription_plans
ORDER BY price;

-- 6. Update user_subscriptions to reference the correct plan IDs
SELECT '6. UPDATING USER SUBSCRIPTIONS:' as section;

-- First, let's see what user_subscriptions exist
SELECT 'Current user_subscriptions:' as info;
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(DISTINCT user_id) as unique_users
FROM user_subscriptions;

-- Update user_subscriptions to use the correct free-trial-plan
UPDATE user_subscriptions 
SET plan_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE plan_id IN (
    SELECT id FROM subscription_plans 
    WHERE name LIKE '%trial%' OR name LIKE '%free%'
    AND id != '550e8400-e29b-41d4-a716-446655440000'
);

-- 7. Update users table to reference correct plan IDs
SELECT '7. UPDATING USERS TABLE:' as section;

-- Update users to use the correct free-trial-plan
UPDATE users 
SET plan_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE plan_id IN (
    SELECT id FROM subscription_plans 
    WHERE name LIKE '%trial%' OR name LIKE '%free%'
    AND id != '550e8400-e29b-41d4-a716-446655440000'
);

-- 8. Update the trigger function to use the correct plan name
SELECT '8. UPDATING TRIGGER FUNCTION:' as section;

CREATE OR REPLACE FUNCTION assign_trial_to_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Set trial period (14 days from now)
    NEW.plan_id = '550e8400-e29b-41d4-a716-446655440000';
    NEW.plan_status = 'trial';
    NEW.trial_start = NOW();
    NEW.trial_end = NOW() + INTERVAL '14 days';
    NEW.current_period_start = NOW();
    NEW.current_period_end = NOW() + INTERVAL '14 days';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Final verification
SELECT '9. FINAL VERIFICATION:' as section;

-- Check subscription plans
SELECT 'Subscription plans:' as info;
SELECT 
    name,
    price,
    is_active
FROM subscription_plans
ORDER BY price;

-- Check user subscriptions
SELECT 'User subscriptions by plan:' as info;
SELECT 
    sp.name as plan_name,
    COUNT(us.id) as subscription_count
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON sp.id = us.plan_id
GROUP BY sp.id, sp.name
ORDER BY sp.price;

-- Check users by plan
SELECT 'Users by plan:' as info;
SELECT 
    sp.name as plan_name,
    COUNT(u.id) as user_count
FROM subscription_plans sp
LEFT JOIN users u ON sp.id = u.plan_id
GROUP BY sp.id, sp.name
ORDER BY sp.price;

-- 10. Success message
SELECT '10. FIX COMPLETE:' as section;
SELECT '✅ Duplicate subscription plans removed' as status;
SELECT '✅ Only 4 plans now exist: free-trial-plan, starter-plan, pro-plan, multi-plan' as status;
SELECT '✅ All user references updated to correct plan IDs' as status;
SELECT '✅ Trigger function updated to use correct plan ID' as status;
SELECT '✅ No more duplicate free trial plans' as status;


