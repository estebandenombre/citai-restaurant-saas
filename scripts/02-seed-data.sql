-- Insert sample restaurant
INSERT INTO restaurants (id, name, slug, description, address, phone, email, cuisine_type, opening_hours, theme_colors, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Bella Vista Restaurant', 'bella-vista', 'Authentic Italian cuisine with a modern twist', '123 Main Street, Downtown', '+1 (555) 123-4567', 'info@bellavista.com', 'Italian', '{"monday": "11:00 AM - 10:00 PM", "tuesday": "11:00 AM - 10:00 PM", "wednesday": "11:00 AM - 10:00 PM", "thursday": "11:00 AM - 10:00 PM", "friday": "11:00 AM - 11:00 PM", "saturday": "11:00 AM - 11:00 PM", "sunday": "12:00 PM - 9:00 PM"}', '{"primary": "#dc2626", "secondary": "#059669"}', true);

-- Insert sample user (owner)
INSERT INTO users (id, restaurant_id, email, password_hash, first_name, last_name, role, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'owner@bellavista.com', '$2a$10$example_hash', 'Marco', 'Rossi', 'owner', true);

-- Insert sample categories
INSERT INTO categories (id, restaurant_id, name, description, display_order, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Appetizers', 'Start your meal with our delicious appetizers', 1, true),
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Main Courses', 'Our signature pasta dishes and entrees', 2, true),
('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Desserts', 'Sweet endings to your perfect meal', 3, true);

-- Insert sample menu items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) VALUES
('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Bruschetta Classica', 'Toasted bread topped with fresh tomatoes, basil, and garlic', 8.50, '{"gluten"}', '{"vegetarian"}', 10, true, true, 1),
('bb0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'Antipasto Platter', 'Selection of cured meats, cheeses, and marinated vegetables', 16.00, '{"dairy", "gluten"}', '{}', 5, true, false, 2),
('cc0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 'Spaghetti Carbonara', 'Classic Roman pasta with eggs, cheese, and pancetta', 18.00, '{"dairy", "eggs", "gluten"}', '{}', 15, true, true, 1),
('dd0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 'Margherita Pizza', 'Traditional pizza with tomato sauce, mozzarella, and fresh basil', 14.00, '{"dairy", "gluten"}', '{"vegetarian"}', 12, true, false, 2),
('ee0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone', 7.50, '{"dairy", "eggs", "gluten"}', '{}', 5, true, true, 1);

-- Insert sample inventory items
INSERT INTO inventory_items (id, restaurant_id, name, unit, current_stock, minimum_stock, cost_per_unit, supplier) VALUES
('ff0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Tomatoes', 'kg', 25.5, 10.0, 3.50, 'Fresh Produce Co.'),
('gg0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Mozzarella Cheese', 'kg', 8.2, 5.0, 12.00, 'Dairy Suppliers Ltd.'),
('hh0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Pasta (Spaghetti)', 'kg', 15.0, 8.0, 2.80, 'Italian Imports');

-- Insert sample orders
INSERT INTO orders (id, restaurant_id, order_number, customer_name, customer_phone, table_number, order_type, status, subtotal, tax_amount, total_amount, notes) VALUES
('ii0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'ORD-001', 'John Smith', '+1 (555) 987-6543', 5, 'dine-in', 'preparing', 32.50, 2.60, 35.10, 'Extra spicy'),
('jj0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'ORD-002', 'Sarah Johnson', '+1 (555) 456-7890', null, 'takeaway', 'ready', 22.50, 1.80, 24.30, null);

-- Insert sample order items
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) VALUES
('kk0e8400-e29b-41d4-a716-446655440000', 'ii0e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440000', 1, 8.50, 8.50, null),
('ll0e8400-e29b-41d4-a716-446655440000', 'ii0e8400-e29b-41d4-a716-446655440000', 'cc0e8400-e29b-41d4-a716-446655440000', 1, 18.00, 18.00, 'Extra cheese'),
('mm0e8400-e29b-41d4-a716-446655440000', 'ii0e8400-e29b-41d4-a716-446655440000', 'ee0e8400-e29b-41d4-a716-446655440000', 1, 7.50, 7.50, null),
('nn0e8400-e29b-41d4-a716-446655440000', 'jj0e8400-e29b-41d4-a716-446655440000', 'dd0e8400-e29b-41d4-a716-446655440000', 1, 14.00, 14.00, null),
('oo0e8400-e29b-41d4-a716-446655440000', 'jj0e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440000', 1, 8.50, 8.50, null);
