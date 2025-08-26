-- Create a test subscription for an existing user
-- This script helps verify that the subscription system is working correctly

-- First, let's see what users exist
SELECT 
  'EXISTING USERS' as info_type,
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if subscription plans exist
SELECT 
  'SUBSCRIPTION PLANS' as info_type,
  id,
  name,
  display_name,
  price,
  is_active
FROM subscription_plans;

-- Create a test subscription for the most recent user
-- Replace 'USER_EMAIL_HERE' with an actual user email from your database
DO $$
DECLARE
  test_user_id UUID;
  free_trial_plan_id UUID := '550e8400-e29b-41d4-a716-446655440010';
BEGIN
  -- Get the most recent user (you can modify this to target a specific user)
  SELECT id INTO test_user_id 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Check if user already has a subscription
  IF NOT EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_id = test_user_id 
    AND status IN ('active', 'trial')
  ) THEN
    -- Create subscription
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      trial_start,
      trial_end
    ) VALUES (
      test_user_id,
      free_trial_plan_id,
      'trial',
      NOW(),
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW() + INTERVAL '14 days'
    );
    
    RAISE NOTICE 'Created trial subscription for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'User % already has an active subscription', test_user_id;
  END IF;
END $$;

-- Verify the subscription was created
SELECT 
  'VERIFICATION' as info_type,
  us.id as subscription_id,
  us.user_id,
  au.email as user_email,
  us.plan_id,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.trial_start,
  us.trial_end,
  us.created_at
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 5;

-- Test the subscription service query
-- This simulates what the application would do
SELECT 
  'SUBSCRIPTION SERVICE TEST' as test_type,
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.features,
  CASE 
    WHEN us.status IN ('active', 'trial') 
    AND NOW() <= us.current_period_end 
    THEN 'VALID'
    ELSE 'INVALID'
  END as subscription_validity
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trial')
ORDER BY us.created_at DESC
LIMIT 3;
