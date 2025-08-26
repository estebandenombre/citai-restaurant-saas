-- Add plan_id column to users table for easier access
-- This will simplify the subscription system significantly

-- 1. Add plan_id column to users table
ALTER TABLE public.users 
ADD COLUMN plan_id uuid REFERENCES public.subscription_plans(id);

-- 2. Add plan_status column to track subscription status
ALTER TABLE public.users 
ADD COLUMN plan_status character varying DEFAULT 'no_subscription' 
CHECK (plan_status IN ('no_subscription', 'trial', 'active', 'cancelled', 'expired', 'past_due'));

-- 3. Add trial_end column for easy access
ALTER TABLE public.users 
ADD COLUMN trial_end timestamp with time zone;

-- 4. Add current_period_end column for easy access
ALTER TABLE public.users 
ADD COLUMN current_period_end timestamp with time zone;

-- 5. Migrate existing subscription data to users table
UPDATE public.users 
SET 
  plan_id = (
    SELECT us.plan_id 
    FROM user_subscriptions us 
    WHERE us.user_id = users.id 
    AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC 
    LIMIT 1
  ),
  plan_status = (
    SELECT us.status 
    FROM user_subscriptions us 
    WHERE us.user_id = users.id 
    AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC 
    LIMIT 1
  ),
  trial_end = (
    SELECT us.trial_end 
    FROM user_subscriptions us 
    WHERE us.user_id = users.id 
    AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC 
    LIMIT 1
  ),
  current_period_end = (
    SELECT us.current_period_end 
    FROM user_subscriptions us 
    WHERE us.user_id = users.id 
    AND us.status IN ('active', 'trial')
    ORDER BY us.created_at DESC 
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1 
  FROM user_subscriptions us 
  WHERE us.user_id = users.id 
  AND us.status IN ('active', 'trial')
);

-- 6. Set default plan for users without subscriptions (Free Trial)
UPDATE public.users 
SET 
  plan_id = (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan' LIMIT 1),
  plan_status = 'trial',
  trial_end = created_at + INTERVAL '14 days',
  current_period_end = created_at + INTERVAL '14 days'
WHERE plan_id IS NULL;

-- 7. Create a trigger to automatically update user plan when subscription changes
CREATE OR REPLACE FUNCTION update_user_plan_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's plan information when subscription is created/updated
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.users 
    SET 
      plan_id = NEW.plan_id,
      plan_status = NEW.status,
      trial_end = NEW.trial_end,
      current_period_end = NEW.current_period_end
    WHERE id = NEW.user_id;
  END IF;
  
  -- Clear user's plan information when subscription is cancelled
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' THEN
    UPDATE public.users 
    SET 
      plan_id = NULL,
      plan_status = 'cancelled',
      trial_end = NULL,
      current_period_end = NULL
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger on user_subscriptions table
DROP TRIGGER IF EXISTS trigger_update_user_plan ON user_subscriptions;
CREATE TRIGGER trigger_update_user_plan
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_plan_from_subscription();

-- 9. Verify the migration
SELECT 'Migration Results:' as info;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN plan_id IS NOT NULL THEN 1 END) as users_with_plans,
  COUNT(CASE WHEN plan_status = 'trial' THEN 1 END) as trial_users,
  COUNT(CASE WHEN plan_status = 'active' THEN 1 END) as active_users,
  COUNT(CASE WHEN plan_status = 'no_subscription' THEN 1 END) as no_subscription_users
FROM users;

-- 10. Show sample data
SELECT 'Sample user data with plans:' as info;
SELECT 
  u.email,
  u.plan_status,
  sp.display_name as plan_name,
  u.trial_end,
  u.current_period_end
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC
LIMIT 10;
