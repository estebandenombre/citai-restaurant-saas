-- Script final para eliminar usuario shejeashs@gmail.com
-- Basado en el esquema real de la base de datos

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
    
    -- 1. Eliminar suscripciones de restaurante
    DELETE FROM restaurant_subscriptions WHERE user_subscription_id IN (
        SELECT id FROM user_subscriptions WHERE user_id = user_id_to_delete
    );
    RAISE NOTICE 'Suscripciones de restaurante eliminadas';
    
    -- 2. Eliminar suscripciones de usuario
    DELETE FROM user_subscriptions WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Suscripciones de usuario eliminadas';
    
    -- 3. Eliminar turnos de personal
    DELETE FROM staff_shifts WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Turnos de personal eliminados';
    
    -- 4. Eliminar items de pedidos
    DELETE FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE restaurant_id = restaurant_id_to_delete
    );
    RAISE NOTICE 'Items de pedidos eliminados';
    
    -- 5. Eliminar pedidos
    DELETE FROM orders WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Pedidos eliminados';
    
    -- 6. Eliminar reservas
    DELETE FROM reservations WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Reservas eliminadas';
    
    -- 7. Eliminar elementos del menú
    DELETE FROM menu_items WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Elementos del menú eliminados';
    
    -- 8. Eliminar categorías
    DELETE FROM categories WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Categorías eliminadas';
    
    -- 9. Eliminar inventario
    DELETE FROM inventory_items WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Inventario eliminado';
    
    -- 10. Eliminar configuraciones de pedidos
    DELETE FROM order_settings WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Configuraciones de pedidos eliminadas';
    
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
WHERE email = 'shejeashs@gmail.com'

UNION ALL

SELECT 
    'VERIFICACION' as tipo,
    COUNT(*) as restaurantes_restantes,
    'restaurantes asociados' as descripcion
FROM restaurants r
JOIN users u ON r.id = u.restaurant_id
WHERE u.email = 'shejeashs@gmail.com';
