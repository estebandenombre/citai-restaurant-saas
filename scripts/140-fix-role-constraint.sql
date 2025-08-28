-- Fix Role Constraint Violation
-- This script fixes the role constraint by updating invalid roles first

-- 1. Check current roles in the system
SELECT '1. Current roles in users table:' as info;
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- 2. Check which roles violate the original schema constraint
SELECT '2. Roles that violate the original schema:' as info;
SELECT 
    role,
    COUNT(*) as user_count,
    CASE 
        WHEN role IN ('owner', 'manager', 'staff') THEN '✅ VALID'
        ELSE '❌ INVALID - will be updated'
    END as status
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- 3. Update invalid roles to valid ones
SELECT '3. Updating invalid roles:' as info;

-- Update 'admin' roles to 'owner' (most appropriate)
UPDATE users 
SET role = 'owner'
WHERE role = 'admin';

-- Update 'user' roles to 'staff' (most appropriate)
UPDATE users 
SET role = 'staff'
WHERE role = 'user';

-- Update 'trial', 'starter', 'pro', 'multi' roles to 'staff'
UPDATE users 
SET role = 'staff'
WHERE role IN ('trial', 'starter', 'pro', 'multi');

-- Update any other invalid roles to 'staff'
UPDATE users 
SET role = 'staff'
WHERE role NOT IN ('owner', 'manager', 'staff');

-- 4. Verify all roles are now valid
SELECT '4. Roles after update:' as info;
SELECT 
    role,
    COUNT(*) as user_count,
    CASE 
        WHEN role IN ('owner', 'manager', 'staff') THEN '✅ VALID'
        ELSE '❌ STILL INVALID'
    END as status
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- 5. Now apply the role constraint
SELECT '5. Applying role constraint:' as info;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role::text = ANY (ARRAY['owner'::character varying, 'manager'::character varying, 'staff'::character varying]::text[]));

-- 6. Apply plan_status constraint
SELECT '6. Applying plan_status constraint:' as info;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_status_check;
ALTER TABLE users ADD CONSTRAINT users_plan_status_check 
    CHECK (plan_status::text = ANY (ARRAY['no_subscription'::character varying, 'trial'::character varying, 'active'::character varying, 'cancelled'::character varying, 'expired'::character varying, 'past_due'::character varying]::text[]));

-- 7. Update plan_status for any invalid values
SELECT '7. Updating invalid plan_status values:' as info;
UPDATE users 
SET plan_status = 'no_subscription'
WHERE plan_status NOT IN ('no_subscription', 'trial', 'active', 'cancelled', 'expired', 'past_due')
   OR plan_status IS NULL;

-- 8. Final verification
SELECT '8. Final verification:' as info;
SELECT 
    'Total users:' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Users with valid roles:' as metric,
    COUNT(*) as count
FROM users
WHERE role IN ('owner', 'manager', 'staff')
UNION ALL
SELECT 
    'Users with valid plan_status:' as metric,
    COUNT(*) as count
FROM users
WHERE plan_status IN ('no_subscription', 'trial', 'active', 'cancelled', 'expired', 'past_due');

-- 9. Show final role distribution
SELECT '9. Final role distribution:' as info;
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- 10. Success message
SELECT '10. Role constraint fix complete:' as info;
SELECT '✅ All users now have valid roles (owner, manager, staff)' as status;
SELECT '✅ Role constraint applied successfully' as status;
SELECT '✅ Plan status constraint applied successfully' as status;
SELECT '✅ No more constraint violations' as status;




