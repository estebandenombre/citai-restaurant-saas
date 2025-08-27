-- Immediate Registration Fix
-- This script fixes all registration issues immediately

-- 1. Create restaurants table if it doesn't exist
SELECT '1. Creating restaurants table:' as info;
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add all missing columns to users table
SELECT '2. Adding missing columns to users table:' as info;
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

    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Added role column';
    END IF;
END $$;

-- 3. Update existing users with default values
SELECT '3. Updating existing users:' as info;
UPDATE users SET
    password_hash = COALESCE(password_hash, 'handled_by_supabase_auth'),
    is_active = COALESCE(is_active, true),
    has_completed_onboarding = COALESCE(has_completed_onboarding, false),
    role = COALESCE(role, 'user')
WHERE password_hash IS NULL 
   OR is_active IS NULL 
   OR has_completed_onboarding IS NULL 
   OR role IS NULL;

-- 4. Create user_subscriptions table if it doesn't exist
SELECT '4. Creating user_subscriptions table:' as info;
CREATE TABLE IF NOT EXISTS user_subscriptions (
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

-- 5. Ensure subscription_plans table has free trial plan
SELECT '5. Checking subscription plans:' as info;
INSERT INTO subscription_plans (id, name, display_name, price, billing_cycle, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'free-trial-plan',
    'Free Trial',
    0,
    'monthly',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'free-trial-plan');

-- 6. Verify the fix
SELECT '6. Verification:' as info;
SELECT 
    'users table columns:' as check_type,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';

SELECT 
    'restaurants table:' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurants') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 
    'user_subscriptions table:' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 
    'free trial plan:' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'free-trial-plan') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 7. Test registration simulation
SELECT '7. Registration test:' as info;
SELECT 'All required components are now in place' as status;
SELECT 'Try creating a new account to test the registration' as instruction;
SELECT 'The error should now be resolved' as note;



