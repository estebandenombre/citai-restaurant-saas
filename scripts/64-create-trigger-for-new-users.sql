-- Create trigger to automatically assign trial subscriptions to new users
-- This ensures all new users get a trial subscription when they register

-- 1. First, check if the trigger function exists
SELECT 'Checking for existing trigger function:' as test;
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'assign_trial_subscription_to_new_user';

-- 2. Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION assign_trial_subscription_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
  trial_plan_id UUID;
BEGIN
  -- Get the free trial plan ID
  SELECT id INTO trial_plan_id
  FROM subscription_plans
  WHERE name = 'free-trial'
  LIMIT 1;
  
  -- If trial plan exists, create subscription
  IF trial_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      created_at,
      updated_at,
      admin_notes
    ) VALUES (
      NEW.id,
      trial_plan_id,
      'trial',
      NEW.created_at,
      NOW(),
      'Auto-assigned trial subscription for new user'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Check if the trigger exists
SELECT 'Checking for existing trigger:' as test;
SELECT 
  tgname,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger
WHERE tgname = 'auto_assign_trial_subscription';

-- 4. Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS auto_assign_trial_subscription ON users;

CREATE TRIGGER auto_assign_trial_subscription
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_trial_subscription_to_new_user();

-- 5. Verify the trigger was created
SELECT 'Verification - Trigger created:' as test;
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'auto_assign_trial_subscription';

-- 6. Test the trigger by checking if it works for recent users
SELECT 'Testing trigger with recent users:' as test;
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  us.id as subscription_id,
  us.status,
  us.created_at as subscription_created,
  sp.display_name as plan_name
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE u.created_at >= NOW() - INTERVAL '1 day'
ORDER BY u.created_at DESC
LIMIT 5;

-- 7. Show trigger function details
SELECT 'Trigger function details:' as test;
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'assign_trial_subscription_to_new_user';
