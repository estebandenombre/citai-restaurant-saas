-- Test script for subscription management functionality

-- 1. Check subscription plans available
SELECT 'Available Subscription Plans:' as test;
SELECT 
  id,
  name,
  display_name,
  price,
  features
FROM subscription_plans
ORDER BY price;

-- 2. Check current user subscriptions
SELECT 'Current User Subscriptions:' as test;
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.created_at,
  us.updated_at,
  us.admin_notes,
  u.email,
  sp.display_name as plan_name,
  sp.price
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trial')
ORDER BY us.created_at DESC;

-- 3. Check subscription history for a specific user
SELECT 'Subscription History for First User:' as test;
WITH first_user AS (
  SELECT id, email FROM users ORDER BY created_at DESC LIMIT 1
)
SELECT 
  us.id,
  us.status,
  us.created_at,
  us.updated_at,
  us.admin_notes,
  sp.display_name as plan_name,
  sp.price
FROM user_subscriptions us
JOIN first_user fu ON us.user_id = fu.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

-- 4. Test subscription plan update simulation
SELECT 'Subscription Update Test (Simulation):' as test;
SELECT 
  'Current subscription would be cancelled and new one created' as action,
  u.email,
  sp_current.display_name as current_plan,
  sp_new.display_name as new_plan,
  'active' as new_status
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp_current ON us.plan_id = sp_current.id
CROSS JOIN subscription_plans sp_new
WHERE us.status IN ('active', 'trial')
AND sp_new.id != us.plan_id
ORDER BY u.created_at DESC
LIMIT 3;

-- 5. Check trial extension calculation
SELECT 'Trial Extension Calculation:' as test;
SELECT 
  u.email,
  us.created_at as trial_start,
  us.created_at + INTERVAL '14 days' as original_trial_end,
  us.created_at + INTERVAL '21 days' as extended_7_days,
  us.created_at + INTERVAL '28 days' as extended_14_days,
  us.created_at + INTERVAL '44 days' as extended_30_days
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.status = 'trial'
ORDER BY us.created_at DESC
LIMIT 3;

-- 6. Check for users without subscriptions
SELECT 'Users Without Active Subscriptions:' as test;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status IN ('active', 'trial')
WHERE us.user_id IS NULL
ORDER BY u.created_at DESC;

-- 7. Check subscription statistics
SELECT 'Subscription Statistics:' as test;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN us.status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN us.status = 'trial' THEN 1 END) as trial_subscriptions,
  COUNT(CASE WHEN us.status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
  COUNT(CASE WHEN us.status = 'expired' THEN 1 END) as expired_subscriptions
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id;

-- 8. Check admin notes usage
SELECT 'Admin Notes Usage:' as test;
SELECT 
  COUNT(*) as total_subscriptions_with_notes,
  COUNT(CASE WHEN admin_notes IS NOT NULL AND admin_notes != '' THEN 1 END) as with_notes,
  COUNT(CASE WHEN admin_notes IS NULL OR admin_notes = '' THEN 1 END) as without_notes
FROM user_subscriptions;

-- 9. Test plan upgrade path
SELECT 'Plan Upgrade Paths:' as test;
SELECT 
  sp1.display_name as from_plan,
  sp1.price as from_price,
  sp2.display_name as to_plan,
  sp2.price as to_price,
  (sp2.price - sp1.price) as price_difference
FROM subscription_plans sp1
CROSS JOIN subscription_plans sp2
WHERE sp1.price < sp2.price
ORDER BY sp1.price, sp2.price;

-- 10. Check subscription plan features
SELECT 'Subscription Plan Features:' as test;
SELECT 
  name,
  display_name,
  price,
  features
FROM subscription_plans
ORDER BY price;
