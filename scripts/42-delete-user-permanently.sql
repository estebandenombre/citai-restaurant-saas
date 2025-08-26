-- Script para eliminar un usuario de forma permanente
-- IMPORTANTE: Este script elimina TODOS los datos del usuario de forma irreversible
-- Usar con precaución y hacer backup antes de ejecutar

-- Parámetro: Cambiar el email del usuario que quieres eliminar
DO $$
DECLARE
    target_email TEXT := 'usuario@ejemplo.com'; -- CAMBIAR AQUÍ EL EMAIL
    user_id_to_delete UUID;
    restaurant_id_to_delete UUID;
BEGIN
    -- Obtener el ID del usuario y restaurante
    SELECT id, restaurant_id INTO user_id_to_delete, restaurant_id_to_delete
    FROM users 
    WHERE email = target_email;
    
    IF user_id_to_delete IS NULL THEN
        RAISE NOTICE 'Usuario con email % no encontrado', target_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Eliminando usuario: % (ID: %)', target_email, user_id_to_delete;
    RAISE NOTICE 'Restaurante ID: %', restaurant_id_to_delete;
    
    -- 1. Eliminar suscripciones del usuario
    DELETE FROM user_subscriptions WHERE user_id = user_id_to_delete;
    RAISE NOTICE 'Suscripciones de usuario eliminadas';
    
    -- 2. Eliminar suscripciones de restaurante
    DELETE FROM restaurant_subscriptions WHERE user_subscription_id IN (
        SELECT id FROM user_subscriptions WHERE user_id = user_id_to_delete
    );
    RAISE NOTICE 'Suscripciones de restaurante eliminadas';
    
    -- 3. Eliminar pedidos del restaurante
    DELETE FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE restaurant_id = restaurant_id_to_delete
    );
    DELETE FROM orders WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Pedidos eliminados';
    
    -- 4. Eliminar reservas del restaurante
    DELETE FROM reservations WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Reservas eliminadas';
    
    -- 5. Eliminar elementos del menú
    DELETE FROM menu_items WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Elementos del menú eliminados';
    
    -- 6. Eliminar categorías del menú
    DELETE FROM categories WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Categorías eliminadas';
    
    -- 7. Eliminar inventario
    DELETE FROM inventory_items WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Inventario eliminado';
    
    -- 8. Eliminar personal
    DELETE FROM staff WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Personal eliminado';
    
    -- 9. Eliminar configuraciones de impresora
    DELETE FROM printer_config WHERE restaurant_id = restaurant_id_to_delete;
    RAISE NOTICE 'Configuraciones de impresora eliminadas';
    
    -- 10. Eliminar el restaurante
    DELETE FROM restaurants WHERE id = restaurant_id_to_delete;
    RAISE NOTICE 'Restaurante eliminado';
    
    -- 11. Eliminar el usuario de la tabla users
    DELETE FROM users WHERE id = user_id_to_delete;
    RAISE NOTICE 'Usuario eliminado de la tabla users';
    
    -- 12. Eliminar el usuario de auth.users (esto requiere permisos de admin)
    -- NOTA: Esta línea puede fallar si no tienes permisos de admin
    -- DELETE FROM auth.users WHERE email = target_email;
    RAISE NOTICE 'IMPORTANTE: Para eliminar completamente de auth.users, ejecuta manualmente:';
    RAISE NOTICE 'DELETE FROM auth.users WHERE email = %;', target_email;
    
    RAISE NOTICE 'Eliminación completada para el usuario: %', target_email;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error durante la eliminación: %', SQLERRM;
        RAISE;
END $$;

-- Verificar que el usuario fue eliminado
SELECT 
    'VERIFICACION' as tipo,
    COUNT(*) as usuarios_restantes,
    'usuarios con el mismo email' as descripcion
FROM users 
WHERE email = 'usuario@ejemplo.com' -- CAMBIAR AQUÍ EL EMAIL

UNION ALL

SELECT 
    'VERIFICACION' as tipo,
    COUNT(*) as restaurantes_restantes,
    'restaurantes asociados' as descripcion
FROM restaurants r
JOIN users u ON r.id = u.restaurant_id
WHERE u.email = 'usuario@ejemplo.com'; -- CAMBIAR AQUÍ EL EMAIL
