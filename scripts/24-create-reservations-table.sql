-- Create reservations table
-- This table stores restaurant reservations with proper isolation by restaurant_id

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    special_requests TEXT,
    table_preference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_date ON reservations(restaurant_id, reservation_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_reservations_updated_at();

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reservations
-- Policy for restaurant owners to view their own reservations
CREATE POLICY "Restaurant owners can view their reservations" ON reservations
    FOR SELECT USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for restaurant owners to insert reservations (for manual creation)
CREATE POLICY "Restaurant owners can insert reservations" ON reservations
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for restaurant owners to update their reservations
CREATE POLICY "Restaurant owners can update their reservations" ON reservations
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for restaurant owners to delete their reservations
CREATE POLICY "Restaurant owners can delete their reservations" ON reservations
    FOR DELETE USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Policy for unauthenticated users to create reservations (for landing pages)
CREATE POLICY "Unauthenticated users can create reservations" ON reservations
    FOR INSERT WITH CHECK (true);

-- Add comments
COMMENT ON TABLE reservations IS 'Restaurant reservations table with restaurant isolation';
COMMENT ON COLUMN reservations.restaurant_id IS 'Foreign key to restaurants table - ensures reservation isolation';
COMMENT ON COLUMN reservations.party_size IS 'Number of people in the party';
COMMENT ON COLUMN reservations.status IS 'Reservation status: pending, confirmed, cancelled, completed';
COMMENT ON COLUMN reservations.table_preference IS 'Optional table preference (e.g., window, outdoor, etc.)'; 