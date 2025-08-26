-- Test the upgrade request system

-- 1. Check if we have subscription plans
SELECT 'Subscription Plans:' as info;
SELECT id, name, display_name, price FROM subscription_plans ORDER BY price;

-- 2. Check if we have users
SELECT 'Users:' as info;
SELECT id, email, first_name, last_name FROM users LIMIT 5;

-- 3. Check if admin user exists
SELECT 'Admin User:' as info;
SELECT email, first_name, last_name, role, is_active FROM admin_users WHERE email = 'admin@tably.com';

-- 4. Check if upgrade_requests table is empty
SELECT 'Upgrade Requests:' as info;
SELECT COUNT(*) as total_requests FROM upgrade_requests;

-- 5. Test creating a sample upgrade request (if we have users and plans)
DO $$
DECLARE
    sample_user_id UUID;
    free_trial_plan_id UUID;
    pro_plan_id UUID;
BEGIN
    -- Get a sample user
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Get plan IDs
    SELECT id INTO free_trial_plan_id FROM subscription_plans WHERE name = 'free_trial' LIMIT 1;
    SELECT id INTO pro_plan_id FROM subscription_plans WHERE name = 'pro' LIMIT 1;
    
    -- Create a sample upgrade request if we have the data
    IF sample_user_id IS NOT NULL AND free_trial_plan_id IS NOT NULL AND pro_plan_id IS NOT NULL THEN
        INSERT INTO upgrade_requests (
            user_id, 
            current_plan_id, 
            requested_plan_id, 
            reason, 
            status
        ) VALUES (
            sample_user_id,
            free_trial_plan_id,
            pro_plan_id,
            'Testing the upgrade request system',
            'pending'
        );
        
        RAISE NOTICE '✅ Sample upgrade request created successfully';
    ELSE
        RAISE NOTICE '⚠️  Cannot create sample request - missing users or plans';
    END IF;
END $$;

-- 6. Show the created request
SELECT 'Sample Upgrade Request:' as info;
SELECT 
    ur.id,
    ur.status,
    ur.reason,
    ur.created_at,
    u.email as user_email,
    cp.name as current_plan,
    rp.name as requested_plan
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_id = u.id
LEFT JOIN subscription_plans cp ON ur.current_plan_id = cp.id
LEFT JOIN subscription_plans rp ON ur.requested_plan_id = rp.id
ORDER BY ur.created_at DESC
LIMIT 5;

-- 7. Test RLS policies
SELECT 'RLS Policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('upgrade_requests', 'admin_users')
ORDER BY tablename, policyname;

-- 8. Show final status
SELECT 'System Status:' as info;
SELECT 
    'Tables' as component,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('upgrade_requests', 'admin_users')

UNION ALL

SELECT 
    'Upgrade Requests' as component,
    COUNT(*) as count
FROM upgrade_requests

UNION ALL

SELECT 
    'Admin Users' as component,
    COUNT(*) as count
FROM admin_users;
