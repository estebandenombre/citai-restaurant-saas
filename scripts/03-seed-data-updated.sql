-- Insert sample restaurant
INSERT INTO restaurants (name, slug, description, address, phone, email, cuisine_type, opening_hours, theme_colors, is_active) VALUES
('Bella Vista Restaurant', 'bella-vista', 'Authentic Italian cuisine with a modern twist', '123 Main Street, Downtown', '+1 (555) 123-4567', 'info@bellavista.com', 'Italian', '{"monday": "11:00 AM - 10:00 PM", "tuesday": "11:00 AM - 10:00 PM", "wednesday": "11:00 AM - 10:00 PM", "thursday": "11:00 AM - 10:00 PM", "friday": "11:00 AM - 11:00 PM", "saturday": "11:00 AM - 11:00 PM", "sunday": "12:00 PM - 9:00 PM"}', '{"primary": "#dc2626", "secondary": "#059669"}', true);

-- Get the restaurant ID for subsequent inserts
DO $$
DECLARE
    restaurant_uuid UUID;
    appetizers_uuid UUID;
    mains_uuid UUID;
    desserts_uuid UUID;
    bruschetta_uuid UUID;
    antipasto_uuid UUID;
    carbonara_uuid UUID;
    pizza_uuid UUID;
    tiramisu_uuid UUID;
    order1_uuid UUID;
    order2_uuid UUID;
BEGIN
    -- Get the restaurant ID
    SELECT id INTO restaurant_uuid FROM restaurants WHERE slug = 'bella-vista';
    
    -- Insert categories and get their IDs
    INSERT INTO categories (restaurant_id, name, description, display_order, is_active) VALUES
    (restaurant_uuid, 'Appetizers', 'Start your meal with our delicious appetizers', 1, true)
    RETURNING id INTO appetizers_uuid;
    
    INSERT INTO categories (restaurant_id, name, description, display_order, is_active) VALUES
    (restaurant_uuid, 'Main Courses', 'Our signature pasta dishes and entrees', 2, true)
    RETURNING id INTO mains_uuid;
    
    INSERT INTO categories (restaurant_id, name, description, display_order, is_active) VALUES
    (restaurant_uuid, 'Desserts', 'Sweet endings to your perfect meal', 3, true)
    RETURNING id INTO desserts_uuid;

    -- Insert menu items and get their IDs
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) VALUES
    (restaurant_uuid, appetizers_uuid, 'Bruschetta Classica', 'Toasted bread topped with fresh tomatoes, basil, and garlic', 8.50, '{"gluten"}', '{"vegetarian"}', 10, true, true, 1)
    RETURNING id INTO bruschetta_uuid;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) VALUES
    (restaurant_uuid, appetizers_uuid, 'Antipasto Platter', 'Selection of cured meats, cheeses, and marinated vegetables', 16.00, '{"dairy", "gluten"}', '{}', 5, true, false, 2)
    RETURNING id INTO antipasto_uuid;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) VALUES
    (restaurant_uuid, mains_uuid, 'Spaghetti Carbonara', 'Classic Roman pasta with eggs, cheese, and pancetta', 18.00, '{"dairy", "eggs", "gluten"}', '{}', 15, true, true, 1)
    RETURNING id INTO carbonara_uuid;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) VALUES
    (restaurant_uuid, mains_uuid, 'Margherita Pizza', 'Traditional pizza with tomato sauce, mozzarella, and fresh basil', 14.00, '{"dairy", "gluten"}', '{"vegetarian"}', 12, true, false, 2)
    RETURNING id INTO pizza_uuid;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order) VALUES
    (restaurant_uuid, desserts_uuid, 'Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone', 7.50, '{"dairy", "eggs", "gluten"}', '{}', 5, true, true, 1)
    RETURNING id INTO tiramisu_uuid;

    -- Insert inventory items
    INSERT INTO inventory_items (restaurant_id, name, unit, current_stock, minimum_stock, cost_per_unit, supplier) VALUES
    (restaurant_uuid, 'Tomatoes', 'kg', 25.5, 10.0, 3.50, 'Fresh Produce Co.'),
    (restaurant_uuid, 'Mozzarella Cheese', 'kg', 8.2, 5.0, 12.00, 'Dairy Suppliers Ltd.'),
    (restaurant_uuid, 'Pasta (Spaghetti)', 'kg', 15.0, 8.0, 2.80, 'Italian Imports');

    -- Insert sample orders and get their IDs
    INSERT INTO orders (restaurant_id, order_number, customer_name, customer_phone, table_number, order_type, status, subtotal, tax_amount, total_amount, notes) VALUES
    (restaurant_uuid, 'ORD-001', 'John Smith', '+1 (555) 987-6543', 5, 'dine-in', 'preparing', 34.00, 2.72, 36.72, 'Extra spicy')
    RETURNING id INTO order1_uuid;
    
    INSERT INTO orders (restaurant_id, order_number, customer_name, customer_phone, table_number, order_type, status, subtotal, tax_amount, total_amount, notes) VALUES
    (restaurant_uuid, 'ORD-002', 'Sarah Johnson', '+1 (555) 456-7890', null, 'takeaway', 'ready', 22.50, 1.80, 24.30, null)
    RETURNING id INTO order2_uuid;

    -- Insert order items
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) VALUES
    (order1_uuid, bruschetta_uuid, 1, 8.50, 8.50, null),
    (order1_uuid, carbonara_uuid, 1, 18.00, 18.00, 'Extra cheese'),
    (order1_uuid, tiramisu_uuid, 1, 7.50, 7.50, null),
    (order2_uuid, pizza_uuid, 1, 14.00, 14.00, null),
    (order2_uuid, bruschetta_uuid, 1, 8.50, 8.50, null);

END $$;
