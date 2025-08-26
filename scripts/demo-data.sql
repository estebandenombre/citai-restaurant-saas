-- Demo Data Script for Restaurant SaaS
-- This script creates a complete demo restaurant with realistic data
-- Run this in your Supabase SQL Editor

-- First, let's create a demo restaurant
INSERT INTO restaurants (
    id,
    name,
    slug,
    description,
    address,
    phone,
    email,
    website,
    cuisine_type,
    opening_hours,
    social_media,
    theme_colors,
    is_active
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'The Urban Bistro',
    'urban-bistro',
    'A modern American bistro serving fresh, locally-sourced ingredients with a creative twist on classic dishes.',
    '123 Main Street, Downtown, NY 10001',
    '+1 (555) 123-4567',
    'info@urbanbistro.com',
    'https://urbanbistro.com',
    'American Bistro',
    '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "23:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "21:00"}}',
    '{"instagram": "@urbanbistro", "facebook": "urbanbistro", "twitter": "@urbanbistro"}',
    '{"primary": "#1f2937", "secondary": "#6b7280"}',
    true
);

-- Create menu categories
INSERT INTO categories (restaurant_id, name, description, display_order, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Appetizers', 'Start your meal with our delicious appetizers', 1, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Main Courses', 'Our signature dishes made with fresh ingredients', 2, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Burgers & Sandwiches', 'Handcrafted burgers and gourmet sandwiches', 3, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Salads', 'Fresh and healthy salad options', 4, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Desserts', 'Sweet endings to your meal', 5, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Beverages', 'Refreshing drinks and cocktails', 6, true);

-- Get category IDs for menu items
DO $$
DECLARE
    appetizers_id uuid;
    main_courses_id uuid;
    burgers_id uuid;
    salads_id uuid;
    desserts_id uuid;
    beverages_id uuid;
BEGIN
    SELECT id INTO appetizers_id FROM categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Appetizers';
    SELECT id INTO main_courses_id FROM categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Main Courses';
    SELECT id INTO burgers_id FROM categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Burgers & Sandwiches';
    SELECT id INTO salads_id FROM categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Salads';
    SELECT id INTO desserts_id FROM categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Desserts';
    SELECT id INTO beverages_id FROM categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Beverages';

    -- Insert menu items
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, ingredients, preparation_time, is_available, is_featured, display_order) VALUES
        -- Appetizers
        ('550e8400-e29b-41d4-a716-446655440001', appetizers_id, 'Bruschetta', 'Toasted bread topped with fresh tomatoes, basil, and garlic', 8.50, ARRAY['gluten'], ARRAY['vegetarian'], ARRAY['bread', 'tomatoes', 'basil', 'garlic', 'olive oil'], 8, true, true, 1),
        ('550e8400-e29b-41d4-a716-446655440001', appetizers_id, 'Calamari', 'Crispy fried calamari served with marinara sauce', 12.00, ARRAY['gluten', 'seafood'], ARRAY['none']::text[], ARRAY['calamari', 'flour', 'oil', 'marinara sauce'], 10, true, false, 2),
        ('550e8400-e29b-41d4-a716-446655440001', appetizers_id, 'Spinach Artichoke Dip', 'Creamy dip with spinach and artichokes, served with tortilla chips', 10.50, ARRAY['dairy'], ARRAY['vegetarian'], ARRAY['spinach', 'artichokes', 'cream cheese', 'tortilla chips'], 12, true, false, 3),
        
        -- Main Courses
        ('550e8400-e29b-41d4-a716-446655440001', main_courses_id, 'Grilled Salmon', 'Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce', 24.00, ARRAY['fish'], ARRAY['gluten-free'], ARRAY['salmon', 'vegetables', 'lemon', 'butter'], 20, true, true, 1),
        ('550e8400-e29b-41d4-a716-446655440001', main_courses_id, 'Beef Tenderloin', '8oz tenderloin with garlic mashed potatoes and asparagus', 28.00, ARRAY['gluten'], ARRAY['none']::text[], ARRAY['beef', 'potatoes', 'asparagus', 'garlic'], 25, true, true, 2),
        ('550e8400-e29b-41d4-a716-446655440001', main_courses_id, 'Chicken Marsala', 'Pan-seared chicken with marsala wine sauce and mushrooms', 22.00, ARRAY['gluten'], ARRAY['none']::text[], ARRAY['chicken', 'marsala wine', 'mushrooms', 'pasta'], 18, true, false, 3),
        ('550e8400-e29b-41d4-a716-446655440001', main_courses_id, 'Vegetarian Pasta', 'Fettuccine with seasonal vegetables in a light cream sauce', 18.00, ARRAY['gluten', 'dairy'], ARRAY['vegetarian'], ARRAY['pasta', 'vegetables', 'cream', 'parmesan'], 15, true, false, 4),
        
        -- Burgers & Sandwiches
        ('550e8400-e29b-41d4-a716-446655440001', burgers_id, 'Classic Burger', '8oz beef patty with lettuce, tomato, and special sauce', 16.00, ARRAY['gluten'], ARRAY['none']::text[], ARRAY['beef', 'bun', 'lettuce', 'tomato', 'onion'], 12, true, false, 1),
        ('550e8400-e29b-41d4-a716-446655440001', burgers_id, 'Truffle Burger', 'Beef patty with truffle aioli, caramelized onions, and aged cheddar', 19.00, ARRAY['gluten', 'dairy'], ARRAY['none']::text[], ARRAY['beef', 'bun', 'truffle aioli', 'onions', 'cheddar'], 15, true, true, 2),
        ('550e8400-e29b-41d4-a716-446655440001', burgers_id, 'Chicken Club', 'Grilled chicken with bacon, lettuce, tomato, and mayo', 17.00, ARRAY['gluten'], ARRAY['none']::text[], ARRAY['chicken', 'bacon', 'lettuce', 'tomato', 'mayo'], 14, true, false, 3),
        
        -- Salads
        ('550e8400-e29b-41d4-a716-446655440001', salads_id, 'Caesar Salad', 'Romaine lettuce with parmesan cheese, croutons, and caesar dressing', 12.00, ARRAY['gluten', 'dairy'], ARRAY['vegetarian'], ARRAY['romaine', 'parmesan', 'croutons', 'caesar dressing'], 8, true, false, 1),
        ('550e8400-e29b-41d4-a716-446655440001', salads_id, 'Grilled Chicken Salad', 'Mixed greens with grilled chicken, cherry tomatoes, and balsamic vinaigrette', 15.00, ARRAY['gluten'], ARRAY['gluten-free'], ARRAY['mixed greens', 'chicken', 'tomatoes', 'balsamic'], 10, true, false, 2),
        
        -- Desserts
        ('550e8400-e29b-41d4-a716-446655440001', desserts_id, 'Chocolate Lava Cake', 'Warm chocolate cake with molten center, served with vanilla ice cream', 9.00, ARRAY['gluten', 'dairy', 'eggs'], ARRAY['vegetarian'], ARRAY['chocolate', 'flour', 'eggs', 'vanilla ice cream'], 8, true, true, 1),
        ('550e8400-e29b-41d4-a716-446655440001', desserts_id, 'Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream', 8.50, ARRAY['gluten', 'dairy', 'eggs'], ARRAY['vegetarian'], ARRAY['ladyfingers', 'mascarpone', 'coffee', 'cocoa'], 5, true, false, 2),
        
        -- Beverages
        ('550e8400-e29b-41d4-a716-446655440001', beverages_id, 'Fresh Lemonade', 'House-made lemonade with fresh lemons', 4.50, ARRAY['none']::text[], ARRAY['vegan', 'gluten-free'], ARRAY['lemons', 'sugar', 'water'], 3, true, false, 1),
        ('550e8400-e29b-41d4-a716-446655440001', beverages_id, 'Craft Beer', 'Selection of local craft beers', 6.00, ARRAY['gluten'], ARRAY['vegan'], ARRAY['beer'], 2, true, false, 2),
        ('550e8400-e29b-41d4-a716-446655440001', beverages_id, 'House Red Wine', 'Premium red wine selection', 8.00, ARRAY['none']::text[], ARRAY['vegan', 'gluten-free'], ARRAY['wine'], 2, true, false, 3);

END $$;

-- Create inventory items
INSERT INTO inventory_items (restaurant_id, name, unit, current_stock, minimum_stock, cost_per_unit, supplier, last_restocked) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Beef Tenderloin', 'lbs', 25.5, 10.0, 18.50, 'Premium Meats Co.', '2024-01-15 08:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Salmon Fillets', 'lbs', 15.0, 8.0, 12.75, 'Fresh Seafood Market', '2024-01-14 06:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Chicken Breast', 'lbs', 30.0, 15.0, 8.25, 'Local Poultry Farm', '2024-01-15 07:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Mixed Greens', 'lbs', 12.0, 5.0, 3.50, 'Fresh Farms', '2024-01-15 05:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Tomatoes', 'lbs', 20.0, 8.0, 2.25, 'Local Produce', '2024-01-14 04:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Onions', 'lbs', 25.0, 10.0, 1.75, 'Local Produce', '2024-01-14 04:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Garlic', 'lbs', 8.0, 3.0, 4.50, 'Local Produce', '2024-01-14 04:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Potatoes', 'lbs', 40.0, 20.0, 1.25, 'Local Produce', '2024-01-13 03:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Butter', 'lbs', 15.0, 8.0, 6.75, 'Dairy Delights', '2024-01-14 06:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Olive Oil', 'gallons', 5.0, 2.0, 25.00, 'Mediterranean Imports', '2024-01-10 09:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Flour', 'lbs', 50.0, 25.0, 2.50, 'Bakery Supplies', '2024-01-12 10:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Eggs', 'dozen', 20.0, 10.0, 4.25, 'Fresh Farms', '2024-01-15 05:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Milk', 'gallons', 8.0, 4.0, 4.50, 'Dairy Delights', '2024-01-15 06:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Cheese', 'lbs', 12.0, 6.0, 8.75, 'Dairy Delights', '2024-01-14 06:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Bacon', 'lbs', 8.0, 4.0, 7.50, 'Premium Meats Co.', '2024-01-14 08:00:00');

-- Create order settings
INSERT INTO order_settings (restaurant_id, order_enabled, pickup_enabled, delivery_enabled, table_service_enabled, require_name, require_phone, require_email, require_table_number, require_pickup_time, require_address, require_notes, pickup_time_slots, max_pickup_advance_hours, min_pickup_advance_minutes, auto_confirm_orders, allow_special_instructions, tax_enabled, tax_rate, tax_name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', true, true, false, true, true, true, false, true, true, false, true, ARRAY['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'], 24, 30, false, true, true, 8.5, 'Sales Tax');

-- Create demo users/staff
INSERT INTO users (restaurant_id, email, password_hash, first_name, last_name, role, is_active, has_completed_onboarding) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'owner@urbanbistro.com', '$2a$10$example_hash_owner', 'John', 'Smith', 'owner', true, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'manager@urbanbistro.com', '$2a$10$example_hash_manager', 'Sarah', 'Johnson', 'manager', true, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'chef@urbanbistro.com', '$2a$10$example_hash_chef', 'Michael', 'Chen', 'staff', true, true),
    ('550e8400-e29b-41d4-a716-446655440001', 'server@urbanbistro.com', '$2a$10$example_hash_server', 'Emily', 'Davis', 'staff', true, true);

-- Create demo orders (last 30 days)
INSERT INTO orders (restaurant_id, order_number, customer_name, customer_phone, customer_email, table_number, order_type, status, subtotal, tax_amount, total_amount, notes, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-001', 'Alice Johnson', '+1-555-0101', 'alice@email.com', 5, 'dine-in', 'completed', 45.50, 3.87, 49.37, 'Extra crispy calamari', '2024-01-15 18:30:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-002', 'Bob Wilson', '+1-555-0102', 'bob@email.com', NULL, 'pickup', 'completed', 32.00, 2.72, 34.72, 'No onions on burger', '2024-01-15 19:15:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-003', 'Carol Brown', '+1-555-0103', 'carol@email.com', 8, 'dine-in', 'completed', 67.50, 5.74, 73.24, 'Anniversary celebration', '2024-01-16 20:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-004', 'David Lee', '+1-555-0104', 'david@email.com', 3, 'dine-in', 'completed', 28.00, 2.38, 30.38, NULL, '2024-01-16 12:45:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-005', 'Emma Garcia', '+1-555-0105', 'emma@email.com', NULL, 'pickup', 'completed', 41.50, 3.53, 45.03, 'Extra napkins please', '2024-01-17 18:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-006', 'Frank Miller', '+1-555-0106', 'frank@email.com', 12, 'dine-in', 'completed', 89.00, 7.57, 96.57, 'Business dinner', '2024-01-17 19:30:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-007', 'Grace Taylor', '+1-555-0107', 'grace@email.com', 6, 'dine-in', 'completed', 54.50, 4.63, 59.13, 'Allergic to nuts', '2024-01-18 13:15:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-008', 'Henry Anderson', '+1-555-0108', 'henry@email.com', NULL, 'pickup', 'completed', 36.00, 3.06, 39.06, NULL, '2024-01-18 19:45:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-009', 'Ivy Martinez', '+1-555-0109', 'ivy@email.com', 9, 'dine-in', 'completed', 72.50, 6.16, 78.66, 'Birthday celebration', '2024-01-19 20:30:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-010', 'Jack Thompson', '+1-555-0110', 'jack@email.com', 4, 'dine-in', 'completed', 43.00, 3.66, 46.66, NULL, '2024-01-19 12:30:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-011', 'Kate White', '+1-555-0111', 'kate@email.com', NULL, 'pickup', 'completed', 29.50, 2.51, 32.01, 'Extra hot sauce', '2024-01-20 18:15:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-012', 'Liam Clark', '+1-555-0112', 'liam@email.com', 7, 'dine-in', 'completed', 81.00, 6.89, 87.89, 'Date night', '2024-01-20 19:00:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-013', 'Mia Rodriguez', '+1-555-0113', 'mia@email.com', 2, 'dine-in', 'completed', 38.50, 3.27, 41.77, NULL, '2024-01-21 13:45:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-014', 'Noah Lewis', '+1-555-0114', 'noah@email.com', NULL, 'pickup', 'completed', 47.00, 4.00, 51.00, 'Well done burger', '2024-01-21 19:30:00'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-015', 'Olivia Hall', '+1-555-0115', 'olivia@email.com', 10, 'dine-in', 'completed', 95.50, 8.12, 103.62, 'Family dinner', '2024-01-22 18:45:00');

-- Create order items for the orders
DO $$
DECLARE
    order1_id uuid;
    order2_id uuid;
    order3_id uuid;
    order4_id uuid;
    order5_id uuid;
    order6_id uuid;
    order7_id uuid;
    order8_id uuid;
    order9_id uuid;
    order10_id uuid;
    order11_id uuid;
    order12_id uuid;
    order13_id uuid;
    order14_id uuid;
    order15_id uuid;
    
    bruschetta_id uuid;
    calamari_id uuid;
    salmon_id uuid;
    beef_id uuid;
    burger_id uuid;
    truffle_burger_id uuid;
    caesar_id uuid;
    chicken_salad_id uuid;
    lava_cake_id uuid;
    tiramisu_id uuid;
    lemonade_id uuid;
    beer_id uuid;
    wine_id uuid;
BEGIN
    -- Get order IDs
    SELECT id INTO order1_id FROM orders WHERE order_number = 'UB-2024-001';
    SELECT id INTO order2_id FROM orders WHERE order_number = 'UB-2024-002';
    SELECT id INTO order3_id FROM orders WHERE order_number = 'UB-2024-003';
    SELECT id INTO order4_id FROM orders WHERE order_number = 'UB-2024-004';
    SELECT id INTO order5_id FROM orders WHERE order_number = 'UB-2024-005';
    SELECT id INTO order6_id FROM orders WHERE order_number = 'UB-2024-006';
    SELECT id INTO order7_id FROM orders WHERE order_number = 'UB-2024-007';
    SELECT id INTO order8_id FROM orders WHERE order_number = 'UB-2024-008';
    SELECT id INTO order9_id FROM orders WHERE order_number = 'UB-2024-009';
    SELECT id INTO order10_id FROM orders WHERE order_number = 'UB-2024-010';
    SELECT id INTO order11_id FROM orders WHERE order_number = 'UB-2024-011';
    SELECT id INTO order12_id FROM orders WHERE order_number = 'UB-2024-012';
    SELECT id INTO order13_id FROM orders WHERE order_number = 'UB-2024-013';
    SELECT id INTO order14_id FROM orders WHERE order_number = 'UB-2024-014';
    SELECT id INTO order15_id FROM orders WHERE order_number = 'UB-2024-015';
    
    -- Get menu item IDs
    SELECT id INTO bruschetta_id FROM menu_items WHERE name = 'Bruschetta';
    SELECT id INTO calamari_id FROM menu_items WHERE name = 'Calamari';
    SELECT id INTO salmon_id FROM menu_items WHERE name = 'Grilled Salmon';
    SELECT id INTO beef_id FROM menu_items WHERE name = 'Beef Tenderloin';
    SELECT id INTO burger_id FROM menu_items WHERE name = 'Classic Burger';
    SELECT id INTO truffle_burger_id FROM menu_items WHERE name = 'Truffle Burger';
    SELECT id INTO caesar_id FROM menu_items WHERE name = 'Caesar Salad';
    SELECT id INTO chicken_salad_id FROM menu_items WHERE name = 'Grilled Chicken Salad';
    SELECT id INTO lava_cake_id FROM menu_items WHERE name = 'Chocolate Lava Cake';
    SELECT id INTO tiramisu_id FROM menu_items WHERE name = 'Tiramisu';
    SELECT id INTO lemonade_id FROM menu_items WHERE name = 'Fresh Lemonade';
    SELECT id INTO beer_id FROM menu_items WHERE name = 'Craft Beer';
    SELECT id INTO wine_id FROM menu_items WHERE name = 'House Red Wine';
    
    -- Insert order items
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) VALUES
        -- Order 1
        (order1_id, calamari_id, 1, 12.00, 12.00, 'Extra crispy'),
        (order1_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order1_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order1_id, lemonade_id, 1, 4.50, 4.50, NULL),
        
        -- Order 2
        (order2_id, burger_id, 2, 16.00, 32.00, 'No onions'),
        
        -- Order 3
        (order3_id, bruschetta_id, 1, 8.50, 8.50, NULL),
        (order3_id, beef_id, 2, 28.00, 56.00, NULL),
        (order3_id, wine_id, 1, 8.00, 8.00, NULL),
        
        -- Order 4
        (order4_id, chicken_salad_id, 1, 15.00, 15.00, NULL),
        (order4_id, lemonade_id, 1, 4.50, 4.50, NULL),
        (order4_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 5
        (order5_id, truffle_burger_id, 1, 19.00, 19.00, NULL),
        (order5_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order5_id, beer_id, 1, 6.00, 6.00, NULL),
        (order5_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 6
        (order6_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order6_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order6_id, beef_id, 1, 28.00, 28.00, NULL),
        (order6_id, wine_id, 2, 8.00, 16.00, NULL),
        (order6_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 7
        (order7_id, bruschetta_id, 1, 8.50, 8.50, NULL),
        (order7_id, chicken_salad_id, 1, 15.00, 15.00, NULL),
        (order7_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order7_id, lemonade_id, 1, 4.50, 4.50, NULL),
        (order7_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 8
        (order8_id, burger_id, 1, 16.00, 16.00, NULL),
        (order8_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order8_id, beer_id, 1, 6.00, 6.00, NULL),
        
        -- Order 9
        (order9_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order9_id, beef_id, 2, 28.00, 56.00, NULL),
        (order9_id, wine_id, 1, 8.00, 8.00, NULL),
        (order9_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 10
        (order10_id, chicken_salad_id, 1, 15.00, 15.00, NULL),
        (order10_id, burger_id, 1, 16.00, 16.00, NULL),
        (order10_id, lemonade_id, 2, 4.50, 9.00, NULL),
        
        -- Order 11
        (order11_id, truffle_burger_id, 1, 19.00, 19.00, 'Extra hot sauce'),
        (order11_id, caesar_id, 1, 12.00, 12.00, NULL),
        
        -- Order 12
        (order12_id, bruschetta_id, 1, 8.50, 8.50, NULL),
        (order12_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order12_id, beef_id, 1, 28.00, 28.00, NULL),
        (order12_id, wine_id, 2, 8.00, 16.00, NULL),
        (order12_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 13
        (order13_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order13_id, chicken_salad_id, 1, 15.00, 15.00, NULL),
        (order13_id, lemonade_id, 1, 4.50, 4.50, NULL),
        (order13_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 14
        (order14_id, burger_id, 1, 16.00, 16.00, 'Well done'),
        (order14_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order14_id, beer_id, 1, 6.00, 6.00, NULL),
        (order14_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 15
        (order15_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order15_id, salmon_id, 2, 24.00, 48.00, NULL),
        (order15_id, beef_id, 1, 28.00, 28.00, NULL),
        (order15_id, wine_id, 1, 8.00, 8.00, NULL),
        (order15_id, lava_cake_id, 1, 9.00, 9.00, NULL);

END $$;

-- Create demo reservations
INSERT INTO reservations (restaurant_id, customer_name, customer_email, customer_phone, party_size, reservation_date, reservation_time, status, special_requests, table_preference) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Jennifer Adams', 'jennifer@email.com', '+1-555-0201', 4, '2024-01-25', '19:00', 'confirmed', 'Window table if possible', 'window'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Robert Wilson', 'robert@email.com', '+1-555-0202', 2, '2024-01-25', '20:30', 'confirmed', 'Anniversary celebration', 'quiet'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Lisa Chen', 'lisa@email.com', '+1-555-0203', 6, '2024-01-26', '18:00', 'confirmed', 'Business dinner', 'large'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Mark Johnson', 'mark@email.com', '+1-555-0204', 2, '2024-01-26', '19:30', 'pending', NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440001', 'Amanda Davis', 'amanda@email.com', '+1-555-0205', 8, '2024-01-27', '19:00', 'confirmed', 'Birthday party', 'large'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Thomas Brown', 'thomas@email.com', '+1-555-0206', 4, '2024-01-27', '20:00', 'confirmed', NULL, 'window'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Rachel Green', 'rachel@email.com', '+1-555-0207', 2, '2024-01-28', '18:30', 'pending', 'Vegetarian options needed', NULL),
    ('550e8400-e29b-41d4-a716-446655440001', 'Kevin Martinez', 'kevin@email.com', '+1-555-0208', 6, '2024-01-28', '19:00', 'confirmed', 'Business meeting', 'quiet'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Sophie Taylor', 'sophie@email.com', '+1-555-0209', 2, '2024-01-29', '20:00', 'confirmed', 'Date night', 'window'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Daniel Lee', 'daniel@email.com', '+1-555-0210', 4, '2024-01-29', '19:30', 'pending', NULL, NULL);

-- Create demo staff shifts
INSERT INTO staff_shifts (restaurant_id, user_id, shift_date, start_time, end_time, break_duration, hourly_rate, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM users WHERE email = 'chef@urbanbistro.com'), '2024-01-25', '08:00', '16:00', 30, 18.00, 'scheduled'),
    ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM users WHERE email = 'server@urbanbistro.com'), '2024-01-25', '10:00', '18:00', 30, 12.00, 'scheduled'),
    ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM users WHERE email = 'chef@urbanbistro.com'), '2024-01-26', '08:00', '16:00', 30, 18.00, 'scheduled'),
    ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM users WHERE email = 'server@urbanbistro.com'), '2024-01-26', '10:00', '18:00', 30, 12.00, 'scheduled'),
    ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM users WHERE email = 'manager@urbanbistro.com'), '2024-01-25', '09:00', '17:00', 60, 22.00, 'scheduled'),
    ('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM users WHERE email = 'manager@urbanbistro.com'), '2024-01-26', '09:00', '17:00', 60, 22.00, 'scheduled');

-- Display summary of created data
SELECT 'Restaurant created' as item, 'The Urban Bistro' as details
UNION ALL
SELECT 'Categories created', (SELECT COUNT(*)::text FROM categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
UNION ALL
SELECT 'Menu items created', (SELECT COUNT(*)::text FROM menu_items WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
UNION ALL
SELECT 'Inventory items created', (SELECT COUNT(*)::text FROM inventory_items WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
UNION ALL
SELECT 'Orders created', (SELECT COUNT(*)::text FROM orders WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
UNION ALL
SELECT 'Order items created', (SELECT COUNT(*)::text FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
UNION ALL
SELECT 'Reservations created', (SELECT COUNT(*)::text FROM reservations WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
UNION ALL
SELECT 'Staff members created', (SELECT COUNT(*)::text FROM users WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
UNION ALL
SELECT 'Staff shifts created', (SELECT COUNT(*)::text FROM staff_shifts WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
ORDER BY item; 