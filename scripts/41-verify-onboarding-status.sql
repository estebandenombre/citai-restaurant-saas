-- Verify onboarding status and fix any issues
-- This script checks the onboarding status for all users

-- Check current onboarding status for all users
SELECT 
  'CURRENT ONBOARDING STATUS' as info_type,
  u.email,
  u.first_name,
  u.last_name,
  u.has_completed_onboarding,
  u.created_at,
  CASE 
    WHEN u.has_completed_onboarding IS NULL THEN 'NULL - NEEDS FIX'
    WHEN u.has_completed_onboarding = false THEN 'FALSE - WILL SEE TUTORIAL'
    WHEN u.has_completed_onboarding = true THEN 'TRUE - WONT SEE TUTORIAL'
    ELSE 'UNKNOWN'
  END as status_description
FROM users u
ORDER BY u.created_at DESC;

-- Fix users with NULL onboarding status (set to true for existing users)
UPDATE users 
SET has_completed_onboarding = true 
WHERE has_completed_onboarding IS NULL
AND created_at < NOW() - INTERVAL '1 day'; -- Only fix users created more than 1 day ago

-- Set new users (created today) to false so they see the tutorial
UPDATE users 
SET has_completed_onboarding = false 
WHERE has_completed_onboarding IS NULL
AND created_at >= NOW() - INTERVAL '1 day';

-- Verify the fixes
SELECT 
  'AFTER FIXES' as info_type,
  u.email,
  u.first_name,
  u.last_name,
  u.has_completed_onboarding,
  u.created_at,
  CASE 
    WHEN u.has_completed_onboarding = false THEN 'FALSE - WILL SEE TUTORIAL'
    WHEN u.has_completed_onboarding = true THEN 'TRUE - WONT SEE TUTORIAL'
    ELSE 'UNKNOWN'
  END as status_description
FROM users u
ORDER BY u.created_at DESC;

-- Count users by onboarding status
SELECT 
  'SUMMARY' as info_type,
  has_completed_onboarding,
  COUNT(*) as user_count,
  CASE 
    WHEN has_completed_onboarding = false THEN 'Will see tutorial'
    WHEN has_completed_onboarding = true THEN 'Wont see tutorial'
    ELSE 'Unknown'
  END as description
FROM users 
GROUP BY has_completed_onboarding
ORDER BY has_completed_onboarding;
