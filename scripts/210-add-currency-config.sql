-- Script para añadir configuración de moneda a la tabla restaurants
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual
SELECT 
    'Estructura actual de la tabla restaurants:' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;

-- 2. Añadir columna para configuración de moneda
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS currency_config jsonb DEFAULT '{
  "currency_code": "USD",
  "currency_symbol": "$",
  "currency_name": "US Dollar",
  "decimal_places": 2,
  "thousands_separator": ",",
  "decimal_separator": ".",
  "position": "before"
}'::jsonb;

-- 3. Verificar que se añadió correctamente
SELECT 
    'Verificando nueva columna currency_config:' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name = 'currency_config';

-- 4. Crear índice para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_restaurants_currency_config 
ON restaurants USING gin (currency_config);

-- 5. Mostrar algunos ejemplos de configuración de moneda
SELECT 
    'Ejemplos de configuración de moneda:' as info;

-- Configuración para USD
SELECT 
    'USD' as currency_code,
    '$' as currency_symbol,
    'US Dollar' as currency_name,
    2 as decimal_places,
    ',' as thousands_separator,
    '.' as decimal_separator,
    'before' as position;

-- Configuración para EUR
SELECT 
    'EUR' as currency_code,
    '€' as currency_symbol,
    'Euro' as currency_name,
    2 as decimal_places,
    '.' as thousands_separator,
    ',' as decimal_separator,
    'after' as position;

-- Configuración para GBP
SELECT 
    'GBP' as currency_code,
    '£' as currency_symbol,
    'British Pound' as currency_name,
    2 as decimal_places,
    ',' as thousands_separator,
    '.' as decimal_separator,
    'before' as position;

-- 6. Actualizar restaurantes existentes con configuración por defecto
UPDATE restaurants 
SET currency_config = '{
  "currency_code": "USD",
  "currency_symbol": "$",
  "currency_name": "US Dollar",
  "decimal_places": 2,
  "thousands_separator": ",",
  "decimal_separator": ".",
  "position": "before"
}'::jsonb
WHERE currency_config IS NULL;

-- 7. Verificar datos actualizados
SELECT 
    'Verificando datos actualizados:' as info;

SELECT 
    name,
    currency_config->>'currency_code' as currency_code,
    currency_config->>'currency_symbol' as currency_symbol,
    currency_config->>'currency_name' as currency_name,
    currency_config->>'decimal_places' as decimal_places,
    currency_config->>'position' as symbol_position
FROM restaurants 
LIMIT 5;




