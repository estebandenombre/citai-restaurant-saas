-- Create test restaurant
INSERT INTO restaurants (id, name, slug, description, address, phone, email, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test Restaurant',
  'test-restaurant',
  'A test restaurant for development',
  '123 Test Street, Test City',
  '+1234567890',
  'test@restaurant.com',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Create test user (password: test123)
INSERT INTO users (id, restaurant_id, email, password_hash, first_name, last_name, role, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'test@restaurant.com',
  '$2a$10$rQZ8KJ9LmN2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M',
  'Test',
  'User',
  'owner',
  true
) ON CONFLICT (email) DO NOTHING;

-- Create test categories
INSERT INTO categories (id, restaurant_id, name, description, display_order, is_active)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Appetizers', 'Starters and small plates', 1, true),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Main Courses', 'Main dishes', 2, true),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Desserts', 'Sweet treats', 3, true)
ON CONFLICT DO NOTHING;

-- Create test menu items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, allergens, is_available, is_featured)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Bruschetta', 'Toasted bread with tomatoes and herbs', 8.99, ARRAY['gluten'], true, false),
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Grilled Salmon', 'Fresh salmon with vegetables', 24.99, ARRAY['fish'], true, true),
  ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Tiramisu', 'Classic Italian dessert', 12.99, ARRAY['dairy', 'gluten'], true, false)
ON CONFLICT DO NOTHING; 