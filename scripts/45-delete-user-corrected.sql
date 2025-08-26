-- Script corregido para eliminar usuario shejeashs@gmail.com
-- Solo elimina de tablas que existen

DO $$
DECLARE
    target_email TEXT := 'shejeashs@gmail.com';
    user_id_to_delete UUID;
    restaurant_id_to_delete UUID;
BEGIN
    -- Obtener IDs
    SELECT id, restaurant_id INTO user_id_to_delete, restaurant_id_to_delete
    FROM users WHERE email = target_email;
    
    IF user_id_to_delete IS NULL THEN
        RAISE NOTICE 'Usuario no encontrado';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Eliminando usuario: % (ID: %)', target_email, user_id_to_delete;
    RAISE NOTICE 'Restaurante ID: %', restaurant_id_to_delete;
    
    -- 1. Eliminar suscripciones de restaurante (si existe la tabla)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_subscriptions') THEN
        DELETE FROM restaurant_subscriptions WHERE user_subscription_id IN (
            SELECT id FROM user_subscriptions WHERE user_id = user_id_to_delete
        );
        RAISE NOTICE 'Suscripciones de restaurante eliminadas';
    END IF;
    
    -- 2. Eliminar suscripciones de usuario
    DELETE FROM user_subscriptions WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Suscripciones de usuario eliminadas';
    
    -- 3. Eliminar items de pedidos
    DELETE FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE restaurant_id = restaurant_id_to_delete
    );
    RAISE NOTICE 'Items de pedidos eliminados';
    
    -- 4. Eliminar pedidos
    DELETE FROM orders WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Pedidos eliminados';
    
    -- 5. Eliminar reservas
    DELETE FROM reservations WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Reservas eliminadas';
    
    -- 6. Eliminar elementos del menú
    DELETE FROM menu_items WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Elementos del menú eliminados';
    
    -- 7. Eliminar categorías
    DELETE FROM categories WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Categorías eliminadas';
    
    -- 8. Eliminar inventario (si existe la tabla)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        DELETE FROM inventory_items WHERE restaurant_id = restaurant_id_to_delete;
        RAISE NOTICE 'Inventario eliminado';
    END IF;
    
    -- 9. Eliminar personal (si existe la tabla)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        DELETE FROM staff WHERE restaurant_id = restaurant_id_to_delete;
        RAISE NOTICE 'Personal eliminado';
    END IF;
    
    -- 10. Eliminar configuraciones de impresora (si existe la tabla)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'printer_config') THEN
        DELETE FROM printer_config WHERE restaurant_id = restaurant_id_to_delete;
        RAISE NOTICE 'Configuraciones de impresora eliminadas';
    END IF;
    
    -- 11. Eliminar restaurante
    DELETE FROM restaurants WHERE id = restaurant_id_to_delete;
    RAISE NOTICE 'Restaurante eliminado';
    
    -- 12. Eliminar usuario
    DELETE FROM users WHERE id = user_id_to_delete;
    RAISE NOTICE 'Usuario eliminado de la tabla users';
    
    RAISE NOTICE 'Eliminación completada para: %', target_email;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error durante la eliminación: %', SQLERRM;
        RAISE;
END $$;

-- Verificar eliminación
SELECT 
    'VERIFICACION' as tipo,
    COUNT(*) as usuarios_restantes,
    'usuarios con email shejeashs@gmail.com' as descripcion
FROM users 
WHERE email = 'shejeashs@gmail.com';
