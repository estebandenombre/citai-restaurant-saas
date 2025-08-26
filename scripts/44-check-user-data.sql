-- Script para verificar todos los datos asociados a un usuario
-- Útil para hacer backup antes de eliminar

-- Cambiar el email del usuario que quieres verificar
DO $$
DECLARE
    target_email TEXT := 'usuario@ejemplo.com'; -- CAMBIAR AQUÍ EL EMAIL
    user_id_to_check UUID;
    restaurant_id_to_check UUID;
BEGIN
    -- Obtener el ID del usuario y restaurante
    SELECT id, restaurant_id INTO user_id_to_check, restaurant_id_to_check
    FROM users 
    WHERE email = target_email;
    
    IF user_id_to_check IS NULL THEN
        RAISE NOTICE 'Usuario con email % no encontrado', target_email;
        RETURN;
    END IF;
    
    RAISE NOTICE '=== VERIFICACION DE DATOS PARA: % ===', target_email;
    RAISE NOTICE 'User ID: %', user_id_to_check;
    RAISE NOTICE 'Restaurant ID: %', restaurant_id_to_check;
    
    -- Verificar datos del usuario
    RAISE NOTICE '';
    RAISE NOTICE '1. DATOS DEL USUARIO:';
    PERFORM COUNT(*) FROM users WHERE id = user_id_to_check;
    RAISE NOTICE '   - Usuario en tabla users: %', (SELECT COUNT(*) FROM users WHERE id = user_id_to_check);
    
    -- Verificar suscripciones
    RAISE NOTICE '';
    RAISE NOTICE '2. SUSCRIPCIONES:';
    PERFORM COUNT(*) FROM user_subscriptions WHERE user_id = user_id_to_check;
    RAISE NOTICE '   - Suscripciones de usuario: %', (SELECT COUNT(*) FROM user_subscriptions WHERE user_id = user_id_to_check);
    RAISE NOTICE '   - Suscripciones de restaurante: %', (
        SELECT COUNT(*) FROM restaurant_subscriptions rs
        JOIN user_subscriptions us ON rs.user_subscription_id = us.id
        WHERE us.user_id = user_id_to_check
    );
    
    -- Verificar restaurante
    RAISE NOTICE '';
    RAISE NOTICE '3. RESTAURANTE:';
    PERFORM COUNT(*) FROM restaurants WHERE id = restaurant_id_to_check;
    RAISE NOTICE '   - Restaurante: %', (SELECT COUNT(*) FROM restaurants WHERE id = restaurant_id_to_check);
    
    -- Verificar pedidos
    RAISE NOTICE '';
    RAISE NOTICE '4. PEDIDOS:';
    PERFORM COUNT(*) FROM orders WHERE restaurant_id = restaurant_id_to_check;
    RAISE NOTICE '   - Pedidos: %', (SELECT COUNT(*) FROM orders WHERE restaurant_id = restaurant_id_to_check);
    RAISE NOTICE '   - Items de pedidos: %', (
        SELECT COUNT(*) FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.restaurant_id = restaurant_id_to_check
    );
    
    -- Verificar reservas
    RAISE NOTICE '';
    RAISE NOTICE '5. RESERVAS:';
    PERFORM COUNT(*) FROM reservations WHERE restaurant_id = restaurant_id_to_check;
    RAISE NOTICE '   - Reservas: %', (SELECT COUNT(*) FROM reservations WHERE restaurant_id = restaurant_id_to_check);
    
    -- Verificar menú
    RAISE NOTICE '';
    RAISE NOTICE '6. MENU:';
    PERFORM COUNT(*) FROM menu_items WHERE restaurant_id = restaurant_id_to_check;
    RAISE NOTICE '   - Elementos del menú: %', (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = restaurant_id_to_check);
    RAISE NOTICE '   - Categorías: %', (SELECT COUNT(*) FROM categories WHERE restaurant_id = restaurant_id_to_check);
    
    -- Verificar inventario
    RAISE NOTICE '';
    RAISE NOTICE '7. INVENTARIO:';
    PERFORM COUNT(*) FROM inventory_items WHERE restaurant_id = restaurant_id_to_check;
    RAISE NOTICE '   - Items de inventario: %', (SELECT COUNT(*) FROM inventory_items WHERE restaurant_id = restaurant_id_to_check);
    
    -- Verificar personal
    RAISE NOTICE '';
    RAISE NOTICE '8. PERSONAL:';
    PERFORM COUNT(*) FROM staff WHERE restaurant_id = restaurant_id_to_check;
    RAISE NOTICE '   - Personal: %', (SELECT COUNT(*) FROM staff WHERE restaurant_id = restaurant_id_to_check);
    
    -- Verificar configuraciones
    RAISE NOTICE '';
    RAISE NOTICE '9. CONFIGURACIONES:';
    PERFORM COUNT(*) FROM printer_config WHERE restaurant_id = restaurant_id_to_check;
    RAISE NOTICE '   - Configuraciones de impresora: %', (SELECT COUNT(*) FROM printer_config WHERE restaurant_id = restaurant_id_to_check);
    
    -- Verificar auth.users
    RAISE NOTICE '';
    RAISE NOTICE '10. AUTH.USERS:';
    PERFORM COUNT(*) FROM auth.users WHERE email = target_email;
    RAISE NOTICE '   - Usuario en auth.users: %', (SELECT COUNT(*) FROM auth.users WHERE email = target_email);
    
    RAISE NOTICE '';
    RAISE NOTICE '=== FIN DE VERIFICACION ===';
    
END $$;
