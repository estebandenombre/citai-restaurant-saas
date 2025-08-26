-- Check and create upgrade request tables if they don't exist

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('upgrade_requests', 'admin_users') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('upgrade_requests', 'admin_users');

-- Create upgrade_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_plan_id UUID NOT NULL,
  requested_plan_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reason TEXT,
  admin_notes TEXT,
  admin_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key for user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upgrade_requests_user_id_fkey'
  ) THEN
    ALTER TABLE upgrade_requests 
    ADD CONSTRAINT upgrade_requests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for current_plan_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upgrade_requests_current_plan_id_fkey'
  ) THEN
    ALTER TABLE upgrade_requests 
    ADD CONSTRAINT upgrade_requests_current_plan_id_fkey 
    FOREIGN KEY (current_plan_id) REFERENCES subscription_plans(id);
  END IF;

  -- Add foreign key for requested_plan_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'upgrade_requests_requested_plan_id_fkey'
  ) THEN
    ALTER TABLE upgrade_requests 
    ADD CONSTRAINT upgrade_requests_requested_plan_id_fkey 
    FOREIGN KEY (requested_plan_id) REFERENCES subscription_plans(id);
  END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user_id ON upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_created_at ON upgrade_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Users can create their own upgrade requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON upgrade_requests;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Create RLS policies
CREATE POLICY "Users can view their own upgrade requests" ON upgrade_requests
  FOR SELECT TO authenticated USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can create their own upgrade requests" ON upgrade_requests
  FOR INSERT TO authenticated WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can update their own pending requests" ON upgrade_requests
  FOR UPDATE TO authenticated USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    ) AND status = 'pending'
  );

CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'super_admin'
    )
  );

-- Insert default admin user if it doesn't exist
INSERT INTO admin_users (email, password_hash, first_name, last_name, role) 
VALUES (
  'admin@tably.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 'admin123' hashed
  'Admin', 
  'User', 
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS update_upgrade_requests_updated_at ON upgrade_requests;
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;

CREATE TRIGGER update_upgrade_requests_updated_at 
  BEFORE UPDATE ON upgrade_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify everything is set up correctly
SELECT '✅ Tables created successfully' as status;

-- Show final table status
SELECT 
  table_name,
  '✅ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('upgrade_requests', 'admin_users');
