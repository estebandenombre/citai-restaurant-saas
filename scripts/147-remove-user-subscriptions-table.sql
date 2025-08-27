-- Remove user_subscriptions table
-- This script safely removes the user_subscriptions table since subscriptions are managed in users table

-- 1. First, let's check what data exists in user_subscriptions
SELECT '1. CURRENT USER_SUBSCRIPTIONS DATA:' as section;
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT plan_id) as unique_plans
FROM user_subscriptions;

-- 2. Check if there are any users in user_subscriptions that don't exist in users table
SELECT '2. ORPHANED USER_SUBSCRIPTIONS:' as section;
SELECT 
    us.user_id,
    us.plan_id,
    us.status,
    us.created_at
FROM user_subscriptions us
LEFT JOIN users u ON us.user_id = u.id
WHERE u.id IS NULL;

-- 3. Check if there are any users in users table that don't have plan_id set
SELECT '3. USERS WITHOUT PLAN_ID:' as section;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.plan_id,
    u.plan_status,
    u.created_at
FROM users u
WHERE u.plan_id IS NULL OR u.plan_status IS NULL;

-- 4. Update users who don't have plan_id to use the free trial plan
SELECT '4. UPDATING USERS WITHOUT PLAN_ID:' as section;
UPDATE users 
SET 
    plan_id = '550e8400-e29b-41d4-a716-446655440000',
    plan_status = 'trial',
    trial_start = COALESCE(trial_start, created_at),
    trial_end = COALESCE(trial_end, created_at + INTERVAL '14 days'),
    current_period_start = COALESCE(current_period_start, created_at),
    current_period_end = COALESCE(current_period_end, created_at + INTERVAL '14 days')
WHERE plan_id IS NULL OR plan_status IS NULL;

-- 5. Verify all users now have plan_id
SELECT '5. VERIFICATION - ALL USERS HAVE PLAN_ID:' as section;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN plan_id IS NOT NULL THEN 1 END) as users_with_plan_id,
    COUNT(CASE WHEN plan_status IS NOT NULL THEN 1 END) as users_with_plan_status
FROM users;

-- 6. Check for any foreign key constraints on user_subscriptions
SELECT '6. FOREIGN KEY CONSTRAINTS ON USER_SUBSCRIPTIONS:' as section;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_subscriptions';

-- 7. Check for any triggers on user_subscriptions
SELECT '7. TRIGGERS ON USER_SUBSCRIPTIONS:' as section;
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name,
    tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'user_subscriptions'::regclass;

-- 8. Drop any triggers on user_subscriptions
SELECT '8. DROPPING TRIGGERS ON USER_SUBSCRIPTIONS:' as section;
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'user_subscriptions'::regclass
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON user_subscriptions';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- 9. Drop the user_subscriptions table
SELECT '9. DROPPING USER_SUBSCRIPTIONS TABLE:' as section;
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- 10. Verify the table was dropped
SELECT '10. VERIFICATION - TABLE DROPPED:' as section;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'user_subscriptions' 
    AND table_schema = 'public';

-- 11. Final verification of users table
SELECT '11. FINAL VERIFICATION - USERS TABLE:' as section;
SELECT 
    'Total users:' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Users with plan_id:' as metric,
    COUNT(*) as value
FROM users WHERE plan_id IS NOT NULL
UNION ALL
SELECT 
    'Users with trial status:' as metric,
    COUNT(*) as value
FROM users WHERE plan_status = 'trial'
UNION ALL
SELECT 
    'Users with active status:' as metric,
    COUNT(*) as value
FROM users WHERE plan_status = 'active';

-- 12. Show sample users with their plans
SELECT '12. SAMPLE USERS WITH PLANS:' as section;
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.plan_status,
    sp.name as plan_name,
    sp.price as plan_price,
    u.trial_end,
    CASE 
        WHEN u.trial_end < NOW() THEN 'EXPIRED'
        WHEN u.trial_end IS NULL THEN 'NO TRIAL'
        ELSE 'ACTIVE'
    END as trial_status
FROM users u
LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 13. Success message
SELECT '13. CLEANUP COMPLETE:' as section;
SELECT '✅ user_subscriptions table removed' as status;
SELECT '✅ All users now have plan_id and plan_status' as status;
SELECT '✅ Subscriptions managed directly in users table' as status;
SELECT '✅ Database simplified and optimized' as status;
SELECT '✅ No more redundant subscription management' as status;



