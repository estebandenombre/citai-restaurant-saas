-- Update admin password with proper hash
-- This script updates the admin user with a properly hashed password

-- First, let's check if the admin user exists
SELECT * FROM admin_users WHERE email = 'admin@tably.com';

-- Update the admin password (this is a bcrypt hash for 'admin123')
-- In production, you should generate this hash properly
UPDATE admin_users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@tably.com';

-- Verify the update
SELECT email, first_name, last_name, role, is_active FROM admin_users WHERE email = 'admin@tably.com';

-- If no admin user exists, create one
INSERT INTO admin_users (email, password_hash, first_name, last_name, role) 
VALUES (
  'admin@tably.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 'admin123' hashed
  'Admin', 
  'User', 
  'super_admin'
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = true;

-- Final verification
SELECT 
  email, 
  first_name, 
  last_name, 
  role, 
  is_active,
  created_at,
  updated_at
FROM admin_users 
WHERE email = 'admin@tably.com';
