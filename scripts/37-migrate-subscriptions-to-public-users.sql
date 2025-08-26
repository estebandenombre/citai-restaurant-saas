-- Migrate existing subscriptions from auth.users to public.users
-- This script fixes subscriptions that reference auth.users instead of public.users

-- First, let's see what we're working with
SELECT 
  'CURRENT STATE' as info_type,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN us.user_id IN (SELECT id FROM users) THEN 1 END) as valid_public_users_references,
  COUNT(CASE WHEN us.user_id IN (SELECT id FROM auth.users) THEN 1 END) as auth_users_references,
  COUNT(CASE WHEN us.user_id NOT IN (SELECT id FROM users) AND us.user_id NOT IN (SELECT id FROM auth.users) THEN 1 END) as orphaned_references
FROM user_subscriptions us;

-- Show subscriptions that reference auth.users
SELECT 
  'AUTH USERS SUBSCRIPTIONS' as info_type,
  us.id as subscription_id,
  us.user_id,
  au.email as auth_user_email,
  sp.name as plan_name,
  us.status,
  us.created_at
FROM user_subscriptions us
JOIN auth.users au ON us.user_id = au.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id NOT IN (SELECT id FROM users);

-- Show subscriptions that reference public.users
SELECT 
  'PUBLIC USERS SUBSCRIPTIONS' as info_type,
  us.id as subscription_id,
  us.user_id,
  u.email as public_user_email,
  sp.name as plan_name,
  us.status,
  us.created_at
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id;

-- Migrate subscriptions from auth.users to public.users
-- This will update user_id to reference public.users instead of auth.users
UPDATE user_subscriptions 
SET user_id = (
  SELECT u.id 
  FROM users u 
  JOIN auth.users au ON u.email = au.email 
  WHERE au.id = user_subscriptions.user_id
)
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.id NOT IN (SELECT id FROM users)
  AND EXISTS (
    SELECT 1 FROM users u WHERE u.email = au.email
  )
);

-- Show the results after migration
SELECT 
  'AFTER MIGRATION' as info_type,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN us.user_id IN (SELECT id FROM users) THEN 1 END) as valid_public_users_references,
  COUNT(CASE WHEN us.user_id IN (SELECT id FROM auth.users) THEN 1 END) as auth_users_references,
  COUNT(CASE WHEN us.user_id NOT IN (SELECT id FROM users) AND us.user_id NOT IN (SELECT id FROM auth.users) THEN 1 END) as orphaned_references
FROM user_subscriptions us;

-- Show any remaining orphaned subscriptions
SELECT 
  'REMAINING ORPHANED' as info_type,
  us.id as subscription_id,
  us.user_id,
  us.plan_id,
  us.status,
  us.created_at,
  CASE 
    WHEN us.user_id IN (SELECT id FROM auth.users) THEN 'REFERENCES AUTH.USERS'
    ELSE 'UNKNOWN REFERENCE'
  END as issue_type
FROM user_subscriptions us
WHERE us.user_id NOT IN (SELECT id FROM users);

-- Create missing subscriptions for users who don't have one
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  trial_start,
  trial_end
)
SELECT 
  u.id as user_id,
  '550e8400-e29b-41d4-a716-446655440010' as plan_id, -- Free Trial plan
  'trial' as status,
  NOW() as current_period_start,
  NOW() + INTERVAL '14 days' as current_period_end,
  NOW() as trial_start,
  NOW() + INTERVAL '14 days' as trial_end
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us WHERE us.user_id = u.id
)
AND u.created_at >= NOW() - INTERVAL '30 days'; -- Only for recent users

-- Final verification
SELECT 
  'FINAL VERIFICATION' as info_type,
  u.email,
  u.first_name,
  u.last_name,
  us.id as subscription_id,
  sp.name as plan_name,
  us.status,
  us.created_at as subscription_created_at
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY u.created_at DESC
LIMIT 10;
