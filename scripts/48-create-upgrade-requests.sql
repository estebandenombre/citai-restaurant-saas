-- Create upgrade requests system
-- This allows users to request plan upgrades that need admin approval

-- Table for upgrade requests
CREATE TABLE IF NOT EXISTS upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  requested_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reason TEXT,
  admin_notes TEXT,
  admin_user_id UUID, -- Admin who processed the request
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Table for admin users (SaaS owner/administrators)
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user_id ON upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_created_at ON upgrade_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for upgrade_requests
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

-- RLS Policies for admin_users (only super admins can access)
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'super_admin'
    )
  );

-- Insert default super admin (you should change this password)
INSERT INTO admin_users (email, password_hash, first_name, last_name, role) 
VALUES (
  'admin@tably.com', 
  '$2a$10$your_hashed_password_here', -- Change this to a proper hash
  'Admin', 
  'User', 
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_upgrade_requests_updated_at 
  BEFORE UPDATE ON upgrade_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
