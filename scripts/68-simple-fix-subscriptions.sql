-- Simple fix for user subscriptions
-- Execute this script in Supabase SQL Editor

-- 1. Check current state
SELECT 'Current state:' as info;
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT us.user_id) as users_with_subscriptions,
  COUNT(*) - COUNT(DISTINCT us.user_id) as users_without_subscriptions
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id;

-- 2. Get the free trial plan ID
SELECT 'Free trial plan:' as info;
SELECT id, name, display_name FROM subscription_plans WHERE name = 'free-trial';

-- 3. Assign trial subscriptions to users who don't have any
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  trial_start,
  trial_end,
  created_at,
  updated_at,
  admin_notes
)
SELECT 
  u.id as user_id,
  sp.id as plan_id,
  'trial' as status,
  u.created_at as current_period_start,
  u.created_at + INTERVAL '14 days' as current_period_end,
  u.created_at as trial_start,
  u.created_at + INTERVAL '14 days' as trial_end,
  NOW() as created_at,
  NOW() as updated_at,
  'Auto-assigned trial subscription for existing user' as admin_notes
FROM users u
CROSS JOIN subscription_plans sp
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE sp.name = 'free-trial'
  AND us.user_id IS NULL;

-- 4. Verify the fix
SELECT 'After fix:' as info;
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT us.user_id) as users_with_subscriptions,
  COUNT(*) - COUNT(DISTINCT us.user_id) as users_without_subscriptions
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id;

-- 5. Show subscription distribution
SELECT 'Subscription distribution:' as info;
SELECT 
  us.status,
  COUNT(*) as count
FROM user_subscriptions us
GROUP BY us.status
ORDER BY us.status;

-- 6. Show sample users with their subscriptions
SELECT 'Sample users with subscriptions:' as info;
SELECT 
  u.email,
  u.first_name,
  u.last_name,
  us.status,
  sp.display_name as plan_name,
  us.trial_end,
  CASE 
    WHEN us.status = 'trial' AND us.trial_end > NOW() THEN 
      EXTRACT(DAY FROM (us.trial_end - NOW())) || ' days left'
    WHEN us.status = 'trial' AND us.trial_end <= NOW() THEN 'Expired'
    ELSE us.status
  END as trial_status
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY u.created_at DESC
LIMIT 10;
