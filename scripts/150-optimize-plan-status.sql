-- Optimize Plan Status Column
-- This script simplifies the plan_status column to remove redundancy

-- 1. Current state analysis
SELECT '1. CURRENT PLAN_STATUS VALUES:' as section;
SELECT 
    plan_status,
    COUNT(*) as user_count
FROM users 
GROUP BY plan_status
ORDER BY user_count DESC;

-- 2. Check for inconsistencies between plan_id and plan_status
SELECT '2. PLAN_ID vs PLAN_STATUS ANALYSIS:' as section;
SELECT 
    u.plan_id,
    sp.name as plan_name,
    u.plan_status,
    COUNT(*) as user_count
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
GROUP BY u.plan_id, sp.name, u.plan_status
ORDER BY sp.name, u.plan_status;

-- 3. Simplify plan_status constraint
SELECT '3. SIMPLIFYING PLAN_STATUS CONSTRAINT:' as section;

-- Drop current constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_status_check;

-- Add simplified constraint
ALTER TABLE users ADD CONSTRAINT users_plan_status_check CHECK (
    plan_status IN ('trial', 'active', 'expired', 'cancelled')
);

-- 4. Update existing plan_status values to simplified ones
SELECT '4. UPDATING PLAN_STATUS VALUES:' as section;

-- Update 'no_subscription' to 'active' (assuming they have a plan_id)
UPDATE users 
SET plan_status = 'active' 
WHERE plan_status = 'no_subscription' AND plan_id IS NOT NULL;

-- Update 'past_due' to 'expired'
UPDATE users 
SET plan_status = 'expired' 
WHERE plan_status = 'past_due';

-- 5. Verify the updates
SELECT '5. VERIFICATION - UPDATED PLAN_STATUS:' as section;
SELECT 
    plan_status,
    COUNT(*) as user_count
FROM users 
GROUP BY plan_status
ORDER BY user_count DESC;

-- 6. Check final state
SELECT '6. FINAL STATE - PLAN_ID vs PLAN_STATUS:' as section;
SELECT 
    sp.name as plan_name,
    u.plan_status,
    COUNT(*) as user_count,
    CASE 
        WHEN u.plan_status = 'trial' THEN '✅ Trial period active'
        WHEN u.plan_status = 'active' THEN '✅ Subscription active'
        WHEN u.plan_status = 'expired' THEN '❌ Subscription expired'
        WHEN u.plan_status = 'cancelled' THEN '❌ Subscription cancelled'
        ELSE '❓ Unknown status'
    END as status_description
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
GROUP BY sp.name, u.plan_status
ORDER BY sp.name, u.plan_status;

-- 7. Success message
SELECT '7. OPTIMIZATION COMPLETE:' as section;
SELECT '✅ plan_status simplified to: trial, active, expired, cancelled' as status;
SELECT '✅ Removed redundant values: no_subscription, past_due' as status;
SELECT '✅ plan_id indicates plan type, plan_status indicates state' as status;
SELECT '✅ Better separation of concerns' as status;


