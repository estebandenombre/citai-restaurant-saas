-- Verify Upgrade Requests System
-- This script checks that the upgrade requests system is working correctly

-- 1. Check if upgrade_requests table exists
SELECT '1. Checking upgrade_requests table:' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'upgrade_requests' 
AND table_schema = 'public';

-- 2. Check table structure
SELECT '2. Upgrade requests table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'upgrade_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT '3. RLS policies for upgrade_requests:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'upgrade_requests';

-- 4. Check indexes
SELECT '4. Indexes on upgrade_requests:' as info;
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'upgrade_requests';

-- 5. Show current upgrade requests (if any)
SELECT '5. Current upgrade requests:' as info;
SELECT 
    id,
    user_email,
    current_plan,
    requested_plan,
    status,
    created_at,
    processed_at
FROM upgrade_requests
ORDER BY created_at DESC;

-- 6. Show upgrade request statistics
SELECT '6. Upgrade request statistics:' as info;
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests
FROM upgrade_requests;

-- 7. Check trial system integration
SELECT '7. Trial system integration:' as info;
SELECT 
    u.email,
    u.plan_status,
    u.trial_start,
    u.trial_end,
    CASE 
        WHEN u.trial_end < NOW() AND u.plan_status = 'trial' THEN 'TRIAL_EXPIRED'
        WHEN u.trial_end >= NOW() AND u.plan_status = 'trial' THEN 'TRIAL_ACTIVE'
        WHEN u.plan_status = 'active' THEN 'PAID_PLAN'
        ELSE 'UNKNOWN'
    END as current_status,
    COUNT(ur.id) as upgrade_requests_count
FROM users u
LEFT JOIN upgrade_requests ur ON u.email = ur.user_email
GROUP BY u.email, u.plan_status, u.trial_start, u.trial_end
ORDER BY u.created_at DESC;

-- 8. Test upgrade request creation (manual example)
SELECT '8. Manual upgrade request creation example:' as info;
SELECT 'To create an upgrade request manually:' as instruction;
SELECT 'INSERT INTO upgrade_requests (user_id, user_email, current_plan, requested_plan, message, status) VALUES (' as example;
SELECT '  (SELECT id FROM users WHERE email = "user@example.com"),' as example;
SELECT '  "user@example.com",' as example;
SELECT '  (SELECT plan_status FROM users WHERE email = "user@example.com"),' as example;
SELECT '  "pro-plan",' as example;
SELECT '  "I would like to upgrade to Pro plan",' as example;
SELECT '  "pending"' as example;
SELECT ');' as example;

-- 9. Test upgrade request approval (manual example)
SELECT '9. Manual upgrade request approval example:' as instruction;
SELECT 'To approve an upgrade request and update user plan:' as instruction;
SELECT '-- Step 1: Update request status' as step;
SELECT 'UPDATE upgrade_requests SET status = "approved", processed_at = NOW() WHERE id = "request_id";' as example;
SELECT '' as blank;
SELECT '-- Step 2: Update user plan' as step;
SELECT 'UPDATE users SET plan_id = (SELECT id FROM subscription_plans WHERE name = "pro-plan"), plan_status = "active" WHERE email = "user@example.com";' as example;
SELECT '' as blank;
SELECT '-- Step 3: Mark request as completed' as step;
SELECT 'UPDATE upgrade_requests SET status = "completed" WHERE id = "request_id";' as example;

-- 10. Instructions for testing the system
SELECT '10. Testing instructions:' as info;
SELECT '1. Create a new user account' as step;
SELECT '2. Go to /pricing and click "Contact to Upgrade"' as step;
SELECT '3. Fill out the form and submit' as step;
SELECT '4. Check the upgrade_requests table for the new request' as step;
SELECT '5. Go to /dashboard/upgrade-requests to view the request' as step;
SELECT '6. Manually approve the request using SQL commands above' as step;
SELECT '7. Verify the user plan has been updated' as step;

-- 11. Show subscription plans for reference
SELECT '11. Available subscription plans:' as info;
SELECT 
    id,
    name,
    display_name,
    price,
    billing_cycle,
    is_active
FROM subscription_plans
ORDER BY price;
