-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users on restaurants" ON restaurants;
DROP POLICY IF EXISTS "Enable all operations for restaurant owners on restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view active restaurants" ON restaurants;

DROP POLICY IF EXISTS "Users can manage their own data" ON users;
DROP POLICY IF EXISTS "Restaurant owners can manage their staff" ON users;

DROP POLICY IF EXISTS "Users can manage their restaurant categories" ON categories;
DROP POLICY IF EXISTS "Public can view active categories" ON categories;

DROP POLICY IF EXISTS "Users can manage their restaurant menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;

DROP POLICY IF EXISTS "Users can manage their restaurant inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can manage their restaurant orders" ON orders;
DROP POLICY IF EXISTS "Users can manage their restaurant order items" ON order_items;
DROP POLICY IF EXISTS "Users can manage their restaurant staff shifts" ON staff_shifts;

-- Create RLS policies for restaurants
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view restaurants" ON restaurants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own restaurant" ON restaurants
  FOR UPDATE TO authenticated USING (
    id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Create RLS policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Restaurant owners can manage their staff" ON users
  FOR ALL TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Create RLS policies for categories
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (
    is_active = true AND 
    restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true)
  );

CREATE POLICY "Users can manage their restaurant categories" ON categories
  FOR ALL TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid()
    )
  );

-- Create RLS policies for menu_items
CREATE POLICY "Public can view available menu items" ON menu_items
  FOR SELECT USING (
    is_available = true AND 
    restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true)
  );

CREATE POLICY "Users can manage their restaurant menu items" ON menu_items
  FOR ALL TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid()
    )
  );

-- Create RLS policies for inventory_items
CREATE POLICY "Users can manage their restaurant inventory" ON inventory_items
  FOR ALL TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid()
    )
  );

-- Create RLS policies for orders
CREATE POLICY "Users can manage their restaurant orders" ON orders
  FOR ALL TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid()
    )
  );

-- Create RLS policies for order_items
CREATE POLICY "Users can manage their restaurant order items" ON order_items
  FOR ALL TO authenticated USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM users 
        WHERE id = auth.uid()
      )
    )
  );

-- Create RLS policies for staff_shifts
CREATE POLICY "Users can manage their restaurant staff shifts" ON staff_shifts
  FOR ALL TO authenticated USING (
    restaurant_id IN (
      SELECT restaurant_id FROM users 
      WHERE id = auth.uid()
    )
  );
