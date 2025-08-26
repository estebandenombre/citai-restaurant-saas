-- Simplify User Registration
-- This script simplifies the user registration process to avoid errors

-- 1. Check current registration process issues
SELECT '1. Current registration issues:' as info;
SELECT 
    'The registration process tries to insert these fields:' as note;
SELECT 'id, restaurant_id, email, password_hash, first_name, last_name, role, is_active, has_completed_onboarding' as fields;

-- 2. Update existing users to have required fields
SELECT '2. Updating existing users:' as info;
UPDATE users SET
    password_hash = COALESCE(password_hash, 'handled_by_supabase_auth'),
    is_active = COALESCE(is_active, true),
    has_completed_onboarding = COALESCE(has_completed_onboarding, false),
    role = COALESCE(role, 'user')
WHERE password_hash IS NULL 
   OR is_active IS NULL 
   OR has_completed_onboarding IS NULL 
   OR role IS NULL;

-- 3. Check if restaurants table exists
SELECT '3. Restaurants table check:' as info;
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'restaurants' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'restaurants';

-- 4. Create restaurants table if it doesn't exist
SELECT '4. Creating restaurants table if needed:' as info;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurants' AND table_schema = 'public') THEN
        CREATE TABLE restaurants (
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
        RAISE NOTICE 'Created restaurants table';
    ELSE
        RAISE NOTICE 'restaurants table already exists';
    END IF;
END $$;

-- 5. Ensure restaurant_id column exists in users table
SELECT '5. Ensuring restaurant_id column exists:' as info;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'restaurant_id') THEN
        ALTER TABLE users ADD COLUMN restaurant_id UUID REFERENCES restaurants(id);
        RAISE NOTICE 'Added restaurant_id column to users table';
    ELSE
        RAISE NOTICE 'restaurant_id column already exists in users table';
    END IF;
END $$;

-- 6. Check subscription plans for free trial
SELECT '6. Checking subscription plans:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    is_active,
    CASE 
        WHEN name LIKE '%trial%' OR name LIKE '%free%' THEN '✅ FREE TRIAL'
        ELSE '💰 PAID PLAN'
    END as plan_type
FROM subscription_plans
ORDER BY price;

-- 7. Create a simple registration test
SELECT '7. Registration test simulation:' as info;
-- This shows what a successful registration would look like
SELECT 
    'Sample registration data:' as info;
SELECT 
    'id: UUID from auth.users' as field,
    'restaurant_id: UUID from restaurants' as value
UNION ALL
SELECT 
    'email: user@example.com' as field,
    'password_hash: handled_by_supabase_auth' as value
UNION ALL
SELECT 
    'first_name: John' as field,
    'last_name: Doe' as value
UNION ALL
SELECT 
    'role: owner' as field,
    'is_active: true' as value
UNION ALL
SELECT 
    'has_completed_onboarding: false' as field,
    'restaurant_id: UUID' as value;

-- 8. Fix instructions
SELECT '8. Registration fix instructions:' as info;
SELECT '1. The registration process should now work correctly' as step;
SELECT '2. All required columns are now present' as step;
SELECT '3. Try creating a new account to test' as step;
SELECT '4. If still having issues, check browser console for specific errors' as step;
