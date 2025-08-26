-- Check user_subscriptions table and data
-- This script verifies the table structure and data

-- 1. Check if user_subscriptions table exists
SELECT 'Checking if user_subscriptions table exists:' as info;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'user_subscriptions';

-- 2. Check table structure
SELECT 'Checking user_subscriptions table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- 3. Check if table has data
SELECT 'Checking user_subscriptions data count:' as info;
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_subscriptions,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions
FROM user_subscriptions;

-- 4. Show sample subscription data
SELECT 'Sample subscription data:' as info;
SELECT 
  us.id,
  us.user_id,
  us.plan_id,
  us.status,
  us.created_at,
  us.updated_at,
  sp.display_name as plan_name,
  u.email as user_email
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN users u ON us.user_id = u.id
ORDER BY us.created_at DESC
LIMIT 10;

-- 5. Check for users without subscriptions
SELECT 'Users without subscriptions:' as info;
SELECT 
  COUNT(*) as users_without_subscriptions
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us 
  WHERE us.user_id = u.id 
  AND us.status IN ('active', 'trial')
);

-- 6. Show users without subscriptions
SELECT 'Sample users without subscriptions:' as info;
SELECT 
  u.id,
  u.email,
  u.created_at
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us 
  WHERE us.user_id = u.id 
  AND us.status IN ('active', 'trial')
)
ORDER BY u.created_at DESC
LIMIT 5;

-- 7. Test RLS policies
SELECT 'Testing RLS policies:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_subscriptions';

-- 8. Check for orphaned subscriptions
SELECT 'Orphaned subscriptions (no user):' as info;
SELECT 
  COUNT(*) as orphaned_count
FROM user_subscriptions us
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = us.user_id
);

-- 9. Check for orphaned plan references
SELECT 'Orphaned plan references:' as info;
SELECT 
  COUNT(*) as orphaned_plans
FROM user_subscriptions us
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans sp WHERE sp.id = us.plan_id
);

-- 10. Test the exact query that the service uses
SELECT 'Testing service query:' as info;
SELECT 
  us.id,
  us.user_id,
  us.plan_id,
  us.status,
  us.created_at,
  us.updated_at
FROM user_subscriptions us
WHERE us.user_id = (SELECT id FROM users LIMIT 1)
ORDER BY us.created_at DESC;
