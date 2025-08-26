-- Simple Admin Setup
-- This script converts an existing user to admin or creates a simple admin setup

-- Option 1: Convert an existing user to admin
-- Replace 'your-email@example.com' with the email of the user you want to make admin
DO $$
DECLARE
    target_email TEXT := 'your-email@example.com'; -- CHANGE THIS TO YOUR EMAIL
BEGIN
    -- Update existing user to admin role
    UPDATE users 
    SET role = 'admin',
        plan_status = 'active',
        updated_at = NOW()
    WHERE email = target_email;
    
    IF FOUND THEN
        RAISE NOTICE 'User % converted to admin successfully', target_email;
    ELSE
        RAISE NOTICE 'User % not found. Please check the email address.', target_email;
    END IF;
END $$;

-- Option 2: Create a simple admin user (if no existing user to convert)
-- Uncomment the following section if you need to create a new admin user
/*
DO $$
DECLARE
    admin_email TEXT := 'admin@tably.com';
    admin_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert admin user directly into public.users
    INSERT INTO public.users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        plan_id,
        plan_status,
        trial_start,
        trial_end,
        current_period_start,
        current_period_end,
        created_at,
        updated_at,
        has_completed_onboarding,
        is_verified
    ) VALUES (
        admin_user_id,
        admin_email,
        '$2a$10$dummy.hash.for.admin.user', -- This is a dummy hash, you'll need to set a real password
        'Admin',
        'User',
        'admin',
        (SELECT id FROM subscription_plans WHERE name = 'pro-plan' LIMIT 1),
        'active',
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW(),
        NOW(),
        true,
        true
    );
    
    RAISE NOTICE 'Admin user created: %', admin_email;
    RAISE NOTICE 'IMPORTANT: You need to set a real password for this user!';
END $$;
*/

-- 3. Create RLS policies for admin access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can manage all upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Admin can read subscription plans" ON subscription_plans;

-- Create new admin policies
CREATE POLICY "Admin can manage all upgrade requests" ON upgrade_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can read subscription plans" ON subscription_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- 4. Verify admin setup
SELECT '4. Admin user verification:' as info;
SELECT 
    u.email,
    u.role,
    u.plan_status,
    u.first_name,
    u.last_name,
    CASE 
        WHEN u.role = 'admin' THEN '✅ ADMIN USER'
        ELSE '❌ NOT ADMIN'
    END as status
FROM users u
WHERE u.role = 'admin';

-- 5. Show current users for reference
SELECT '5. Current users in system:' as info;
SELECT 
    email,
    role,
    plan_status,
    created_at
FROM users
ORDER BY created_at DESC;

-- 6. Instructions
SELECT '6. Instructions:' as info;
SELECT '1. Change the email in line 6 to your actual email address' as instruction;
SELECT '2. Run this script in Supabase SQL Editor' as instruction;
SELECT '3. Navigate to /admin/upgrade-requests' as instruction;
SELECT '4. Login with your email and password' as instruction;
SELECT '5. You should now have admin access' as instruction;
