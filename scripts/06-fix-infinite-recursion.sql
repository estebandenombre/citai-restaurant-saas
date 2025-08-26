-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can view all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can update their restaurant" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can delete their restaurant" ON restaurants;

DROP POLICY IF EXISTS "Anyone can insert users during registration" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view their restaurant staff" ON users;
DROP POLICY IF EXISTS "Restaurant owners can manage their staff" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

DROP POLICY IF EXISTS "Users can manage their restaurant categories" ON categories;
DROP POLICY IF EXISTS "Public can view active categories" ON categories;

DROP POLICY IF EXISTS "Users can manage their restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;

DROP POLICY IF EXISTS "Users can manage their restaurant inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can manage their restaurant orders" ON orders;
DROP POLICY IF EXISTS "Users can manage their restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Users can manage their restaurant staff shifts" ON staff_shifts;

-- Create simple, non-recursive policies for restaurants
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view restaurants" ON restaurants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update restaurants" ON restaurants
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete restaurants" ON restaurants
  FOR DELETE TO authenticated USING (true);

-- Create simple policies for users table (no self-referencing)
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update users" ON users
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete users" ON users
  FOR DELETE TO authenticated USING (true);

-- Simple policies for categories
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" ON categories
  FOR ALL TO authenticated USING (true);

-- Simple policies for menu_items
CREATE POLICY "Public can view available menu items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can manage menu items" ON menu_items
  FOR ALL TO authenticated USING (true);

-- Simple policies for other tables
CREATE POLICY "Authenticated users can manage inventory" ON inventory_items
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage orders" ON orders
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage order items" ON order_items
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage staff shifts" ON staff_shifts
  FOR ALL TO authenticated USING (true);
