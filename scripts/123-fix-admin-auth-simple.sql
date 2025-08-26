-- Fix Admin Authentication (Simple)
-- This script handles missing columns and creates admin user properly

-- 1. Check current state
SELECT '1. Current state check:' as info;
SELECT 
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

SELECT 
    'public.users' as table_name,
    COUNT(*) as user_count
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 2. Create admin user in auth.users if not exists
SELECT '2. Creating admin user in auth.users:' as info;
DO $$
DECLARE
    admin_email TEXT := 'ortizvicenteesteban@gmail.com';
    admin_password TEXT := 'Admin123!'; -- Change this to your desired password
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists in auth.users
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;

    IF admin_user_id IS NULL THEN
        -- Create admin user in auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Admin user created in auth.users: %', admin_email;
    ELSE
        RAISE NOTICE 'Admin user already exists in auth.users: %', admin_email;
    END IF;
END $$;

-- 3. Update admin user in public.users to match auth.users (simplified)
SELECT '3. Updating admin user in public.users:' as info;
DO $$
DECLARE
    admin_email TEXT := 'ortizvicenteesteban@gmail.com';
    auth_user_id UUID;
    pro_plan_id UUID;
BEGIN
    -- Get the admin user ID from auth.users
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = admin_email;

    -- Get pro plan ID
    SELECT id INTO pro_plan_id
    FROM subscription_plans 
    WHERE name = 'pro-plan' 
    LIMIT 1;

    IF auth_user_id IS NOT NULL THEN
        -- Update existing admin user in public.users
        UPDATE users SET
            id = auth_user_id,
            role = 'admin',
            plan_status = 'active',
            plan_id = COALESCE(pro_plan_id, plan_id),
            updated_at = NOW()
        WHERE email = admin_email;

        -- If no rows were updated, insert new admin user
        IF NOT FOUND THEN
            INSERT INTO users (
                id, email, password_hash, first_name, last_name, role, plan_id, plan_status,
                trial_start, trial_end, current_period_start, current_period_end,
                created_at, updated_at, has_completed_onboarding
            ) VALUES (
                auth_user_id, admin_email, 
                (SELECT encrypted_password FROM auth.users WHERE email = admin_email),
                'Admin', 'User', 'admin',
                pro_plan_id, 'active',
                NOW(), NOW() + INTERVAL '1 year', NOW(), NOW() + INTERVAL '1 year',
                NOW(), NOW(), true
            );
        END IF;
            
        RAISE NOTICE 'Admin user updated in public.users: %', admin_email;
    END IF;
END $$;

-- 4. Verify the fix
SELECT '4. Verification:' as info;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

SELECT 
    'public.users' as table_name,
    id,
    email,
    role,
    plan_status
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 5. Test login credentials
SELECT '5. Login test instructions:' as info;
SELECT 'Email: ortizvicenteesteban@gmail.com' as credential;
SELECT 'Password: Admin123!' as credential;
SELECT 'Try logging in with these credentials' as instruction;
