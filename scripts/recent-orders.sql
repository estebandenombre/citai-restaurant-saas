-- Recent Orders for Demo Restaurant
-- This script adds recent orders (last 7 days) for the demo restaurant
-- Run this after the main demo-data-fixed.sql script

-- Add recent orders (last 7 days)
INSERT INTO orders (restaurant_id, order_number, customer_name, customer_phone, customer_email, table_number, order_type, status, subtotal, tax_amount, total_amount, notes, created_at) VALUES
    -- Today's orders
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-016', 'Sophia Chen', '+1-555-0201', 'sophia@email.com', 4, 'dine-in', 'preparing', 52.50, 4.46, 56.96, 'Gluten-free options needed', NOW() - INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-017', 'Alex Rodriguez', '+1-555-0202', 'alex@email.com', NULL, 'takeaway', 'ready', 38.00, 3.23, 41.23, 'Extra napkins', NOW() - INTERVAL '1 hour'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-018', 'Emma Wilson', '+1-555-0203', 'emma@email.com', 7, 'dine-in', 'confirmed', 67.50, 5.74, 73.24, 'Birthday celebration', NOW() - INTERVAL '30 minutes'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-019', 'Michael Brown', '+1-555-0204', 'michael@email.com', 2, 'dine-in', 'pending', 45.00, 3.83, 48.83, NULL, NOW() - INTERVAL '15 minutes'),
    
    -- Yesterday's orders
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-020', 'Isabella Davis', '+1-555-0205', 'isabella@email.com', 6, 'dine-in', 'served', 78.50, 6.67, 85.17, 'Anniversary dinner', NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-021', 'James Miller', '+1-555-0206', 'james@email.com', NULL, 'takeaway', 'served', 29.50, 2.51, 32.01, 'Well done burger', NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-022', 'Olivia Garcia', '+1-555-0207', 'olivia@email.com', 9, 'dine-in', 'served', 89.00, 7.57, 96.57, 'Business meeting', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
    
    -- 2 days ago
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-023', 'William Johnson', '+1-555-0208', 'william@email.com', 3, 'dine-in', 'served', 54.50, 4.63, 59.13, 'Date night', NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-024', 'Ava Martinez', '+1-555-0209', 'ava@email.com', NULL, 'takeaway', 'served', 41.00, 3.49, 44.49, 'Extra hot sauce', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    
    -- 3 days ago
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-025', 'Ethan Taylor', '+1-555-0210', 'ethan@email.com', 8, 'dine-in', 'served', 72.50, 6.16, 78.66, 'Family dinner', NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-026', 'Mia Anderson', '+1-555-0211', 'mia@email.com', NULL, 'takeaway', 'served', 36.00, 3.06, 39.06, 'No onions', NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
    
    -- 4 days ago
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-027', 'Noah Thomas', '+1-555-0212', 'noah@email.com', 5, 'dine-in', 'served', 63.50, 5.40, 68.90, 'Birthday party', NOW() - INTERVAL '4 days' + INTERVAL '3 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-028', 'Charlotte White', '+1-555-0213', 'charlotte@email.com', NULL, 'takeaway', 'served', 47.00, 4.00, 51.00, 'Extra crispy', NOW() - INTERVAL '4 days' + INTERVAL '1 hour'),
    
    -- 5 days ago
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-029', 'Liam Harris', '+1-555-0214', 'liam@email.com', 1, 'dine-in', 'served', 85.50, 7.27, 92.77, 'Business dinner', NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-030', 'Amelia Clark', '+1-555-0215', 'amelia@email.com', NULL, 'takeaway', 'served', 33.50, 2.85, 36.35, 'Extra napkins', NOW() - INTERVAL '5 days' + INTERVAL '1 hour'),
    
    -- 6 days ago
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-031', 'Lucas Lewis', '+1-555-0216', 'lucas@email.com', 10, 'dine-in', 'served', 91.00, 7.74, 98.74, 'Anniversary celebration', NOW() - INTERVAL '6 days' + INTERVAL '3 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-032', 'Harper Lee', '+1-555-0217', 'harper@email.com', NULL, 'takeaway', 'served', 42.00, 3.57, 45.57, 'Well done', NOW() - INTERVAL '6 days' + INTERVAL '1 hour'),
    
    -- 7 days ago
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-033', 'Mason Walker', '+1-555-0218', 'mason@email.com', 6, 'dine-in', 'served', 76.50, 6.50, 83.00, 'Date night', NOW() - INTERVAL '7 days' + INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'UB-2024-034', 'Evelyn Hall', '+1-555-0219', 'evelyn@email.com', NULL, 'takeaway', 'served', 38.50, 3.27, 41.77, 'Extra hot sauce', NOW() - INTERVAL '7 days' + INTERVAL '1 hour');

-- Add order items for recent orders
DO $$
DECLARE
    -- Recent order IDs
    order16_id uuid;
    order17_id uuid;
    order18_id uuid;
    order19_id uuid;
    order20_id uuid;
    order21_id uuid;
    order22_id uuid;
    order23_id uuid;
    order24_id uuid;
    order25_id uuid;
    order26_id uuid;
    order27_id uuid;
    order28_id uuid;
    order29_id uuid;
    order30_id uuid;
    order31_id uuid;
    order32_id uuid;
    order33_id uuid;
    order34_id uuid;
    
    -- Menu item IDs
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
    pasta_id uuid;
    spinach_dip_id uuid;
    club_sandwich_id uuid;
BEGIN
    -- Get recent order IDs
    SELECT id INTO order16_id FROM orders WHERE order_number = 'UB-2024-016';
    SELECT id INTO order17_id FROM orders WHERE order_number = 'UB-2024-017';
    SELECT id INTO order18_id FROM orders WHERE order_number = 'UB-2024-018';
    SELECT id INTO order19_id FROM orders WHERE order_number = 'UB-2024-019';
    SELECT id INTO order20_id FROM orders WHERE order_number = 'UB-2024-020';
    SELECT id INTO order21_id FROM orders WHERE order_number = 'UB-2024-021';
    SELECT id INTO order22_id FROM orders WHERE order_number = 'UB-2024-022';
    SELECT id INTO order23_id FROM orders WHERE order_number = 'UB-2024-023';
    SELECT id INTO order24_id FROM orders WHERE order_number = 'UB-2024-024';
    SELECT id INTO order25_id FROM orders WHERE order_number = 'UB-2024-025';
    SELECT id INTO order26_id FROM orders WHERE order_number = 'UB-2024-026';
    SELECT id INTO order27_id FROM orders WHERE order_number = 'UB-2024-027';
    SELECT id INTO order28_id FROM orders WHERE order_number = 'UB-2024-028';
    SELECT id INTO order29_id FROM orders WHERE order_number = 'UB-2024-029';
    SELECT id INTO order30_id FROM orders WHERE order_number = 'UB-2024-030';
    SELECT id INTO order31_id FROM orders WHERE order_number = 'UB-2024-031';
    SELECT id INTO order32_id FROM orders WHERE order_number = 'UB-2024-032';
    SELECT id INTO order33_id FROM orders WHERE order_number = 'UB-2024-033';
    SELECT id INTO order34_id FROM orders WHERE order_number = 'UB-2024-034';
    
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
    SELECT id INTO pasta_id FROM menu_items WHERE name = 'Vegetarian Pasta';
    SELECT id INTO spinach_dip_id FROM menu_items WHERE name = 'Spinach Artichoke Dip';
    SELECT id INTO club_sandwich_id FROM menu_items WHERE name = 'Chicken Club';
    
    -- Insert order items for recent orders
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions) VALUES
        -- Order 16 (Today - preparing)
        (order16_id, salmon_id, 1, 24.00, 24.00, 'Gluten-free'),
        (order16_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order16_id, lemonade_id, 1, 4.50, 4.50, NULL),
        (order16_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 17 (Today - ready)
        (order17_id, burger_id, 1, 16.00, 16.00, NULL),
        (order17_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order17_id, beer_id, 1, 6.00, 6.00, NULL),
        
        -- Order 18 (Today - confirmed)
        (order18_id, bruschetta_id, 1, 8.50, 8.50, NULL),
        (order18_id, beef_id, 2, 28.00, 56.00, NULL),
        (order18_id, wine_id, 1, 8.00, 8.00, NULL),
        
        -- Order 19 (Today - pending)
        (order19_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order19_id, chicken_salad_id, 1, 15.00, 15.00, NULL),
        (order19_id, lemonade_id, 1, 4.50, 4.50, NULL),
        (order19_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 20 (Yesterday - served)
        (order20_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order20_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order20_id, beef_id, 1, 28.00, 28.00, NULL),
        (order20_id, wine_id, 1, 8.00, 8.00, NULL),
        (order20_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 21 (Yesterday - served)
        (order21_id, burger_id, 1, 16.00, 16.00, 'Well done'),
        (order21_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order21_id, beer_id, 1, 6.00, 6.00, NULL),
        
        -- Order 22 (Yesterday - served)
        (order22_id, bruschetta_id, 1, 8.50, 8.50, NULL),
        (order22_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order22_id, beef_id, 1, 28.00, 28.00, NULL),
        (order22_id, wine_id, 2, 8.00, 16.00, NULL),
        (order22_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 23 (2 days ago - served)
        (order23_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order23_id, chicken_salad_id, 1, 15.00, 15.00, NULL),
        (order23_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order23_id, lemonade_id, 1, 4.50, 4.50, NULL),
        (order23_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 24 (2 days ago - served)
        (order24_id, truffle_burger_id, 1, 19.00, 19.00, 'Extra hot sauce'),
        (order24_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order24_id, beer_id, 1, 6.00, 6.00, NULL),
        
        -- Order 25 (3 days ago - served)
        (order25_id, bruschetta_id, 1, 8.50, 8.50, NULL),
        (order25_id, beef_id, 2, 28.00, 56.00, NULL),
        (order25_id, wine_id, 1, 8.00, 8.00, NULL),
        
        -- Order 26 (3 days ago - served)
        (order26_id, burger_id, 1, 16.00, 16.00, 'No onions'),
        (order26_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order26_id, beer_id, 1, 6.00, 6.00, NULL),
        
        -- Order 27 (4 days ago - served)
        (order27_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order27_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order27_id, pasta_id, 1, 18.00, 18.00, NULL),
        (order27_id, wine_id, 1, 8.00, 8.00, NULL),
        (order27_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 28 (4 days ago - served)
        (order28_id, truffle_burger_id, 1, 19.00, 19.00, 'Extra crispy'),
        (order28_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order28_id, beer_id, 1, 6.00, 6.00, NULL),
        
        -- Order 29 (5 days ago - served)
        (order29_id, spinach_dip_id, 1, 10.50, 10.50, NULL),
        (order29_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order29_id, beef_id, 1, 28.00, 28.00, NULL),
        (order29_id, wine_id, 1, 8.00, 8.00, NULL),
        (order29_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 30 (5 days ago - served)
        (order30_id, club_sandwich_id, 1, 17.00, 17.00, NULL),
        (order30_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order30_id, lemonade_id, 1, 4.50, 4.50, NULL),
        
        -- Order 31 (6 days ago - served)
        (order31_id, bruschetta_id, 1, 8.50, 8.50, NULL),
        (order31_id, salmon_id, 2, 24.00, 48.00, NULL),
        (order31_id, beef_id, 1, 28.00, 28.00, NULL),
        (order31_id, wine_id, 1, 8.00, 8.00, NULL),
        (order31_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 32 (6 days ago - served)
        (order32_id, burger_id, 1, 16.00, 16.00, NULL),
        (order32_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order32_id, beer_id, 1, 6.00, 6.00, NULL),
        (order32_id, lava_cake_id, 1, 9.00, 9.00, NULL),
        
        -- Order 33 (7 days ago - served)
        (order33_id, calamari_id, 1, 12.00, 12.00, NULL),
        (order33_id, salmon_id, 1, 24.00, 24.00, NULL),
        (order33_id, beef_id, 1, 28.00, 28.00, NULL),
        (order33_id, wine_id, 1, 8.00, 8.00, NULL),
        (order33_id, tiramisu_id, 1, 8.50, 8.50, NULL),
        
        -- Order 34 (7 days ago - served)
        (order34_id, truffle_burger_id, 1, 19.00, 19.00, 'Extra hot sauce'),
        (order34_id, caesar_id, 1, 12.00, 12.00, NULL),
        (order34_id, beer_id, 1, 6.00, 6.00, NULL);

END $$;

-- Display summary of recent orders added
SELECT 'Recent orders added' as item, '19 new orders' as details
UNION ALL
SELECT 'Orders today', (SELECT COUNT(*)::text FROM orders WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND created_at >= CURRENT_DATE)
UNION ALL
SELECT 'Orders this week', (SELECT COUNT(*)::text FROM orders WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND created_at >= CURRENT_DATE - INTERVAL '7 days')
UNION ALL
SELECT 'Total orders now', (SELECT COUNT(*)::text FROM orders WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001')
ORDER BY item; 