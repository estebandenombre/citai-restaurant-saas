-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url TEXT,
  cover_image_url TEXT,
  cuisine_type VARCHAR(100),
  opening_hours JSONB,
  social_media JSONB,
  theme_colors JSONB DEFAULT '{"primary": "#2563eb", "secondary": "#64748b"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (restaurant staff)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  allergens TEXT[],
  dietary_info TEXT[],
  ingredients TEXT[],
  preparation_time INTEGER, -- in minutes
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2),
  supplier VARCHAR(255),
  last_restocked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  table_number INTEGER,
  order_type VARCHAR(50) DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_shifts table
CREATE TABLE IF NOT EXISTS staff_shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 0, -- in minutes
  hourly_rate DECIMAL(8,2),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'started', 'break', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their restaurant data" ON restaurants
  FOR ALL USING (id = (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can only access their restaurant users" ON users
  FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can only access their restaurant categories" ON categories
  FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can only access their restaurant menu items" ON menu_items
  FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can only access their restaurant inventory" ON inventory_items
  FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can only access their restaurant orders" ON orders
  FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can only access their restaurant order items" ON order_items
  FOR ALL USING (order_id IN (SELECT id FROM orders WHERE restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid())));

CREATE POLICY "Users can only access their restaurant staff shifts" ON staff_shifts
  FOR ALL USING (restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid()));

-- Public access for restaurant landing pages
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = true AND restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true));

CREATE POLICY "Public can view available menu items" ON menu_items
  FOR SELECT USING (is_available = true AND restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true));
