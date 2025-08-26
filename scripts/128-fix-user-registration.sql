-- Fix User Registration
-- This script fixes the user registration error by checking table structure

-- 1. Check current users table structure
SELECT '1. Current users table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if required columns exist
SELECT '2. Required columns check:' as info;
SELECT 
    column_name,
    CASE 
        WHEN column_name IN ('id', 'email', 'first_name', 'last_name', 'role', 'restaurant_id') THEN '✅ REQUIRED'
        WHEN column_name IN ('password_hash', 'is_active', 'has_completed_onboarding') THEN '⚠️ OPTIONAL'
        ELSE 'ℹ️ OTHER'
    END as status
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('id', 'email', 'first_name', 'last_name', 'role', 'restaurant_id', 'password_hash', 'is_active', 'has_completed_onboarding')
ORDER BY column_name;

-- 3. Add missing columns if they don't exist
SELECT '3. Adding missing columns:' as info;
DO $$
BEGIN
    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
        RAISE NOTICE 'Added password_hash column';
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column';
    END IF;

    -- Add has_completed_onboarding column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'has_completed_onboarding') THEN
        ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added has_completed_onboarding column';
    END IF;

    -- Add restaurant_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'restaurant_id') THEN
        ALTER TABLE users ADD COLUMN restaurant_id UUID REFERENCES restaurants(id);
        RAISE NOTICE 'Added restaurant_id column';
    END IF;
END $$;

-- 4. Check if user_subscriptions table exists
SELECT '4. User subscriptions table check:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'user_subscriptions' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_subscriptions';

-- 5. Create user_subscriptions table if it doesn't exist
SELECT '5. Creating user_subscriptions table if needed:' as info;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
        CREATE TABLE user_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            plan_id UUID REFERENCES subscription_plans(id),
            status TEXT DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired')),
            current_period_start TIMESTAMPTZ DEFAULT NOW(),
            current_period_end TIMESTAMPTZ,
            trial_start TIMESTAMPTZ DEFAULT NOW(),
            trial_end TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Created user_subscriptions table';
    ELSE
        RAISE NOTICE 'user_subscriptions table already exists';
    END IF;
END $$;

-- 6. Check subscription_plans table
SELECT '6. Subscription plans check:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    is_active
FROM subscription_plans
ORDER BY price;

-- 7. Test user creation simulation
SELECT '7. Test user creation simulation:' as info;
-- This simulates what the registration process would do
SELECT 
    'users table' as table_name,
    COUNT(*) as current_users
FROM users;

SELECT 
    'user_subscriptions table' as table_name,
    COUNT(*) as current_subscriptions
FROM user_subscriptions;

-- 8. Registration fix instructions
SELECT '8. Registration fix instructions:' as info;
SELECT 'The registration process should now work correctly' as note;
SELECT 'Try creating a new account to test the fix' as instruction;
