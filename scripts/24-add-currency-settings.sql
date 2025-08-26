-- Add currency configuration columns to order_settings table
-- This script adds currency_code, currency_symbol, and currency_position columns

-- Add currency_code column (varchar, default 'USD')
ALTER TABLE order_settings 
ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'USD';

-- Add currency_symbol column (varchar, default '$')
ALTER TABLE order_settings 
ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(5) DEFAULT '$';

-- Add currency_position column (varchar, default 'before')
-- Values: 'before' (e.g., $10.00) or 'after' (e.g., 10.00€)
ALTER TABLE order_settings 
ADD COLUMN IF NOT EXISTS currency_position VARCHAR(10) DEFAULT 'before';

-- Update existing records to have default currency settings
UPDATE order_settings 
SET 
  currency_code = 'USD',
  currency_symbol = '$',
  currency_position = 'before'
WHERE currency_code IS NULL OR currency_symbol IS NULL OR currency_position IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN order_settings.currency_code IS 'ISO 4217 currency code (e.g., USD, EUR, GBP)';
COMMENT ON COLUMN order_settings.currency_symbol IS 'Currency symbol (e.g., $, €, £)';
COMMENT ON COLUMN order_settings.currency_position IS 'Position of currency symbol: before or after the amount'; 