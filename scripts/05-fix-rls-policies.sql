-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Public can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurant" ON restaurants;

-- Create more permissive policies for restaurants
CREATE POLICY "Anyone can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view all restaurants" ON restaurants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Restaurant owners can update their restaurant" ON restaurants
  FOR UPDATE TO authenticated USING (
    id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Restaurant owners can delete their restaurant" ON restaurants
  FOR DELETE TO authenticated USING (
    id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Fix users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Restaurant owners can manage their staff" ON users;

CREATE POLICY "Anyone can insert users during registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can view their restaurant staff" ON users
  FOR SELECT TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can manage their staff" ON users
  FOR ALL TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated USING (id = auth.uid());
