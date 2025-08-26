-- Complete fix for subscription history functionality
-- This script adds missing columns and fixes RLS policies

-- 1. First, check current table structure
SELECT 'Current user_subscriptions structure:' as test;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add admin_notes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'admin_notes'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN admin_notes TEXT;
    RAISE NOTICE 'Added admin_notes column to user_subscriptions';
  ELSE
    RAISE NOTICE 'admin_notes column already exists';
  END IF;
END $$;

-- 3. Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'updated_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to user_subscriptions';
  ELSE
    RAISE NOTICE 'updated_at column already exists';
  END IF;
END $$;

-- 4. Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_user_subscriptions_updated_at
      BEFORE UPDATE ON user_subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created updated_at trigger for user_subscriptions';
  ELSE
    RAISE NOTICE 'updated_at trigger already exists';
  END IF;
END $$;

-- 5. Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admin can update all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admin can insert subscriptions" ON user_subscriptions;

-- 6. Create new policies that allow admin access
-- Policy for users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for users to insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Policy for admin to view all subscriptions (for admin dashboard)
CREATE POLICY "Admin can view all subscriptions" ON user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = true
    )
  );

-- Policy for admin to update all subscriptions
CREATE POLICY "Admin can update all subscriptions" ON user_subscriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = true
    )
  );

-- Policy for admin to insert subscriptions
CREATE POLICY "Admin can insert subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email'
      AND is_active = true
    )
  );

-- 7. Verify the new structure
SELECT 'Updated user_subscriptions structure:' as test;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Verify the new policies
SELECT 'New RLS Policies for user_subscriptions:' as test;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_subscriptions'
ORDER BY policyname;

-- 9. Test subscription history query
SELECT 'Testing subscription history query:' as test;
WITH test_user AS (
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
JOIN test_user tu ON us.user_id = tu.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

-- 10. Check if admin user exists and is active
SELECT 'Admin user status:' as test;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM admin_users
WHERE email = 'admin@tably.com';
