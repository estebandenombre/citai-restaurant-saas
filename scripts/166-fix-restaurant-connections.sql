-- Script para arreglar las conexiones entre usuarios y restaurantes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el estado actual
SELECT 'Estado actual de usuarios y restaurantes:' as info;

SELECT 
  COUNT(*) as total_users,
  COUNT(restaurant_id) as users_with_restaurant,
  COUNT(*) - COUNT(restaurant_id) as users_without_restaurant
FROM users;

-- 2. Verificar restaurantes activos
SELECT 'Restaurantes activos:' as info;

SELECT 
  id,
  name,
  slug,
  is_active,
  created_at
FROM restaurants 
WHERE is_active = true
ORDER BY created_at DESC;

-- 3. Crear restaurantes faltantes para usuarios que no tienen uno
DO $$
DECLARE
  user_record RECORD;
  new_restaurant_id UUID;
BEGIN
  FOR user_record IN 
    SELECT id, email, first_name, last_name 
    FROM users 
    WHERE restaurant_id IS NULL
  LOOP
    -- Crear un nuevo restaurante para este usuario
    INSERT INTO restaurants (
      id,
      name,
      slug,
      description,
      address,
      phone,
      email,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      COALESCE(user_record.first_name || '''s Restaurant', 'My Restaurant'),
      'restaurant-' || substr(user_record.id::text, 1, 8),
      'Restaurant created for ' || user_record.email,
      'Restaurant Address',
      '+1234567890',
      user_record.email,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO new_restaurant_id;
    
    -- Actualizar el usuario con el nuevo restaurant_id
    UPDATE users 
    SET restaurant_id = new_restaurant_id
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Created restaurant % for user %', new_restaurant_id, user_record.email;
  END LOOP;
END $$;

-- 4. Verificar que todos los usuarios tienen restaurantes
SELECT 'Verificación después de la corrección:' as info;

SELECT 
  u.id as user_id,
  u.email,
  u.restaurant_id,
  r.id as restaurant_id_from_restaurants,
  r.name as restaurant_name,
  r.slug,
  r.is_active
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.created_at DESC;

-- 5. Verificar que no hay restaurantes huérfanos (sin usuarios)
SELECT 'Restaurantes sin usuarios asociados:' as info;

SELECT 
  r.id,
  r.name,
  r.slug,
  r.is_active,
  COUNT(u.id) as user_count
FROM restaurants r
LEFT JOIN users u ON r.id = u.restaurant_id
GROUP BY r.id, r.name, r.slug, r.is_active
HAVING COUNT(u.id) = 0
ORDER BY r.created_at DESC;

-- 6. Verificar las políticas RLS de restaurants
SELECT 'Políticas RLS de restaurants:' as info;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'restaurants';

-- 7. Asegurar que las políticas RLS permiten acceso público a restaurantes activos
-- Primero eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON restaurants;
DROP POLICY IF EXISTS "Restaurants are viewable by authenticated users" ON restaurants;
DROP POLICY IF EXISTS "Restaurants are viewable by restaurant owners" ON restaurants;

-- Crear una política simple que permita acceso público a restaurantes activos
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants
  FOR SELECT USING (is_active = true);

-- 8. Verificar que las políticas funcionan
SELECT 'Verificación final - restaurantes accesibles:' as info;

SELECT 
  id,
  name,
  slug,
  is_active
FROM restaurants 
WHERE is_active = true
LIMIT 5;


