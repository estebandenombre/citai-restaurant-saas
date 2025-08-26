-- Check and fix migration if needed
-- This script verifies if the new columns exist and creates them if they don't

-- 1. Check if columns exist
SELECT 'Checking if new columns exist:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('plan_id', 'plan_status', 'trial_end', 'current_period_end')
ORDER BY column_name;

-- 2. Add columns if they don't exist
DO $$
BEGIN
  -- Add plan_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN plan_id uuid REFERENCES public.subscription_plans(id);
    RAISE NOTICE 'Added plan_id column';
  ELSE
    RAISE NOTICE 'plan_id column already exists';
  END IF;

  -- Add plan_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'plan_status'
  ) THEN
    ALTER TABLE public.users ADD COLUMN plan_status character varying DEFAULT 'no_subscription' 
    CHECK (plan_status IN ('no_subscription', 'trial', 'active', 'cancelled', 'expired', 'past_due'));
    RAISE NOTICE 'Added plan_status column';
  ELSE
    RAISE NOTICE 'plan_status column already exists';
  END IF;

  -- Add trial_end column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE public.users ADD COLUMN trial_end timestamp with time zone;
    RAISE NOTICE 'Added trial_end column';
  ELSE
    RAISE NOTICE 'trial_end column already exists';
  END IF;

  -- Add current_period_end column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE public.users ADD COLUMN current_period_end timestamp with time zone;
    RAISE NOTICE 'Added current_period_end column';
  ELSE
    RAISE NOTICE 'current_period_end column already exists';
  END IF;
END $$;

-- 3. Verify columns now exist
SELECT 'Verifying columns after migration:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('plan_id', 'plan_status', 'trial_end', 'current_period_end')
ORDER BY column_name;

-- 4. Set default plan for users without subscriptions
UPDATE public.users 
SET 
  plan_id = (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan' LIMIT 1),
  plan_status = 'trial',
  trial_end = created_at + INTERVAL '14 days',
  current_period_end = created_at + INTERVAL '14 days'
WHERE plan_id IS NULL;

-- 5. Show current user status
SELECT 'Current user status after migration:' as info;
SELECT 
  u.email,
  u.plan_status,
  sp.display_name as plan_name,
  u.trial_end,
  CASE 
    WHEN u.plan_status = 'trial' AND u.trial_end > NOW() THEN 
      EXTRACT(DAY FROM (u.trial_end - NOW())) || ' days left'
    WHEN u.plan_status = 'trial' AND u.trial_end <= NOW() THEN 'EXPIRED'
    ELSE u.plan_status
  END as status_summary
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 6. Test the exact query that the service uses
SELECT 'Testing service query:' as info;
SELECT 
  u.id,
  u.plan_id,
  u.plan_status,
  u.trial_end,
  u.current_period_end,
  u.created_at
FROM users u
WHERE u.id = (SELECT id FROM users LIMIT 1);

-- 7. Show subscription distribution
SELECT 'Subscription status distribution:' as info;
SELECT 
  plan_status,
  COUNT(*) as count
FROM users
GROUP BY plan_status
ORDER BY count DESC;
