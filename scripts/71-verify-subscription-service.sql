-- Verify subscription service functionality
-- This script checks if the subscription system is working correctly

-- 1. Check if users have proper subscription records
SELECT 'Users and their subscription status:' as info;
SELECT 
  u.email,
  u.id as user_id,
  CASE 
    WHEN us.id IS NULL THEN 'NO_SUBSCRIPTION'
    ELSE us.status
  END as subscription_status,
  sp.display_name as plan_name,
  us.created_at as subscription_created,
  us.trial_end,
  us.current_period_end
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 2. Check for users without subscriptions
SELECT 'Users without any subscription records:' as info;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL
ORDER BY u.created_at DESC;

-- 3. Check subscription plans availability
SELECT 'Available subscription plans:' as info;
SELECT 
  id,
  name,
  display_name,
  price,
  billing_cycle,
  trial_days,
  is_active
FROM subscription_plans
ORDER BY price;

-- 4. Check for orphaned subscriptions (without valid users)
SELECT 'Orphaned subscriptions (no matching user):' as info;
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.created_at
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- 5. Check for subscriptions with invalid plan references
SELECT 'Subscriptions with invalid plan references:' as info;
SELECT 
  us.id,
  us.user_id,
  us.plan_id,
  us.status
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- 6. Check trial expiration status
SELECT 'Trial subscriptions and their status:' as info;
SELECT 
  u.email,
  us.status,
  us.trial_start,
  us.trial_end,
  us.current_period_end,
  CASE 
    WHEN us.trial_end > NOW() THEN 
      EXTRACT(DAY FROM (us.trial_end - NOW())) || ' days left'
    WHEN us.trial_end <= NOW() THEN 'EXPIRED'
    ELSE 'UNKNOWN'
  END as trial_status
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.status = 'trial'
ORDER BY us.trial_end DESC;

-- 7. Check active subscriptions
SELECT 'Active subscriptions:' as info;
SELECT 
  u.email,
  sp.display_name as plan_name,
  us.current_period_start,
  us.current_period_end,
  CASE 
    WHEN us.current_period_end > NOW() THEN 
      EXTRACT(DAY FROM (us.current_period_end - NOW())) || ' days left'
    ELSE 'EXPIRED'
  END as period_status
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
ORDER BY us.current_period_end DESC;

-- 8. Check subscription history per user
SELECT 'Subscription history per user:' as info;
SELECT 
  u.email,
  COUNT(us.id) as total_subscriptions,
  COUNT(CASE WHEN us.status = 'trial' THEN 1 END) as trial_count,
  COUNT(CASE WHEN us.status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN us.status = 'cancelled' THEN 1 END) as cancelled_count
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
GROUP BY u.id, u.email
ORDER BY total_subscriptions DESC;

-- 9. Check for multiple active subscriptions per user (should not happen)
SELECT 'Users with multiple active subscriptions:' as info;
SELECT 
  u.email,
  COUNT(us.id) as active_subscriptions
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.status IN ('active', 'trial')
GROUP BY u.id, u.email
HAVING COUNT(us.id) > 1;

-- 10. Test the exact query that the service uses
SELECT 'Testing service query (active/trial subscriptions):' as info;
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.created_at,
  sp.display_name as plan_name
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trial')
ORDER BY us.created_at DESC
LIMIT 5;
