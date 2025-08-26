-- Add sample menu items for testing order creation
-- This script adds some basic menu items to the test restaurant

-- First, get the restaurant ID and category IDs
DO $$
DECLARE
    restaurant_uuid UUID;
    appetizers_category_id UUID;
    main_courses_category_id UUID;
    desserts_category_id UUID;
BEGIN
    -- Get the test restaurant ID
    SELECT id INTO restaurant_uuid FROM restaurants WHERE slug = 'test-restaurant' LIMIT 1;
    
    -- Get category IDs
    SELECT id INTO appetizers_category_id FROM categories WHERE restaurant_id = restaurant_uuid AND name = 'Appetizers' LIMIT 1;
    SELECT id INTO main_courses_category_id FROM categories WHERE restaurant_id = restaurant_uuid AND name = 'Main Courses' LIMIT 1;
    SELECT id INTO desserts_category_id FROM categories WHERE restaurant_id = restaurant_uuid AND name = 'Desserts' LIMIT 1;
    
    -- Add sample menu items if they don't exist
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order)
    VALUES 
        (restaurant_uuid, appetizers_category_id, 'Bruschetta', 'Toasted bread topped with tomatoes, garlic, and olive oil', 8.99, ARRAY['gluten'], ARRAY['vegetarian'], 10, true, true, 1)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order)
    VALUES 
        (restaurant_uuid, appetizers_category_id, 'Caprese Salad', 'Fresh mozzarella, tomatoes, and basil with balsamic glaze', 12.99, ARRAY['dairy'], ARRAY['vegetarian', 'gluten-free'], 8, true, false, 2)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order)
    VALUES 
        (restaurant_uuid, main_courses_category_id, 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 16.99, ARRAY['gluten', 'dairy'], ARRAY['vegetarian'], 20, true, true, 1)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order)
    VALUES 
        (restaurant_uuid, main_courses_category_id, 'Spaghetti Carbonara', 'Pasta with eggs, cheese, pancetta, and black pepper', 18.99, ARRAY['gluten', 'dairy', 'eggs'], ARRAY[], 15, true, false, 2)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order)
    VALUES 
        (restaurant_uuid, main_courses_category_id, 'Grilled Salmon', 'Fresh salmon with seasonal vegetables and lemon butter sauce', 24.99, ARRAY['fish'], ARRAY['gluten-free'], 25, true, true, 3)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order)
    VALUES 
        (restaurant_uuid, desserts_category_id, 'Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream', 9.99, ARRAY['gluten', 'dairy', 'eggs'], ARRAY['vegetarian'], 5, true, true, 1)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO menu_items (restaurant_id, category_id, name, description, price, allergens, dietary_info, preparation_time, is_available, is_featured, display_order)
    VALUES 
        (restaurant_uuid, desserts_category_id, 'Gelato', 'Italian ice cream in vanilla, chocolate, or strawberry', 6.99, ARRAY['dairy'], ARRAY['vegetarian'], 2, true, false, 2)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample menu items added successfully';
END $$; 