-- Create Admin User and Security Policies
-- This script sets up admin user and security for the admin panel

-- 1. Create admin user in auth.users (if not exists)
DO $$
DECLARE
    admin_email TEXT := 'admin@tably.com'; -- Change this to your admin email
    admin_password TEXT := 'Admin123!'; -- Change this to a secure password
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists
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
            '{"first_name": "Admin", "last_name": "User"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Admin user created: %', admin_email;
    ELSE
        RAISE NOTICE 'Admin user already exists: %', admin_email;
    END IF;
END $$;

-- 2. Create admin user in public.users (if not exists)
DO $$
DECLARE
    admin_email TEXT := 'admin@tably.com'; -- Change this to your admin email
    admin_user_id UUID;
    admin_password_hash TEXT;
BEGIN
    -- Get the admin user ID from auth.users
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    -- Get the encrypted password from auth.users
    SELECT encrypted_password INTO admin_password_hash
    FROM auth.users
    WHERE email = admin_email;
    
    IF admin_user_id IS NOT NULL THEN
        -- Check if admin exists in public.users
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = admin_email) THEN
            -- Create admin user in public.users with all required fields
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
                admin_password_hash,
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
            
            RAISE NOTICE 'Admin user added to public.users: %', admin_email;
        ELSE
            -- Update existing admin user to ensure admin role
            UPDATE public.users 
            SET role = 'admin',
                plan_status = 'active',
                updated_at = NOW()
            WHERE email = admin_email;
            
            RAISE NOTICE 'Admin user updated in public.users: %', admin_email;
        END IF;
    END IF;
END $$;

-- 3. Create RLS policies for admin access to upgrade_requests
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can manage all upgrade requests" ON upgrade_requests;

-- Create new admin policy
CREATE POLICY "Admin can manage all upgrade requests" ON upgrade_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- 4. Create RLS policies for admin access to users table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can manage all users" ON users;

-- Create new admin policy for users table
CREATE POLICY "Admin can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- 5. Create RLS policies for admin access to subscription_plans
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can read subscription plans" ON subscription_plans;

-- Create new admin policy for subscription_plans table
CREATE POLICY "Admin can read subscription plans" ON subscription_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- 6. Verify admin user setup
SELECT '6. Admin user verification:' as info;
SELECT 
    u.email,
    u.role,
    u.plan_status,
    u.first_name,
    u.last_name,
    u.created_at
FROM users u
WHERE u.role = 'admin';

-- 7. Show RLS policies
SELECT '7. RLS policies for admin access:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'users', 'subscription_plans')
AND policyname LIKE '%admin%';

-- 8. Test admin access
SELECT '8. Testing admin access:' as info;
SELECT 
    'Admin can access upgrade_requests:' as test,
    COUNT(*) as total_requests
FROM upgrade_requests;

SELECT 
    'Admin can access users:' as test,
    COUNT(*) as total_users
FROM users;

SELECT 
    'Admin can access subscription_plans:' as test,
    COUNT(*) as total_plans
FROM subscription_plans;

-- 9. Security recommendations
SELECT '9. Security recommendations:' as info;
SELECT '1. Change the default admin password immediately after first login' as recommendation;
SELECT '2. Use a strong, unique password for the admin account' as recommendation;
SELECT '3. Enable 2FA for the admin account if possible' as recommendation;
SELECT '4. Regularly audit admin access logs' as recommendation;
SELECT '5. Consider using environment variables for admin credentials' as recommendation;

-- 10. Admin panel access instructions
SELECT '10. Admin panel access instructions:' as info;
SELECT 'URL: /admin/upgrade-requests' as instruction;
SELECT 'Email: admin@tably.com' as credential;
SELECT 'Password: Admin123!' as credential;
SELECT 'IMPORTANT: Change these credentials immediately!' as warning;

-- 11. Create additional security measures
-- Create a function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    action_type TEXT,
    table_name TEXT,
    record_id UUID,
    admin_email TEXT,
    details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- This function can be used to log admin actions for audit purposes
    -- You can create an admin_audit_log table to store these logs
    RAISE NOTICE 'Admin action logged: % on % table, record: %, admin: %, details: %', 
        action_type, table_name, record_id, admin_email, details;
END;
$$ LANGUAGE plpgsql;

-- 12. Create admin audit log table (optional)
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin audit log
CREATE POLICY "Admin can view audit logs" ON admin_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- Create policy for admin audit log insert
CREATE POLICY "System can insert audit logs" ON admin_audit_log
    FOR INSERT WITH CHECK (true);

SELECT '12. Admin audit log table created' as info;
