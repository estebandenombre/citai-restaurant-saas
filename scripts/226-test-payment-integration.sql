-- Test Payment Integration
-- This script helps verify that the payment system is working correctly

-- 1. Check if the payment settings table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'restaurant_payment_settings') THEN
        RAISE NOTICE '✅ restaurant_payment_settings table exists';
    ELSE
        RAISE NOTICE '❌ restaurant_payment_settings table does not exist';
    END IF;
END $$;

-- 2. Check if the functions exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'get_restaurant_payment_settings') THEN
        RAISE NOTICE '✅ get_restaurant_payment_settings function exists';
    ELSE
        RAISE NOTICE '❌ get_restaurant_payment_settings function does not exist';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'save_restaurant_payment_settings') THEN
        RAISE NOTICE '✅ save_restaurant_payment_settings function exists';
    ELSE
        RAISE NOTICE '❌ save_restaurant_payment_settings function does not exist';
    END IF;
    
    IF EXISTS (SELECT FROM pg_proc WHERE proname = 'validate_payment_settings') THEN
        RAISE NOTICE '✅ validate_payment_settings function exists';
    ELSE
        RAISE NOTICE '❌ validate_payment_settings function does not exist';
    END IF;
END $$;

-- 3. Check if there are any restaurants with payment settings
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    rps.settings->>'payments_enabled' as payments_enabled,
    rps.settings->'gateways'->'stripe'->>'enabled' as stripe_enabled,
    rps.settings->'gateways'->'stripe'->>'setup_complete' as stripe_setup_complete,
    rps.settings->'gateways'->'paypal'->>'enabled' as paypal_enabled,
    rps.settings->'gateways'->'paypal'->>'setup_complete' as paypal_setup_complete
FROM restaurants r
LEFT JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
ORDER BY r.name;

-- 4. Test the get_restaurant_payment_settings function with a sample restaurant
DO $$
DECLARE
    test_restaurant_id UUID;
    payment_settings JSONB;
BEGIN
    -- Get the first restaurant
    SELECT id INTO test_restaurant_id FROM restaurants LIMIT 1;
    
    IF test_restaurant_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with restaurant ID: %', test_restaurant_id;
        
        -- Test the function
        SELECT get_restaurant_payment_settings(test_restaurant_id) INTO payment_settings;
        
        IF payment_settings IS NOT NULL THEN
            RAISE NOTICE '✅ Function works! Payment settings: %', payment_settings;
        ELSE
            RAISE NOTICE '❌ Function returned NULL';
        END IF;
    ELSE
        RAISE NOTICE '❌ No restaurants found in database';
    END IF;
END $$;

-- 5. Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'restaurant_payment_settings';

-- 6. Check if pg_trgm extension is enabled
SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname = 'pg_trgm';

-- 7. Show indexes on restaurant_payment_settings
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurant_payment_settings';

-- 8. Test creating a sample payment setting
DO $$
DECLARE
    test_restaurant_id UUID;
    test_settings JSONB;
    result BOOLEAN;
BEGIN
    -- Get the first restaurant
    SELECT id INTO test_restaurant_id FROM restaurants LIMIT 1;
    
    IF test_restaurant_id IS NOT NULL THEN
        -- Create test settings
        test_settings := '{
            "payments_enabled": true,
            "require_payment": false,
            "allow_cash": true,
            "allow_card": true,
            "allow_apple_pay": false,
            "allow_google_pay": false,
            "auto_capture": true,
            "gateways": {
                "stripe": {
                    "id": "stripe",
                    "name": "Stripe",
                    "enabled": true,
                    "test_mode": true,
                    "public_key": "pk_test_test",
                    "secret_key": "sk_test_test",
                    "webhook_url": "",
                    "supported_methods": ["card", "apple_pay", "google_pay"],
                    "processing_fee": 2.9,
                    "setup_complete": true
                },
                "paypal": {
                    "id": "paypal",
                    "name": "PayPal",
                    "enabled": false,
                    "test_mode": true,
                    "public_key": "",
                    "secret_key": "",
                    "webhook_url": "",
                    "supported_methods": ["card", "paypal"],
                    "processing_fee": 2.9,
                    "setup_complete": false
                },
                "apple_pay": {
                    "id": "apple_pay",
                    "name": "Apple Pay",
                    "enabled": false,
                    "test_mode": true,
                    "public_key": "",
                    "secret_key": "",
                    "webhook_url": "",
                    "supported_methods": ["apple_pay"],
                    "processing_fee": 0,
                    "setup_complete": false
                }
            }
        }'::jsonb;
        
        -- Test saving settings
        SELECT save_restaurant_payment_settings(test_restaurant_id, test_settings) INTO result;
        
        IF result THEN
            RAISE NOTICE '✅ Successfully saved test payment settings';
        ELSE
            RAISE NOTICE '❌ Failed to save test payment settings';
        END IF;
        
        -- Test retrieving the settings
        SELECT get_restaurant_payment_settings(test_restaurant_id) INTO payment_settings;
        
        IF payment_settings IS NOT NULL THEN
            RAISE NOTICE '✅ Successfully retrieved payment settings: %', payment_settings->>'payments_enabled';
        ELSE
            RAISE NOTICE '❌ Failed to retrieve payment settings';
        END IF;
    END IF;
END $$;

