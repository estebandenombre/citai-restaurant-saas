-- Get admin user ID for upgrade request approval
-- This script helps identify the correct admin user ID

-- 1. Check admin users in the system
SELECT 'Admin users in the system:' as info;
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM admin_users
ORDER BY created_at DESC;

-- 2. Get the first active admin user ID
SELECT 'First active admin user ID:' as info;
SELECT 
  id as admin_user_id,
  email,
  first_name,
  last_name
FROM admin_users
WHERE is_active = true
ORDER BY created_at ASC
LIMIT 1;

-- 3. If no admin users exist, create one
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@tably.com') THEN
    INSERT INTO admin_users (email, password_hash, first_name, last_name, role, is_active)
    VALUES (
      'admin@tably.com',
      '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
      'Admin',
      'User',
      'admin',
      true
    );
    RAISE NOTICE 'Created admin user: admin@tably.com';
  ELSE
    RAISE NOTICE 'Admin user already exists: admin@tably.com';
  END IF;
END $$;

-- 4. Show the admin user ID to use in the code
SELECT 'Use this admin_user_id in your code:' as info;
SELECT 
  id as admin_user_id,
  email,
  first_name,
  last_name
FROM admin_users
WHERE email = 'admin@tably.com'
LIMIT 1;
