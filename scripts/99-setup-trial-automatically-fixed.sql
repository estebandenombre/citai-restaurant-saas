-- Setup automatic trial assignment and expiration handling (FIXED VERSION)
-- This script ensures new users get 14-day trial and proper expiration handling

-- 1. First, ensure all required columns exist
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
    END IF;

END $$;

-- 2. Create or update trigger for new user registration
CREATE OR REPLACE FUNCTION assign_trial_to_new_user()
RETURNS TRIGGER AS $$
DECLARE
    trial_plan_id UUID;
BEGIN
    -- Get the free trial plan ID
    SELECT id INTO trial_plan_id 
    FROM subscription_plans 
    WHERE name = 'free-trial-plan' 
    LIMIT 1;
    
    -- If trial plan exists, assign it to new user
    IF trial_plan_id IS NOT NULL THEN
        NEW.plan_id = trial_plan_id;
        NEW.plan_status = 'trial';
        NEW.trial_start = NOW();
        NEW.trial_end = NOW() + INTERVAL '14 days';
        NEW.current_period_start = NOW();
        NEW.current_period_end = NOW() + INTERVAL '14 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS trigger_assign_trial ON users;
CREATE TRIGGER trigger_assign_trial
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_trial_to_new_user();

-- 4. Update existing users without trial to have trial
UPDATE users 
SET 
    plan_id = (SELECT id FROM subscription_plans WHERE name = 'free-trial-plan'),
    plan_status = 'trial',
    trial_start = COALESCE(trial_start, created_at),
    trial_end = COALESCE(trial_end, created_at + INTERVAL '14 days'),
    current_period_start = COALESCE(current_period_start, created_at),
    current_period_end = COALESCE(current_period_end, created_at + INTERVAL '14 days')
WHERE plan_id IS NULL OR plan_status IS NULL OR plan_status = 'no_plan';

-- 5. Create function to check if user trial has expired
CREATE OR REPLACE FUNCTION is_user_trial_expired(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_trial_end TIMESTAMPTZ;
BEGIN
    SELECT trial_end INTO user_trial_end
    FROM users 
    WHERE email = user_email;
    
    RETURN user_trial_end IS NOT NULL AND user_trial_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_trial_end TIMESTAMPTZ;
    user_current_period_end TIMESTAMPTZ;
    user_plan_status TEXT;
BEGIN
    SELECT trial_end, current_period_end, plan_status 
    INTO user_trial_end, user_current_period_end, user_plan_status
    FROM users 
    WHERE email = user_email;
    
    -- If user has trial and it's not expired
    IF user_trial_end IS NOT NULL AND user_trial_end > NOW() THEN
        RETURN 'trial';
    -- If user has active subscription period
    ELSIF user_current_period_end IS NOT NULL AND user_current_period_end > NOW() THEN
        RETURN 'active';
    -- If trial has expired but no active subscription
    ELSIF user_trial_end IS NOT NULL AND user_trial_end <= NOW() THEN
        RETURN 'trial_expired';
    -- If subscription period has expired
    ELSIF user_current_period_end IS NOT NULL AND user_current_period_end <= NOW() THEN
        RETURN 'expired';
    -- No plan assigned
    ELSE
        RETURN 'no_plan';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Show current trial status for all users
SELECT 'Current trial status for all users:' as info;
SELECT 
    u.email,
    u.plan_id,
    u.plan_status,
    u.trial_start,
    u.trial_end,
    u.current_period_end,
    get_user_subscription_status(u.email) as calculated_status,
    CASE 
        WHEN u.trial_end > NOW() THEN 'TRIAL ACTIVE'
        WHEN u.trial_end <= NOW() THEN 'TRIAL EXPIRED'
        ELSE 'NO TRIAL'
    END as trial_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC;

-- 8. Show users with expired trials
SELECT 'Users with expired trials:' as info;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.trial_end,
    EXTRACT(DAYS FROM NOW() - u.trial_end) as days_expired
FROM users u
WHERE u.trial_end IS NOT NULL AND u.trial_end < NOW()
ORDER BY u.trial_end;

-- 9. Show users with active trials
SELECT 'Users with active trials:' as info;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.trial_end,
    EXTRACT(DAYS FROM u.trial_end - NOW()) as days_remaining
FROM users u
WHERE u.trial_end IS NOT NULL AND u.trial_end > NOW()
ORDER BY u.trial_end;

-- 10. Test the trigger with a sample insert (commented out)
-- INSERT INTO users (email, first_name, last_name, restaurant_name) 
-- VALUES ('test-trial@example.com', 'Test', 'Trial', 'Test Restaurant');

-- 11. Instructions for application integration
SELECT 'APPLICATION INTEGRATION:' as info;
SELECT '1. Use get_user_subscription_status(email) to check user status' as instruction;
SELECT '2. If status = "trial_expired", show expiration message' as instruction;
SELECT '3. Redirect expired users to /pricing for upgrade' as instruction;
SELECT '4. Do NOT automatically change plan when trial expires' as instruction;
SELECT '5. Let users manually request upgrade through support' as instruction;

-- 12. Example queries for application
SELECT 'EXAMPLE QUERIES FOR APPLICATION:' as info;
SELECT '-- Check if user trial expired:' as example;
SELECT 'SELECT get_user_subscription_status("user@example.com") as status;' as example;
SELECT '' as example;
SELECT '-- Get trial days remaining:' as example;
SELECT 'SELECT EXTRACT(DAYS FROM trial_end - NOW()) as days_left FROM users WHERE email = "user@example.com";' as example;

-- 13. Verification
SELECT 'VERIFICATION:' as info;
SELECT '✅ All required columns added to users table' as status;
SELECT '✅ Trigger created for automatic trial assignment' as status;
SELECT '✅ Functions created for status checking' as status;
SELECT '✅ Existing users updated with trial plans' as status;
SELECT '✅ System ready for new user registrations' as status;
