-- Remove Stripe support and cleanup database
-- This script removes Stripe-related tables and columns

-- 1. Drop Stripe-related tables if they exist
DROP TABLE IF EXISTS stripe_events CASCADE;
DROP TABLE IF EXISTS stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_invoices CASCADE;

-- 2. Remove Stripe columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_subscription_id;

-- 3. Remove Stripe columns from subscription_plans table
ALTER TABLE subscription_plans 
DROP COLUMN IF EXISTS stripe_price_id,
DROP COLUMN IF EXISTS stripe_product_id;

-- 4. Verify trial system is working
-- Check if trial-related columns exist in users table
SELECT 'Checking trial system columns:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('plan_id', 'plan_status', 'trial_start', 'trial_end', 'current_period_start', 'current_period_end')
ORDER BY column_name;

-- 5. Ensure trial system is properly set up
-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add trial_start column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'trial_start'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN trial_start TIMESTAMPTZ;
        RAISE NOTICE 'Added trial_start column';
    ELSE
        RAISE NOTICE 'trial_start column already exists';
    END IF;

    -- Add trial_end column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'trial_end'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN trial_end TIMESTAMPTZ;
        RAISE NOTICE 'Added trial_end column';
    ELSE
        RAISE NOTICE 'trial_end column already exists';
    END IF;

    -- Add current_period_start column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'current_period_start'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN current_period_start TIMESTAMPTZ;
        RAISE NOTICE 'Added current_period_start column';
    ELSE
        RAISE NOTICE 'current_period_start column already exists';
    END IF;

    -- Add current_period_end column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'current_period_end'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN current_period_end TIMESTAMPTZ;
        RAISE NOTICE 'Added current_period_end column';
    ELSE
        RAISE NOTICE 'current_period_end column already exists';
    END IF;

    -- Add plan_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'plan_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN plan_id UUID REFERENCES subscription_plans(id);
        RAISE NOTICE 'Added plan_id column';
    ELSE
        RAISE NOTICE 'plan_id column already exists';
    END IF;

    -- Add plan_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'plan_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN plan_status TEXT DEFAULT 'no_plan';
        RAISE NOTICE 'Added plan_status column';
    ELSE
        RAISE NOTICE 'plan_status column already exists';
    END IF;

END $$;

-- 6. Create or replace trial assignment function
CREATE OR REPLACE FUNCTION assign_trial_to_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the free trial plan ID
    DECLARE
        trial_plan_id UUID;
    BEGIN
        SELECT id INTO trial_plan_id 
        FROM subscription_plans 
        WHERE name = 'free-trial-plan' 
        LIMIT 1;
        
        IF trial_plan_id IS NOT NULL THEN
            -- Set trial period (14 days from now)
            NEW.plan_id = trial_plan_id;
            NEW.plan_status = 'trial';
            NEW.trial_start = NOW();
            NEW.trial_end = NOW() + INTERVAL '14 days';
            NEW.current_period_start = NOW();
            NEW.current_period_end = NOW() + INTERVAL '14 days';
        END IF;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- 7. Create or replace trigger for new users
DROP TRIGGER IF EXISTS trigger_assign_trial ON users;
CREATE TRIGGER trigger_assign_trial
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_trial_to_new_user();

-- 8. Create or replace function to check if trial is expired
CREATE OR REPLACE FUNCTION is_user_trial_expired(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    trial_end_date TIMESTAMPTZ;
    user_plan_status TEXT;
BEGIN
    SELECT trial_end, plan_status 
    INTO trial_end_date, user_plan_status
    FROM users 
    WHERE id = user_id_param;
    
    -- Return true if trial has ended and user is still on trial status
    RETURN trial_end_date IS NOT NULL 
           AND trial_end_date < NOW() 
           AND user_plan_status = 'trial';
END;
$$ LANGUAGE plpgsql;

-- 9. Create or replace function to get subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    user_plan_status TEXT;
    trial_end_date TIMESTAMPTZ;
BEGIN
    SELECT plan_status, trial_end 
    INTO user_plan_status, trial_end_date
    FROM users 
    WHERE id = user_id_param;
    
    -- If user is on trial and trial has expired, return 'trial_expired'
    IF user_plan_status = 'trial' AND trial_end_date < NOW() THEN
        RETURN 'trial_expired';
    ELSE
        RETURN COALESCE(user_plan_status, 'no_plan');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Update existing users without trial to have trial
UPDATE users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan' LIMIT 1),
    plan_status = 'trial',
    trial_start = COALESCE(trial_start, created_at),
    trial_end = COALESCE(trial_end, created_at + INTERVAL '14 days'),
    current_period_start = COALESCE(current_period_start, created_at),
    current_period_end = COALESCE(current_period_end, created_at + INTERVAL '14 days')
WHERE plan_id IS NULL 
   OR plan_status IS NULL 
   OR plan_status = 'no_plan';

-- 11. Show current users and their trial status
SELECT 'Current users and their trial status:' as info;
SELECT 
    u.email,
    u.plan_status,
    u.trial_start,
    u.trial_end,
    CASE 
        WHEN u.trial_end < NOW() AND u.plan_status = 'trial' THEN 'TRIAL_EXPIRED'
        WHEN u.trial_end >= NOW() AND u.plan_status = 'trial' THEN 'TRIAL_ACTIVE'
        ELSE 'PAID_PLAN'
    END as current_status,
    CASE 
        WHEN u.trial_end < NOW() AND u.plan_status = 'trial' THEN 'Contact required for upgrade'
        WHEN u.trial_end >= NOW() AND u.plan_status = 'trial' THEN CONCAT(EXTRACT(DAY FROM (u.trial_end - NOW())), ' days remaining')
        ELSE 'Active subscription'
    END as status_description
FROM users u
ORDER BY u.created_at DESC;

-- 12. Show subscription plans
SELECT 'Available subscription plans:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    billing_cycle,
    is_active
FROM subscription_plans
ORDER BY price;

-- 13. Instructions for manual plan management
SELECT 'MANUAL PLAN MANAGEMENT INSTRUCTIONS:' as info;
SELECT '1. To upgrade a user plan, update the users table:' as instruction;
SELECT '   UPDATE users SET plan_id = (SELECT id FROM subscription_plans WHERE name = "pro-plan"), plan_status = "active" WHERE email = "user@example.com";' as example;
SELECT '2. To extend trial, update trial_end:' as instruction;
SELECT '   UPDATE users SET trial_end = NOW() + INTERVAL "7 days" WHERE email = "user@example.com";' as example;
SELECT '3. To cancel subscription, set plan_status to "canceled":' as instruction;
SELECT '   UPDATE users SET plan_status = "canceled" WHERE email = "user@example.com";' as example;
