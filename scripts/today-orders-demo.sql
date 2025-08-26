-- Script para generar órdenes de hoy para el restaurante demo
-- Este script crea órdenes con fechas de hoy y diferentes estados

-- Variables para el restaurante demo
DO $$
DECLARE
    demo_restaurant_id UUID := '550e8400-e29b-41d4-a716-446655440001';
    today_date DATE := CURRENT_DATE;
    order_counter INTEGER := 1;
    menu_item_ids UUID[];
    appetizers_id UUID;
    main_courses_id UUID;
    burgers_id UUID;
    salads_id UUID;
    desserts_id UUID;
    beverages_id UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO appetizers_id FROM categories WHERE restaurant_id = demo_restaurant_id AND name = 'Appetizers';
    SELECT id INTO main_courses_id FROM categories WHERE restaurant_id = demo_restaurant_id AND name = 'Main Courses';
    SELECT id INTO burgers_id FROM categories WHERE restaurant_id = demo_restaurant_id AND name = 'Burgers & Sandwiches';
    SELECT id INTO salads_id FROM categories WHERE restaurant_id = demo_restaurant_id AND name = 'Salads';
    SELECT id INTO desserts_id FROM categories WHERE restaurant_id = demo_restaurant_id AND name = 'Desserts';
    SELECT id INTO beverages_id FROM categories WHERE restaurant_id = demo_restaurant_id AND name = 'Beverages';

    -- Obtener algunos menu items para usar en las órdenes
    SELECT ARRAY_AGG(id) INTO menu_item_ids FROM menu_items WHERE restaurant_id = demo_restaurant_id LIMIT 10;

    -- Crear órdenes de hoy con diferentes estados y horarios
    -- Orden 1: Pending (almuerzo)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'Maria Rodriguez', '+1-555-0301', 'maria@email.com',
        3, 'dine-in', 'pending', 45.50, 3.87, 49.37,
        'Extra crispy calamari please', 
        today_date || ' 12:30:00'
    );

    -- Orden items para orden 1
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 2, mi.price, mi.price * 2, 'Extra crispy'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Calamari'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'No onions'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Classic Burger'
    LIMIT 1;

    order_counter := order_counter + 1;

    -- Orden 2: Confirmed (almuerzo)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'James Wilson', '+1-555-0302', 'james@email.com',
        7, 'dine-in', 'confirmed', 67.00, 5.70, 72.70,
        'Business lunch', 
        today_date || ' 13:15:00'
    );

    -- Orden items para orden 2
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Medium rare'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Beef Tenderloin'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'House dressing'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Caesar Salad'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 2, mi.price, mi.price * 2, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'House Red Wine'
    LIMIT 1;

    order_counter := order_counter + 1;

    -- Orden 3: Preparing (almuerzo tarde)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'Lisa Chen', '+1-555-0303', 'lisa@email.com',
        NULL, 'takeaway', 'preparing', 32.50, 2.76, 35.26,
        'Extra napkins please', 
        today_date || ' 14:00:00'
    );

    -- Orden items para orden 3
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Extra crispy'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Chicken Club'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Fresh Lemonade'
    LIMIT 1;

    order_counter := order_counter + 1;

    -- Orden 4: Ready (cena temprana)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'David Brown', '+1-555-0304', 'david@email.com',
        5, 'dine-in', 'ready', 89.00, 7.57, 96.57,
        'Anniversary celebration', 
        today_date || ' 18:30:00'
    );

    -- Orden items para orden 4
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Well done'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Beef Tenderloin'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Extra crispy'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Calamari'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Chocolate Lava Cake'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 2, mi.price, mi.price * 2, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'House Red Wine'
    LIMIT 1;

    order_counter := order_counter + 1;

    -- Orden 5: Served (cena)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'Sarah Johnson', '+1-555-0305', 'sarah@email.com',
        2, 'dine-in', 'served', 54.50, 4.63, 59.13,
        'Date night', 
        today_date || ' 19:00:00'
    );

    -- Orden items para orden 5
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Medium rare'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Grilled Salmon'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Extra dressing'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Grilled Chicken Salad'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Tiramisu'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 2, mi.price, mi.price * 2, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Craft Beer'
    LIMIT 1;

    order_counter := order_counter + 1;

    -- Orden 6: Pending (cena tarde)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'Michael Davis', '+1-555-0306', 'michael@email.com',
        8, 'dine-in', 'pending', 76.00, 6.46, 82.46,
        'Family dinner', 
        today_date || ' 20:15:00'
    );

    -- Orden items para orden 6
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 2, mi.price, mi.price * 2, 'One medium rare, one well done'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Beef Tenderloin'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'No dairy'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Vegetarian Pasta'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Chicken Marsala'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Spinach Artichoke Dip'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 2, mi.price, mi.price * 2, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Fresh Lemonade'
    LIMIT 1;

    order_counter := order_counter + 1;

    -- Orden 7: Confirmed (cena tarde)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'Emma Wilson', '+1-555-0307', 'emma@email.com',
        NULL, 'takeaway', 'confirmed', 41.50, 3.53, 45.03,
        'Extra hot sauce', 
        today_date || ' 20:45:00'
    );

    -- Orden items para orden 7
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Extra crispy'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Truffle Burger'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Caesar Salad'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Chocolate Lava Cake'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Fresh Lemonade'
    LIMIT 1;

    order_counter := order_counter + 1;

    -- Orden 8: Preparing (cena muy tarde)
    INSERT INTO orders (
        restaurant_id, order_number, customer_name, customer_phone, customer_email,
        table_number, order_type, status, subtotal, tax_amount, total_amount,
        notes, created_at
    ) VALUES (
        demo_restaurant_id, 
        'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0'),
        'Robert Taylor', '+1-555-0308', 'robert@email.com',
        4, 'dine-in', 'preparing', 38.50, 3.27, 41.77,
        'Birthday celebration', 
        today_date || ' 21:30:00'
    );

    -- Orden items para orden 8
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, 'Extra crispy'
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Chicken Marsala'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Bruschetta'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Tiramisu'
    LIMIT 1;

    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
    SELECT 
        o.id, mi.id, 1, mi.price, mi.price, NULL
    FROM orders o, menu_items mi
    WHERE o.order_number = 'UB-' || EXTRACT(YEAR FROM today_date) || '-' || LPAD(order_counter::text, 3, '0')
    AND mi.restaurant_id = demo_restaurant_id AND mi.name = 'Craft Beer'
    LIMIT 1;

    RAISE NOTICE 'Se han creado 8 órdenes de hoy para el restaurante demo';
    RAISE NOTICE 'Estados de las órdenes: 2 pending, 2 confirmed, 2 preparing, 1 ready, 1 served';
    RAISE NOTICE 'Horarios: desde 12:30 hasta 21:30';

END $$;

-- Mostrar resumen de las órdenes creadas hoy
SELECT 
    'Órdenes creadas hoy' as info,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing,
    COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready,
    COUNT(CASE WHEN status = 'served' THEN 1 END) as served,
    SUM(total_amount) as total_revenue
FROM orders 
WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' 
AND DATE(created_at) = CURRENT_DATE; 