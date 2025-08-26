-- Add tax configuration columns to order_settings table
-- This script adds tax_enabled, tax_rate, and tax_name columns to the order_settings table

-- Add tax_enabled column (boolean, default false)
ALTER TABLE order_settings 
ADD COLUMN IF NOT EXISTS tax_enabled BOOLEAN DEFAULT false;

-- Add tax_rate column (numeric, default 0)
ALTER TABLE order_settings 
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;

-- Add tax_name column (varchar, default 'Tax')
ALTER TABLE order_settings 
ADD COLUMN IF NOT EXISTS tax_name VARCHAR(50) DEFAULT 'Tax';

-- Update existing records to have default tax settings
UPDATE order_settings 
SET 
  tax_enabled = false,
  tax_rate = 0,
  tax_name = 'Tax'
WHERE tax_enabled IS NULL OR tax_rate IS NULL OR tax_name IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN order_settings.tax_enabled IS 'Whether tax is enabled for this restaurant';
COMMENT ON COLUMN order_settings.tax_rate IS 'Tax rate as a percentage (e.g., 8.5 for 8.5%)';
COMMENT ON COLUMN order_settings.tax_name IS 'Name of the tax (e.g., Sales Tax, VAT, GST)'; 