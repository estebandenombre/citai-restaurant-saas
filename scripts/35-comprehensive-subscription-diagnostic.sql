-- Comprehensive Subscription System Diagnostic
-- Run this script to identify all potential issues with user-subscription linking

-- ===========================================
-- 1. BASIC TABLE STATUS
-- ===========================================

SELECT '=== BASIC TABLE STATUS ===' as section;

-- Check if tables exist and have data
SELECT 
  'subscription_plans' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END as status
FROM subscription_plans

UNION ALL

SELECT 
  'user_subscriptions' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END as status
FROM user_subscriptions

UNION ALL

SELECT 
  'auth.users' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END as status
FROM auth.users

UNION ALL

SELECT 
  'public.users' as table_name,
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END as status
FROM users;

-- ===========================================
-- 2. SUBSCRIPTION PLANS DETAILS
-- ===========================================

SELECT '=== SUBSCRIPTION PLANS DETAILS ===' as section;

SELECT 
  id,
  name,
  display_name,
  price,
  billing_cycle,
  trial_days,
  is_active,
  created_at
FROM subscription_plans
ORDER BY price;

-- ===========================================
-- 3. USER SUBSCRIPTIONS ANALYSIS
-- ===========================================

SELECT '=== USER SUBSCRIPTIONS ANALYSIS ===' as section;

-- All user subscriptions with details
SELECT 
  us.id as subscription_id,
  us.user_id,
  au.email as user_email,
  us.plan_id,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.trial_start,
  us.trial_end,
  us.created_at,
  CASE 
    WHEN us.status IN ('active', 'trial') 
    AND NOW() <= us.current_period_end 
    THEN 'VALID'
    ELSE 'INVALID'
  END as subscription_validity
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

-- ===========================================
-- 4. USERS WITHOUT SUBSCRIPTIONS
-- ===========================================

SELECT '=== USERS WITHOUT SUBSCRIPTIONS ===' as section;

SELECT 
  au.id,
  au.email,
  au.created_at,
  'NO SUBSCRIPTION' as issue
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
WHERE us.id IS NULL
ORDER BY au.created_at DESC;

-- ===========================================
-- 5. ORPHANED SUBSCRIPTIONS
-- ===========================================

SELECT '=== ORPHANED SUBSCRIPTIONS ===' as section;

-- Subscriptions without valid users
SELECT 
  us.id as subscription_id,
  us.user_id,
  us.plan_id,
  us.status,
  us.created_at,
  'ORPHANED - NO AUTH USER' as issue
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE au.id IS NULL

UNION ALL

-- Subscriptions with invalid plan references
SELECT 
  us.id as subscription_id,
  us.user_id,
  us.plan_id,
  us.status,
  us.created_at,
  'INVALID PLAN REFERENCE' as issue
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- ===========================================
-- 6. RLS POLICY ANALYSIS
-- ===========================================

SELECT '=== RLS POLICY ANALYSIS ===' as section;

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
WHERE schemaname = 'public' 
  AND tablename IN ('subscription_plans', 'user_subscriptions', 'restaurant_subscriptions')
ORDER BY tablename, cmd;

-- ===========================================
-- 7. FOREIGN KEY CONSTRAINT CHECK
-- ===========================================

SELECT '=== FOREIGN KEY CONSTRAINT CHECK ===' as section;

-- Check for foreign key violations
SELECT 
  'user_subscriptions.user_id -> auth.users.id' as constraint_name,
  COUNT(*) as violation_count
FROM user_subscriptions us
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE au.id IS NULL

UNION ALL

SELECT 
  'user_subscriptions.plan_id -> subscription_plans.id' as constraint_name,
  COUNT(*) as violation_count
FROM user_subscriptions us
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE sp.id IS NULL;

-- ===========================================
-- 8. RECENT REGISTRATION ANALYSIS
-- ===========================================

SELECT '=== RECENT REGISTRATION ANALYSIS ===' as section;

-- Recent users and their subscription status
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  u.created_at as public_user_created_at,
  us.id as subscription_id,
  us.status as subscription_status,
  us.created_at as subscription_created_at,
  sp.name as plan_name,
  CASE 
    WHEN us.id IS NULL THEN 'MISSING SUBSCRIPTION'
    WHEN us.status NOT IN ('active', 'trial') THEN 'INVALID STATUS'
    WHEN NOW() > us.current_period_end THEN 'EXPIRED'
    ELSE 'OK'
  END as status_summary
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN user_subscriptions us ON au.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE au.created_at >= NOW() - INTERVAL '7 days'
ORDER BY au.created_at DESC;

-- ===========================================
-- 9. SUBSCRIPTION SERVICE SIMULATION
-- ===========================================

SELECT '=== SUBSCRIPTION SERVICE SIMULATION ===' as section;

-- Simulate what the SubscriptionService.getCurrentUserSubscription() would return
-- for the most recent user
WITH recent_user AS (
  SELECT id, email 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
)
SELECT 
  'SUBSCRIPTION SERVICE TEST' as test_type,
  ru.email as test_user_email,
  us.id as subscription_id,
  us.status,
  sp.name as plan_name,
  sp.features,
  CASE 
    WHEN us.id IS NULL THEN 'NO SUBSCRIPTION FOUND'
    WHEN us.status NOT IN ('active', 'trial') THEN 'INVALID STATUS'
    WHEN NOW() > us.current_period_end THEN 'EXPIRED'
    ELSE 'VALID SUBSCRIPTION'
  END as service_result
FROM recent_user ru
LEFT JOIN user_subscriptions us ON ru.id = us.user_id AND us.status IN ('active', 'trial')
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id;

-- ===========================================
-- 10. RECOMMENDATIONS
-- ===========================================

SELECT '=== RECOMMENDATIONS ===' as section;

-- Generate recommendations based on findings
SELECT 
  'RECOMMENDATION' as type,
  CASE 
    WHEN (SELECT COUNT(*) FROM subscription_plans) = 0 THEN 'Create subscription plans first'
    WHEN (SELECT COUNT(*) FROM user_subscriptions) = 0 THEN 'No subscriptions found - check registration process'
    WHEN (SELECT COUNT(*) FROM user_subscriptions us LEFT JOIN auth.users au ON us.user_id = au.id WHERE au.id IS NULL) > 0 THEN 'Fix orphaned subscriptions'
    WHEN (SELECT COUNT(*) FROM auth.users au LEFT JOIN user_subscriptions us ON au.id = us.user_id WHERE us.id IS NULL) > 0 THEN 'Create missing subscriptions for users'
    ELSE 'System appears to be working correctly'
  END as recommendation;
