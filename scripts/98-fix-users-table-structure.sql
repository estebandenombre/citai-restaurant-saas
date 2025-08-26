-- Fix users table structure for trial system
-- This script checks and adds missing columns for trial management

-- 1. Check current structure of users table
SELECT 'Current users table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check which trial-related columns exist
SELECT 'Checking trial-related columns:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('plan_id', 'plan_status', 'trial_start', 'trial_end', 'current_period_start', 'current_period_end')
ORDER BY column_name;

-- 3. Add missing columns if they don't exist
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

-- 4. Show updated structure
SELECT 'Updated users table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('plan_id', 'plan_status', 'trial_start', 'trial_end', 'current_period_start', 'current_period_end')
ORDER BY column_name;

-- 5. Show all users table columns
SELECT 'Complete users table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Instructions for next step
SELECT 'NEXT STEPS:' as info;
SELECT '1. Run scripts/96-setup-trial-automatically.sql again' as step;
SELECT '2. The script should now work without errors' as step;
SELECT '3. All required columns are now present' as step;
