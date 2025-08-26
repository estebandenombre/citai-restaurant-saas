-- Fix Admin Auth 400 Error
-- This script fixes the 400 Bad Request error in admin authentication

-- 1. Check current admin user state
SELECT '1. Current admin user state:' as info;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    last_sign_in_at,
    created_at
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 2. Delete existing admin user from auth.users (if exists)
SELECT '2. Cleaning up existing admin user:' as info;
DELETE FROM auth.users WHERE email = 'ortizvicenteesteban@gmail.com';

-- 3. Create fresh admin user in auth.users
SELECT '3. Creating fresh admin user in auth.users:' as info;
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
    'ortizvicenteesteban@gmail.com',
    crypt('Admin123!', gen_salt('bf')),
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

-- 4. Update admin user in public.users to match auth.users
SELECT '4. Updating admin user in public.users:' as info;
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

-- 5. Verify the fix
SELECT '5. Verification:' as info;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

SELECT 
    'public.users' as table_name,
    id,
    email,
    role,
    plan_status,
    created_at
FROM users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 6. Test password verification
SELECT '6. Password verification test:' as info;
SELECT 
    email,
    CASE 
        WHEN crypt('Admin123!', encrypted_password) = encrypted_password THEN '✅ PASSWORD MATCHES'
        ELSE '❌ PASSWORD DOES NOT MATCH'
    END as password_test
FROM auth.users 
WHERE email = 'ortizvicenteesteban@gmail.com';

-- 7. Login test instructions
SELECT '7. Login test instructions:' as info;
SELECT 'Email: ortizvicenteesteban@gmail.com' as credential;
SELECT 'Password: Admin123!' as credential;
SELECT 'Try logging in again with these credentials' as instruction;
SELECT 'The 400 error should now be resolved' as note;
