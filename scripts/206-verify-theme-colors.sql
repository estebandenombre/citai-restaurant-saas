-- Script para verificar los colores del tema
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura del campo theme_colors
SELECT 
    'Estructura del campo theme_colors:' as info;

SELECT 
    name,
    theme_colors,
    CASE 
        WHEN theme_colors IS NULL THEN 'NULL'
        WHEN jsonb_typeof(theme_colors) = 'object' THEN 'JSONB Object'
        ELSE jsonb_typeof(theme_colors)
    END as theme_colors_type
FROM restaurants 
LIMIT 5;

-- 2. Verificar valores específicos de colores
SELECT 
    'Valores de colores del tema:' as info;

SELECT 
    name,
    theme_colors->>'primary' as primary_color,
    theme_colors->>'secondary' as secondary_color,
    CASE 
        WHEN theme_colors->>'primary' IS NOT NULL AND theme_colors->>'secondary' IS NOT NULL 
        THEN 'Complete'
        WHEN theme_colors->>'primary' IS NOT NULL OR theme_colors->>'secondary' IS NOT NULL 
        THEN 'Partial'
        ELSE 'Missing'
    END as color_status
FROM restaurants 
WHERE theme_colors IS NOT NULL;

-- 3. Verificar valores por defecto
SELECT 
    'Verificando valores por defecto:' as info;

SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN theme_colors->>'primary' = '#2563eb' THEN 1 END) as default_primary,
    COUNT(CASE WHEN theme_colors->>'secondary' = '#64748b' THEN 1 END) as default_secondary,
    COUNT(CASE WHEN theme_colors->>'primary' != '#2563eb' OR theme_colors->>'primary' IS NULL THEN 1 END) as custom_primary,
    COUNT(CASE WHEN theme_colors->>'secondary' != '#64748b' OR theme_colors->>'secondary' IS NULL THEN 1 END) as custom_secondary
FROM restaurants;

-- 4. Mostrar restaurantes con colores personalizados
SELECT 
    'Restaurantes con colores personalizados:' as info;

SELECT 
    name,
    theme_colors->>'primary' as primary_color,
    theme_colors->>'secondary' as secondary_color,
    updated_at
FROM restaurants 
WHERE (theme_colors->>'primary' != '#2563eb' OR theme_colors->>'primary' IS NULL)
   OR (theme_colors->>'secondary' != '#64748b' OR theme_colors->>'secondary' IS NULL)
ORDER BY updated_at DESC;

-- 5. Verificar formato de colores hex
SELECT 
    'Verificando formato de colores hex:' as info;

SELECT 
    name,
    theme_colors->>'primary' as primary_color,
    theme_colors->>'secondary' as secondary_color,
    CASE 
        WHEN theme_colors->>'primary' ~ '^#[0-9A-Fa-f]{6}$' THEN 'Valid Primary'
        WHEN theme_colors->>'primary' IS NULL THEN 'NULL Primary'
        ELSE 'Invalid Primary'
    END as primary_format,
    CASE 
        WHEN theme_colors->>'secondary' ~ '^#[0-9A-Fa-f]{6}$' THEN 'Valid Secondary'
        WHEN theme_colors->>'secondary' IS NULL THEN 'NULL Secondary'
        ELSE 'Invalid Secondary'
    END as secondary_format
FROM restaurants 
WHERE theme_colors IS NOT NULL;

-- 6. Función para validar colores hex
CREATE OR REPLACE FUNCTION is_valid_hex_color(color_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN color_value ~ '^#[0-9A-Fa-f]{6}$';
END;
$$ LANGUAGE plpgsql;

-- 7. Probar la función
SELECT 
    'Probando función de validación:' as info;

SELECT 
    name,
    theme_colors->>'primary' as primary_color,
    is_valid_hex_color(theme_colors->>'primary') as valid_primary,
    theme_colors->>'secondary' as secondary_color,
    is_valid_hex_color(theme_colors->>'secondary') as valid_secondary
FROM restaurants 
WHERE theme_colors IS NOT NULL
LIMIT 5;



