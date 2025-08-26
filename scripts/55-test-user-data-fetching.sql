-- Test script to verify user data fetching works correctly

-- 1. Check users table structure
SELECT 'Users Table Structure:' as test;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check sample users with their data
SELECT 'Sample Users:' as test;
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.has_completed_onboarding,
  u.created_at,
  u.restaurant_id,
  r.name as restaurant_name
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 3. Check user subscriptions
SELECT 'User Subscriptions:' as test;
SELECT 
  us.user_id,
  us.status,
  us.created_at,
  sp.name as plan_name,
  sp.display_name as plan_display_name
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 5;

-- 4. Check orders data
SELECT 'Orders Data:' as test;
SELECT 
  o.id,
  o.restaurant_id,
  o.total_amount,
  o.created_at,
  r.name as restaurant_name
FROM orders o
LEFT JOIN restaurants r ON o.restaurant_id = r.id
ORDER BY o.created_at DESC
LIMIT 5;

-- 5. Test the complete user data query (simulating what the service does)
SELECT 'Complete User Data Test:' as test;
WITH user_data AS (
  SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.has_completed_onboarding,
    u.created_at,
    u.restaurant_id,
    r.name as restaurant_name
  FROM users u
  LEFT JOIN restaurants r ON u.restaurant_id = r.id
),
subscription_data AS (
  SELECT 
    us.user_id,
    us.status,
    us.created_at as subscription_created,
    sp.display_name as plan_display_name,
    sp.name as plan_name,
    ROW_NUMBER() OVER (PARTITION BY us.user_id ORDER BY us.created_at DESC) as rn
  FROM user_subscriptions us
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.status IN ('active', 'trial')
),
order_stats AS (
  SELECT 
    o.restaurant_id,
    COUNT(*) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    MAX(o.created_at) as last_order_date
  FROM orders o
  GROUP BY o.restaurant_id
)
SELECT 
  ud.id,
  ud.email,
  ud.first_name,
  ud.last_name,
  ud.restaurant_name,
  ud.has_completed_onboarding,
  ud.created_at,
  sd.status as subscription_status,
  COALESCE(sd.plan_display_name, sd.plan_name) as plan_name,
  os.total_orders,
  os.total_revenue,
  os.last_order_date
FROM user_data ud
LEFT JOIN subscription_data sd ON ud.id = sd.user_id AND sd.rn = 1
LEFT JOIN order_stats os ON ud.restaurant_id = os.restaurant_id
ORDER BY ud.created_at DESC
LIMIT 5;

-- 6. Check for any data inconsistencies
SELECT 'Data Consistency Check:' as test;
SELECT 
  'Users without restaurant_id' as issue,
  COUNT(*) as count
FROM users 
WHERE restaurant_id IS NULL

UNION ALL

SELECT 
  'Users without subscriptions' as issue,
  COUNT(*) as count
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL

UNION ALL

SELECT 
  'Restaurants without orders' as issue,
  COUNT(*) as count
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
WHERE o.restaurant_id IS NULL;

-- 7. Test trial days calculation
SELECT 'Trial Days Calculation Test:' as test;
SELECT 
  u.email,
  us.created_at as trial_start,
  us.created_at + INTERVAL '14 days' as trial_end,
  CASE 
    WHEN us.status = 'trial' THEN
      GREATEST(0, 14 - EXTRACT(DAY FROM NOW() - us.created_at))
    ELSE 0
  END as trial_days_remaining
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.status = 'trial'
ORDER BY us.created_at DESC
LIMIT 3;
