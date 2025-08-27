-- Script para simplificar la configuración de moneda
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual
SELECT 
    'Estructura actual de currency_config:' as info;

SELECT 
    name,
    currency_config
FROM restaurants 
WHERE currency_config IS NOT NULL
LIMIT 3;

-- 2. Simplificar la configuración de moneda
UPDATE restaurants 
SET currency_config = '{
  "currency": "USD",
  "position": "before"
}'::jsonb
WHERE currency_config IS NULL OR currency_config = 'null'::jsonb;

-- 3. Migrar configuraciones existentes complejas a la nueva estructura simple
UPDATE restaurants 
SET currency_config = CASE 
  WHEN currency_config->>'currency_code' = 'EUR' THEN '{"currency": "EUR", "position": "after"}'::jsonb
  WHEN currency_config->>'currency_code' = 'GBP' THEN '{"currency": "GBP", "position": "before"}'::jsonb
  WHEN currency_config->>'currency_code' = 'JPY' THEN '{"currency": "JPY", "position": "before"}'::jsonb
  WHEN currency_config->>'currency_code' = 'CAD' THEN '{"currency": "CAD", "position": "before"}'::jsonb
  WHEN currency_config->>'currency_code' = 'AUD' THEN '{"currency": "AUD", "position": "before"}'::jsonb
  WHEN currency_config->>'currency_code' = 'CHF' THEN '{"currency": "CHF", "position": "before"}'::jsonb
  WHEN currency_config->>'currency_code' = 'CNY' THEN '{"currency": "CNY", "position": "before"}'::jsonb
  WHEN currency_config->>'currency_code' = 'MXN' THEN '{"currency": "MXN", "position": "before"}'::jsonb
  WHEN currency_config->>'currency_code' = 'BRL' THEN '{"currency": "BRL", "position": "before"}'::jsonb
  ELSE '{"currency": "USD", "position": "before"}'::jsonb
END
WHERE currency_config IS NOT NULL 
AND currency_config->>'currency_code' IS NOT NULL;

-- 4. Verificar la nueva estructura simplificada
SELECT 
    'Nueva estructura simplificada:' as info;

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

-- 5. Crear función helper para formatear moneda
CREATE OR REPLACE FUNCTION format_currency(
    amount DECIMAL,
    currency_code TEXT,
    symbol_position TEXT DEFAULT 'before'
)
RETURNS TEXT AS $$
DECLARE
    formatted_amount TEXT;
    currency_symbol TEXT;
BEGIN
    -- Formatear el número
    formatted_amount := TO_CHAR(amount, 'FM999,999,999,999,999.99');
    
    -- Obtener el símbolo de la moneda
    currency_symbol := CASE currency_code
        WHEN 'USD' THEN '$'
        WHEN 'EUR' THEN '€'
        WHEN 'GBP' THEN '£'
        WHEN 'JPY' THEN '¥'
        WHEN 'CAD' THEN 'C$'
        WHEN 'AUD' THEN 'A$'
        WHEN 'CHF' THEN 'CHF'
        WHEN 'CNY' THEN '¥'
        WHEN 'MXN' THEN '$'
        WHEN 'BRL' THEN 'R$'
        ELSE '$'
    END;
    
    -- Aplicar la posición del símbolo
    IF symbol_position = 'after' THEN
        RETURN formatted_amount || currency_symbol;
    ELSE
        RETURN currency_symbol || formatted_amount;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Probar la función de formateo
SELECT 
    'Probando función de formateo:' as info;

SELECT 
    format_currency(1234.56, 'USD', 'before') as usd_before,
    format_currency(1234.56, 'EUR', 'after') as eur_after,
    format_currency(1234.56, 'GBP', 'before') as gbp_before,
    format_currency(1234, 'JPY', 'before') as jpy_before;



