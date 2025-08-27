-- Script para verificar y corregir políticas RLS de restaurants
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS en la tabla restaurants si no está habilitado
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Users can view own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can update own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Users can insert own restaurant" ON restaurants;

-- 3. Crear políticas RLS correctas
-- Política para que los usuarios vean solo su restaurante
CREATE POLICY "Users can view own restaurant" ON restaurants
    FOR SELECT USING (
        id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid()
        )
    );

-- Política para que los usuarios puedan actualizar su restaurante
CREATE POLICY "Users can update own restaurant" ON restaurants
    FOR UPDATE USING (
        id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid()
        )
    );

-- Política para que los usuarios puedan insertar su restaurante (durante registro)
CREATE POLICY "Users can insert own restaurant" ON restaurants
    FOR INSERT WITH CHECK (
        id IN (
            SELECT restaurant_id FROM users WHERE id = auth.uid()
        )
    );

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
    'Políticas RLS creadas:' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'restaurants';

-- 5. Verificar que RLS está habilitado
SELECT 
    'Estado de RLS:' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'restaurants';

-- 6. Verificar acceso de usuario actual
SELECT 
    'Verificando acceso del usuario actual:' as info;

SELECT 
    auth.uid() as current_user_id,
    (SELECT restaurant_id FROM users WHERE id = auth.uid()) as user_restaurant_id,
    (SELECT COUNT(*) FROM restaurants WHERE id = (SELECT restaurant_id FROM users WHERE id = auth.uid())) as can_access_restaurant;



