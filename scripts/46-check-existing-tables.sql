-- Verificar qué tablas existen en la base de datos
SELECT 
    'TABLAS EXISTENTES' as tipo,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar tablas específicas que podrían no existir
SELECT 
    'VERIFICACION ESPECIFICA' as tipo,
    'staff' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as estado

UNION ALL

SELECT 
    'VERIFICACION ESPECIFICA' as tipo,
    'inventory_items' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as estado

UNION ALL

SELECT 
    'VERIFICACION ESPECIFICA' as tipo,
    'printer_config' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'printer_config') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as estado

UNION ALL

SELECT 
    'VERIFICACION ESPECIFICA' as tipo,
    'restaurant_subscriptions' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_subscriptions') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as estado;
