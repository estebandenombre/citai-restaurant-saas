-- Script para probar la configuración de moneda
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura actual de currency_config
SELECT 
    'Verificando estructura de currency_config:' as info;

SELECT 
    name,
    currency_config
FROM restaurants 
LIMIT 5;

-- 2. Actualizar un restaurante con configuración EUR para pruebas
UPDATE restaurants 
SET currency_config = '{
  "currency": "EUR",
  "position": "after"
}'::jsonb
WHERE id = (SELECT id FROM restaurants LIMIT 1);

-- 3. Actualizar otro restaurante con configuración GBP para pruebas
UPDATE restaurants 
SET currency_config = '{
  "currency": "GBP",
  "position": "before"
}'::jsonb
WHERE id = (SELECT id FROM restaurants LIMIT 1 OFFSET 1);

-- 4. Verificar las configuraciones actualizadas
SELECT 
    'Configuraciones de moneda actualizadas:' as info;

SELECT 
    name,
    currency_config->>'currency' as currency,
    currency_config->>'position' as position,
    CASE 
        WHEN currency_config->>'currency' = 'USD' THEN '$1,234.56'
        WHEN currency_config->>'currency' = 'EUR' THEN '1.234,56€'
        WHEN currency_config->>'currency' = 'GBP' THEN '£1,234.56'
        WHEN currency_config->>'currency' = 'JPY' THEN '¥1,234'
        WHEN currency_config->>'currency' = 'CAD' THEN 'C$1,234.56'
        WHEN currency_config->>'currency' = 'AUD' THEN 'A$1,234.56'
        WHEN currency_config->>'currency' = 'CHF' THEN 'CHF 1,234.56'
        WHEN currency_config->>'currency' = 'CNY' THEN '¥1,234.56'
        WHEN currency_config->>'currency' = 'MXN' THEN '$1,234.56'
        WHEN currency_config->>'currency' = 'BRL' THEN 'R$ 1.234,56'
        ELSE '$1,234.56'
    END as example_format
FROM restaurants 
ORDER BY updated_at DESC;

-- 5. Verificar que los menús tienen precios
SELECT 
    'Verificando precios de menús:' as info;

SELECT 
    r.name as restaurant_name,
    r.currency_config->>'currency' as currency,
    mi.name as item_name,
    mi.price,
    CASE 
        WHEN r.currency_config->>'currency' = 'USD' THEN '$' || mi.price::text
        WHEN r.currency_config->>'currency' = 'EUR' THEN mi.price::text || '€'
        WHEN r.currency_config->>'currency' = 'GBP' THEN '£' || mi.price::text
        WHEN r.currency_config->>'currency' = 'JPY' THEN '¥' || mi.price::text
        WHEN r.currency_config->>'currency' = 'CAD' THEN 'C$' || mi.price::text
        WHEN r.currency_config->>'currency' = 'AUD' THEN 'A$' || mi.price::text
        WHEN r.currency_config->>'currency' = 'CHF' THEN 'CHF ' || mi.price::text
        WHEN r.currency_config->>'currency' = 'CNY' THEN '¥' || mi.price::text
        WHEN r.currency_config->>'currency' = 'MXN' THEN '$' || mi.price::text
        WHEN r.currency_config->>'currency' = 'BRL' THEN 'R$ ' || mi.price::text
        ELSE '$' || mi.price::text
    END as formatted_price
FROM restaurants r
JOIN categories c ON c.restaurant_id = r.id
JOIN menu_items mi ON mi.category_id = c.id
WHERE mi.is_available = true
ORDER BY r.name, mi.name
LIMIT 10;

-- 6. Verificar que el hook useRestaurantCurrency puede acceder a los datos
SELECT 
    'Verificando acceso a currency_config:' as info;

SELECT 
    id,
    name,
    currency_config
FROM restaurants 
WHERE currency_config IS NOT NULL
ORDER BY updated_at DESC;



