-- Script para verificar la integración de staff
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que la tabla staff existe y tiene datos
SELECT 
    'Verificando tabla staff:' as info;

SELECT 
    COUNT(*) as total_staff,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_staff,
    COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers,
    COUNT(CASE WHEN role = 'staff' THEN 1 END) as regular_staff
FROM staff;

-- 2. Verificar estructura de staff_shifts
SELECT 
    'Verificando tabla staff_shifts:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'staff_shifts' 
ORDER BY ordinal_position;

-- 3. Verificar relación entre staff y staff_shifts
SELECT 
    'Verificando relación staff-shifts:' as info;

SELECT 
    COUNT(*) as total_shifts,
    COUNT(DISTINCT user_id) as unique_staff_with_shifts
FROM staff_shifts;

-- 4. Verificar que los user_id en staff_shifts existen en staff
SELECT 
    'Verificando integridad referencial:' as info;

SELECT 
    COUNT(*) as orphaned_shifts
FROM staff_shifts ss
LEFT JOIN staff s ON ss.user_id = s.id
WHERE s.id IS NULL;

-- 5. Mostrar algunos ejemplos de staff con sus turnos
SELECT 
    'Ejemplos de staff con turnos:' as info;

SELECT 
    s.first_name,
    s.last_name,
    s.role,
    s.position,
    COUNT(ss.id) as total_shifts,
    COUNT(CASE WHEN ss.status = 'completed' THEN 1 END) as completed_shifts
FROM staff s
LEFT JOIN staff_shifts ss ON s.id = ss.user_id
GROUP BY s.id, s.first_name, s.last_name, s.role, s.position
ORDER BY total_shifts DESC
LIMIT 5;

-- 6. Verificar políticas RLS de staff
SELECT 
    'Políticas RLS de staff:' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'staff';

-- 7. Verificar políticas RLS de staff_shifts
SELECT 
    'Políticas RLS de staff_shifts:' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'staff_shifts';

-- 8. Mostrar estadísticas generales
SELECT 
    'Estadísticas generales:' as info;

SELECT 
    (SELECT COUNT(*) FROM staff) as total_staff,
    (SELECT COUNT(*) FROM staff_shifts) as total_shifts,
    (SELECT COUNT(*) FROM restaurants) as total_restaurants,
    (SELECT COUNT(*) FROM users) as total_users;




