-- Fix foreign key constraint for user_subscriptions
-- This script changes the foreign key from auth.users to public.users

-- First, let's check the current foreign key constraints
SELECT 
  'CURRENT FOREIGN KEYS' as info_type,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_subscriptions';

-- Drop the existing foreign key constraint
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;

-- Add the correct foreign key constraint pointing to public.users
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Verify the new foreign key constraint
SELECT 
  'NEW FOREIGN KEYS' as info_type,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'user_subscriptions';

-- Check if there are any existing user_subscriptions that violate the new constraint
SELECT 
  'VIOLATING SUBSCRIPTIONS' as info_type,
  COUNT(*) as count
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- Show any violating subscriptions
SELECT 
  'VIOLATING SUBSCRIPTIONS DETAILS' as info_type,
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
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- If there are violating subscriptions, we need to fix them
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

-- Final verification
SELECT 
  'FINAL VERIFICATION' as info_type,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN us.user_id IN (SELECT id FROM users) THEN 1 END) as valid_public_users_references,
  COUNT(CASE WHEN us.user_id NOT IN (SELECT id FROM users) THEN 1 END) as invalid_references
FROM user_subscriptions us;

-- Show final state of subscriptions
SELECT 
  'FINAL SUBSCRIPTIONS STATE' as info_type,
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
