-- Assign trial subscriptions to existing users who don't have any subscription
-- This script ensures all existing users have a subscription record

-- 1. First, check how many users don't have subscriptions
SELECT 'Users without subscriptions:' as test;
SELECT 
  COUNT(*) as users_without_subscriptions
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- 2. Show which users don't have subscriptions
SELECT 'Users without subscriptions (details):' as test;
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

-- 3. Get the free trial plan ID
SELECT 'Free trial plan:' as test;
SELECT 
  id,
  name,
  display_name,
  price
FROM subscription_plans
WHERE name = 'free-trial'
LIMIT 1;

-- 4. Assign trial subscriptions to users who don't have any
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  created_at,
  updated_at,
  admin_notes
)
SELECT 
  u.id as user_id,
  sp.id as plan_id,
  'trial' as status,
  u.created_at as created_at,
  NOW() as updated_at,
  'Auto-assigned trial subscription for existing user' as admin_notes
FROM users u
CROSS JOIN subscription_plans sp
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE sp.name = 'free-trial'
  AND us.user_id IS NULL;

-- 5. Verify the assignments were made
SELECT 'Verification - Users with subscriptions after assignment:' as test;
SELECT 
  COUNT(*) as total_users_with_subscriptions
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.status = 'trial';

-- 6. Show sample of newly assigned subscriptions
SELECT 'Sample of newly assigned subscriptions:' as test;
SELECT 
  u.email,
  u.first_name,
  u.last_name,
  us.status,
  us.created_at,
  sp.display_name as plan_name,
  us.admin_notes
FROM users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.admin_notes = 'Auto-assigned trial subscription for existing user'
ORDER BY us.created_at DESC
LIMIT 5;

-- 7. Check final subscription distribution
SELECT 'Final subscription status distribution:' as test;
SELECT 
  us.status,
  COUNT(*) as count
FROM user_subscriptions us
GROUP BY us.status
ORDER BY us.status;

-- 8. Verify all users now have subscriptions
SELECT 'Final verification - Users without subscriptions:' as test;
SELECT 
  COUNT(*) as remaining_users_without_subscriptions
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL;
