-- Create upgrade requests table
-- This script creates a table to store user upgrade requests

-- 1. Create upgrade_requests table
CREATE TABLE IF NOT EXISTS upgrade_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    current_plan TEXT,
    requested_plan TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user_id ON upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_created_at ON upgrade_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user_email ON upgrade_requests(user_email);

-- 3. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Create trigger for updated_at
CREATE TRIGGER update_upgrade_requests_updated_at 
    BEFORE UPDATE ON upgrade_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable RLS
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Users can view their own requests
CREATE POLICY "Users can view own upgrade requests" ON upgrade_requests
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Users can insert their own requests
CREATE POLICY "Users can create upgrade requests" ON upgrade_requests
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests" ON upgrade_requests
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
        ) AND status = 'pending'
    );

-- Admin users can manage all requests
CREATE POLICY "Admin can manage all upgrade requests" ON upgrade_requests
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM users WHERE role = 'admin'
        )
    );

-- 7. Show table structure
SELECT 'Upgrade requests table created:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'upgrade_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Show RLS policies
SELECT 'RLS policies created:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'upgrade_requests';

-- 9. Instructions for managing upgrade requests
SELECT 'UPGRADE REQUEST MANAGEMENT:' as info;
SELECT '1. View all pending requests:' as instruction;
SELECT '   SELECT * FROM upgrade_requests WHERE status = "pending" ORDER BY created_at DESC;' as example;
SELECT '' as blank;
SELECT '2. Approve a request:' as instruction;
SELECT '   UPDATE upgrade_requests SET status = "approved", processed_at = NOW(), processed_by = (SELECT id FROM users WHERE email = "admin@example.com") WHERE id = "request_id";' as example;
SELECT '' as blank;
SELECT '3. Reject a request:' as instruction;
SELECT '   UPDATE upgrade_requests SET status = "rejected", admin_notes = "Reason for rejection", processed_at = NOW() WHERE id = "request_id";' as example;
SELECT '' as blank;
SELECT '4. Mark as completed (after plan change):' as instruction;
SELECT '   UPDATE upgrade_requests SET status = "completed" WHERE id = "request_id";' as example;
