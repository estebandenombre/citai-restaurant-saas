-- Migration: Add printer configuration to restaurants table
-- Date: 2024-01-XX
-- Description: Adds printer_config JSONB column to store printer settings per restaurant

-- Add printer_config column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN printer_config JSONB DEFAULT '{
  "enabled": false,
  "printer_type": "thermal",
  "printer_ip": null,
  "printer_port": 9100,
  "printer_name": null,
  "paper_width": 80,
  "auto_cut": true,
  "print_logo": true,
  "header_text": null,
  "footer_text": "Thank you for your order!"
}'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN restaurants.printer_config IS 'JSON configuration for receipt printing settings per restaurant';

-- Create index for better query performance
CREATE INDEX idx_restaurants_printer_config ON restaurants USING GIN (printer_config);

-- Add RLS policy for printer_config access
-- This ensures users can only access printer_config for their own restaurant
CREATE POLICY "Users can view printer config for their restaurant" ON restaurants
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE restaurant_id = restaurants.id
        )
    );

CREATE POLICY "Users can update printer config for their restaurant" ON restaurants
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM users WHERE restaurant_id = restaurants.id
        )
    );

-- Example of how to update printer config for a specific restaurant
-- UPDATE restaurants 
-- SET printer_config = '{
--   "enabled": true,
--   "printer_type": "thermal",
--   "printer_ip": "192.168.1.100",
--   "printer_port": 9100,
--   "paper_width": 80,
--   "auto_cut": true,
--   "print_logo": true,
--   "header_text": "Welcome to our restaurant!",
--   "footer_text": "Thank you for your order!"
-- }'::jsonb
-- WHERE id = 'restaurant-uuid-here';

-- Example of how to query printer config
-- SELECT 
--   id,
--   name,
--   printer_config->>'enabled' as printer_enabled,
--   printer_config->>'printer_type' as printer_type,
--   printer_config->>'printer_ip' as printer_ip
-- FROM restaurants 
-- WHERE printer_config->>'enabled' = 'true'; 