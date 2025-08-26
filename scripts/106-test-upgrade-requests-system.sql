-- Test Upgrade Requests System
-- This script tests the complete upgrade requests system

-- 1. Check current system state
SELECT '1. Current system state:' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN plan_status = 'trial' THEN 1 END) as trial_users,
    COUNT(CASE WHEN plan_status = 'active' THEN 1 END) as active_users
FROM users;

-- 2. Check upgrade requests table
SELECT '2. Upgrade requests table status:' as info;
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests
FROM upgrade_requests;

-- 3. Show recent upgrade requests
SELECT '3. Recent upgrade requests:' as info;
SELECT 
    ur.id,
    ur.user_email,
    ur.current_plan,
    ur.requested_plan,
    ur.status,
    ur.created_at,
    ur.processed_at,
    u.plan_status as user_current_plan
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_email = u.email
ORDER BY ur.created_at DESC
LIMIT 10;

-- 4. Test data: Create a sample upgrade request
SELECT '4. Creating test upgrade request...' as info;

-- First, let's get a test user
DO $$
DECLARE
    test_user_id UUID;
    test_user_email TEXT;
BEGIN
    -- Get the first user for testing
    SELECT id, email INTO test_user_id, test_user_email
    FROM users
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insert test upgrade request
        INSERT INTO upgrade_requests (
            user_id,
            user_email,
            current_plan,
            requested_plan,
            message,
            status
        ) VALUES (
            test_user_id,
            test_user_email,
            (SELECT plan_status FROM users WHERE id = test_user_id),
            'pro-plan',
            'This is a test upgrade request for demonstration purposes.',
            'pending'
        );
        
        RAISE NOTICE 'Test upgrade request created for user: %', test_user_email;
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
END $$;

-- 5. Show updated upgrade requests
SELECT '5. Updated upgrade requests:' as info;
SELECT 
    ur.id,
    ur.user_email,
    ur.current_plan,
    ur.requested_plan,
    ur.status,
    ur.created_at,
    ur.message
FROM upgrade_requests ur
ORDER BY ur.created_at DESC;

-- 6. Test approval workflow
SELECT '6. Testing approval workflow...' as info;

-- Get the latest test request
DO $$
DECLARE
    latest_request_id UUID;
    request_user_email TEXT;
BEGIN
    -- Get the latest request
    SELECT id, user_email INTO latest_request_id, request_user_email
    FROM upgrade_requests
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF latest_request_id IS NOT NULL THEN
        -- Step 1: Approve the request
        UPDATE upgrade_requests 
        SET status = 'approved', 
            processed_at = NOW(),
            admin_notes = 'Test approval - This is a demonstration of the approval workflow.'
        WHERE id = latest_request_id;
        
        RAISE NOTICE 'Request % approved for user %', latest_request_id, request_user_email;
        
        -- Step 2: Update user plan (simulate admin action)
        UPDATE users 
        SET plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro-plan' LIMIT 1),
            plan_status = 'active',
            current_period_start = NOW(),
            current_period_end = NOW() + INTERVAL '1 month'
        WHERE email = request_user_email;
        
        RAISE NOTICE 'User plan updated for %', request_user_email;
        
        -- Step 3: Mark request as completed
        UPDATE upgrade_requests 
        SET status = 'completed'
        WHERE id = latest_request_id;
        
        RAISE NOTICE 'Request marked as completed';
    ELSE
        RAISE NOTICE 'No requests found for testing';
    END IF;
END $$;

-- 7. Show final state
SELECT '7. Final system state:' as info;
SELECT 
    ur.id,
    ur.user_email,
    ur.current_plan,
    ur.requested_plan,
    ur.status,
    ur.created_at,
    ur.processed_at,
    ur.admin_notes,
    u.plan_status as user_current_plan
FROM upgrade_requests ur
LEFT JOIN users u ON ur.user_email = u.email
ORDER BY ur.created_at DESC;

-- 8. Test user experience simulation
SELECT '8. User experience simulation:' as info;
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
    COUNT(ur.id) as total_requests,
    COUNT(CASE WHEN ur.status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN ur.status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN ur.status = 'completed' THEN 1 END) as completed_requests
FROM users u
LEFT JOIN upgrade_requests ur ON u.email = ur.user_email
GROUP BY u.email, u.plan_status, u.trial_start, u.trial_end
ORDER BY u.created_at DESC;

-- 9. Instructions for testing the UI
SELECT '9. UI Testing Instructions:' as info;
SELECT '1. Login to the application' as step;
SELECT '2. Check the sidebar - you should see the plan badge with notification icon' as step;
SELECT '3. Click on the bell icon to see the upgrade request details' as step;
SELECT '4. Go to /dashboard/upgrade-requests to see all requests' as step;
SELECT '5. Go to /pricing to create a new upgrade request' as step;
SELECT '6. Test the complete workflow: create → approve → complete' as step;

-- 10. Cleanup (optional - uncomment to remove test data)
-- SELECT '10. Cleanup test data (uncomment to execute):' as info;
-- DELETE FROM upgrade_requests WHERE message LIKE '%test%' OR message LIKE '%demonstration%';
-- SELECT 'Test data cleaned up' as cleanup_result;
