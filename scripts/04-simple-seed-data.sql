-- Clear existing data (optional - only run if you want to start fresh)
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM inventory_items;
-- DELETE FROM menu_items;
-- DELETE FROM categories;
-- DELETE FROM restaurants WHERE slug = 'bella-vista';

-- Insert sample restaurant
INSERT INTO restaurants (name, slug, description, address, phone, email, cuisine_type, opening_hours, theme_colors, is_active) 
VALUES ('Bella Vista Restaurant', 'bella-vista', 'Authentic Italian cuisine with a modern twist', '123 Main Street, Downtown', '+1 (555) 123-4567', 'info@bellavista.com', 'Italian', 
'{"monday": "11:00 AM - 10:00 PM", "tuesday": "11:00 AM - 10:00 PM", "wednesday": "11:00 AM - 10:00 PM", "thursday": "11:00 AM - 10:00 PM", "friday": "11:00 AM - 11:00 PM", "saturday": "11:00 AM - 11:00 PM", "sunday": "12:00 PM - 9:00 PM"}', 
'{"primary": "#dc2626", "secondary": "#059669"}', true);

-- Insert categories (using the restaurant we just created)
INSERT INTO categories (restaurant_id, name, description, display_order, is_active) 
SELECT id, 'Appetizers', 'Start your meal with our delicious appetizers', 1, true 
FROM restaurants WHERE slug = 'bella-vista';

INSERT INTO categories (restaurant_id, name, description, display_order, is_active) 
SELECT id, 'Main Courses', 'Our signature pasta dishes and entrees', 2, true 
FROM restaurants WHERE slug = 'bella-vista';

INSERT INTO categories (restaurant_id, name, description, display_order, is_active) 
SELECT id, 'Desserts', 'Sweet endings to your perfect meal', 3, true 
FROM restaurants WHERE slug = 'bella-vista';

-- Insert menu items
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) 
SELECT r.id, c.id, 'Bruschetta Classica', 'Toasted bread topped with fresh tomatoes, basil, and garlic', 8.50, '{"gluten"}', '{"vegetarian"}', 10, true, true, 1
FROM restaurants r, categories c 
WHERE r.slug = 'bella-vista' AND c.name = 'Appetizers' AND c.restaurant_id = r.id;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) 
SELECT r.id, c.id, 'Antipasto Platter', 'Selection of cured meats, cheeses, and marinated vegetables', 16.00, '{"dairy", "gluten"}', '{}', 5, true, false, 2
FROM restaurants r, categories c 
WHERE r.slug = 'bella-vista' AND c.name = 'Appetizers' AND c.restaurant_id = r.id;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) 
SELECT r.id, c.id, 'Spaghetti Carbonara', 'Classic Roman pasta with eggs, cheese, and pancetta', 18.00, '{"dairy", "eggs", "gluten"}', '{}', 15, true, true, 1
FROM restaurants r, categories c 
WHERE r.slug = 'bella-vista' AND c.name = 'Main Courses' AND c.restaurant_id = r.id;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) 
SELECT r.id, c.id, 'Margherita Pizza', 'Traditional pizza with tomato sauce, mozzarella, and fresh basil', 14.00, '{"dairy", "gluten"}', '{"vegetarian"}', 12, true, false, 2
FROM restaurants r, categories c 
WHERE r.slug = 'bella-vista' AND c.name = 'Main Courses' AND c.restaurant_id = r.id;

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) 
SELECT r.id, c.id, 'Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone', 7.50, '{"dairy", "eggs", "gluten"}', '{}', 5, true, true, 1
FROM restaurants r, categories c 
WHERE r.slug = 'bella-vista' AND c.name = 'Desserts' AND c.restaurant_id = r.id;

-- Insert inventory items
INSERT INTO inventory_items (restaurant_id, name, unit, current_stock, minimum_stock, cost_per_unit, supplier) 
SELECT id, 'Tomatoes', 'kg', 25.5, 10.0, 3.50, 'Fresh Produce Co.'
FROM restaurants WHERE slug = 'bella-vista';

INSERT INTO inventory_items (restaurant_id, name, unit, current_stock, minimum_stock, cost_per_unit, supplier) 
SELECT id, 'Mozzarella Cheese', 'kg', 8.2, 5.0, 12.00, 'Dairy Suppliers Ltd.'
FROM restaurants WHERE slug = 'bella-vista';

INSERT INTO inventory_items (restaurant_id, name, unit, current_stock, minimum_stock, cost_per_unit, supplier) 
SELECT id, 'Pasta (Spaghetti)', 'kg', 15.0, 8.0, 2.80, 'Italian Imports'
FROM restaurants WHERE slug = 'bella-vista';

-- Insert sample orders
INSERT INTO orders (restaurant_id, order_number, customer_name, customer_phone, table_number, order_type, status, subtotal, tax_amount, total_amount, notes) 
SELECT id, 'ORD-001', 'John Smith', '+1 (555) 987-6543', 5, 'dine-in', 'preparing', 34.00, 2.72, 36.72, 'Extra spicy'
FROM restaurants WHERE slug = 'bella-vista';

INSERT INTO orders (restaurant_id, order_number, customer_name, customer_phone, table_number, order_type, status, subtotal, tax_amount, total_amount, notes) 
SELECT id, 'ORD-002', 'Sarah Johnson', '+1 (555) 456-7890', null, 'takeaway', 'ready', 22.50, 1.80, 24.30, null
FROM restaurants WHERE slug = 'bella-vista';

-- Insert order items (this is more complex, so we'll use a simpler approach)
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) 
SELECT o.id, m.id, 1, 8.50, 8.50, null
FROM orders o, menu_items m 
WHERE o.order_number = 'ORD-001' AND m.name = 'Bruschetta Classica';

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) 
SELECT o.id, m.id, 1, 18.00, 18.00, 'Extra cheese'
FROM orders o, menu_items m 
WHERE o.order_number = 'ORD-001' AND m.name = 'Spaghetti Carbonara';

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) 
SELECT o.id, m.id, 1, 7.50, 7.50, null
FROM orders o, menu_items m 
WHERE o.order_number = 'ORD-001' AND m.name = 'Tiramisu';

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) 
SELECT o.id, m.id, 1, 14.00, 14.00, null
FROM orders o, menu_items m 
WHERE o.order_number = 'ORD-002' AND m.name = 'Margherita Pizza';

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) 
SELECT o.id, m.id, 1, 8.50, 8.50, null
FROM orders o, menu_items m 
WHERE o.order_number = 'ORD-002' AND m.name = 'Bruschetta Classica';
