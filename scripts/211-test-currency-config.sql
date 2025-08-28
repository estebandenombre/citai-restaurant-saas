-- Script para probar la configuración de moneda
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que la columna currency_config existe
SELECT 
    'Verificando columna currency_config:' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name = 'currency_config';

-- 2. Actualizar un restaurante con configuración de EUR
UPDATE restaurants 
SET currency_config = '{
  "currency_code": "EUR",
  "currency_symbol": "€",
  "currency_name": "Euro",
  "decimal_places": 2,
  "thousands_separator": ".",
  "decimal_separator": ",",
  "position": "after"
}'::jsonb
WHERE id = (SELECT id FROM restaurants LIMIT 1);

-- 3. Actualizar otro restaurante con configuración de GBP
UPDATE restaurants 
SET currency_config = '{
  "currency_code": "GBP",
  "currency_symbol": "£",
  "currency_name": "British Pound",
  "decimal_places": 2,
  "thousands_separator": ",",
  "decimal_separator": ".",
  "position": "before"
}'::jsonb
WHERE id = (SELECT id FROM restaurants LIMIT 1 OFFSET 1);

-- 4. Verificar las configuraciones actualizadas
SELECT 
    'Configuraciones de moneda actualizadas:' as info;

SELECT 
    name,
    currency_config->>'currency_code' as currency_code,
    currency_config->>'currency_symbol' as currency_symbol,
    currency_config->>'currency_name' as currency_name,
    currency_config->>'decimal_places' as decimal_places,
    currency_config->>'thousands_separator' as thousands_separator,
    currency_config->>'decimal_separator' as decimal_separator,
    currency_config->>'position' as symbol_position
FROM restaurants 
WHERE currency_config IS NOT NULL
ORDER BY updated_at DESC;

-- 5. Probar diferentes configuraciones de moneda
SELECT 
    'Ejemplos de formateo de moneda:' as info;

-- USD: $1,234.56
SELECT 
    'USD' as currency,
    '$1,234.56' as example_format;

-- EUR: 1.234,56€
SELECT 
    'EUR' as currency,
    '1.234,56€' as example_format;

-- GBP: £1,234.56
SELECT 
    'GBP' as currency,
    '£1,234.56' as example_format;

-- 6. Verificar que el índice existe
SELECT 
    'Verificando índice de currency_config:' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'restaurants' 
AND indexname LIKE '%currency%';




