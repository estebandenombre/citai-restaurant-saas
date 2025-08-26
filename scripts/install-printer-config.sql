-- Script de instalación para configuración de impresión
-- Ejecutar este script en Supabase SQL Editor

-- Verificar si la columna ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'printer_config'
    ) THEN
        -- Agregar columna printer_config
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

        -- Agregar comentario
        COMMENT ON COLUMN restaurants.printer_config IS 'JSON configuration for receipt printing settings per restaurant';

        -- Crear índice para mejor rendimiento
        CREATE INDEX idx_restaurants_printer_config ON restaurants USING GIN (printer_config);

        RAISE NOTICE 'Columna printer_config agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna printer_config ya existe';
    END IF;
END $$;

-- Verificar y crear políticas RLS si no existen
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
        AND policyname = 'Users can view printer config for their restaurant'
    ) THEN
        CREATE POLICY "Users can view printer config for their restaurant" ON restaurants
            FOR SELECT USING (
                auth.uid() IN (
                    SELECT id FROM users WHERE restaurant_id = restaurants.id
                )
            );
        RAISE NOTICE 'Política SELECT creada';
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
        AND policyname = 'Users can update printer config for their restaurant'
    ) THEN
        CREATE POLICY "Users can update printer config for their restaurant" ON restaurants
            FOR UPDATE USING (
                auth.uid() IN (
                    SELECT id FROM users WHERE restaurant_id = restaurants.id
                )
            );
        RAISE NOTICE 'Política UPDATE creada';
    END IF;
END $$;

-- Mostrar resumen de la instalación
SELECT 
    'Configuración de impresión instalada exitosamente' as status,
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN printer_config IS NOT NULL THEN 1 END) as restaurants_with_config
FROM restaurants; 