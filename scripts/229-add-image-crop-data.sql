-- Script para agregar datos de recorte de imágenes a la tabla menu_items
-- Ejecutar en la consola SQL de Supabase

-- 1. Agregar columna para datos de recorte
DO $$
BEGIN
  -- Verificar si existe el campo crop_data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'crop_data'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN crop_data JSONB;
  END IF;
END $$;

-- 2. Crear índice para mejorar el rendimiento de consultas con crop_data
CREATE INDEX IF NOT EXISTS idx_menu_items_crop_data 
ON menu_items USING GIN (crop_data) 
WHERE crop_data IS NOT NULL;

-- 3. Crear función para validar datos de recorte
CREATE OR REPLACE FUNCTION validate_crop_data(crop_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar que crop_data tiene la estructura correcta
  IF crop_data IS NULL THEN
    RETURN TRUE; -- NULL es válido (sin recorte)
  END IF;
  
  -- Verificar que tiene los campos requeridos
  IF NOT (
    crop_data ? 'x' AND 
    crop_data ? 'y' AND 
    crop_data ? 'scale' AND 
    crop_data ? 'rotation'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar tipos de datos
  IF NOT (
    jsonb_typeof(crop_data->'x') = 'number' AND
    jsonb_typeof(crop_data->'y') = 'number' AND
    jsonb_typeof(crop_data->'scale') = 'number' AND
    jsonb_typeof(crop_data->'rotation') = 'number'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar rangos válidos
  IF (
    (crop_data->>'scale')::numeric < 0.1 OR 
    (crop_data->>'scale')::numeric > 5.0 OR
    (crop_data->>'rotation')::numeric < -360 OR 
    (crop_data->>'rotation')::numeric > 360
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Agregar constraint para validar crop_data
ALTER TABLE menu_items 
ADD CONSTRAINT check_valid_crop_data 
CHECK (validate_crop_data(crop_data));

-- 5. Crear función para obtener imagen con recorte optimizado
CREATE OR REPLACE FUNCTION get_cropped_image_url(image_url TEXT, crop_data JSONB)
RETURNS TEXT AS $$
BEGIN
  -- Si no hay datos de recorte, devolver URL original
  IF crop_data IS NULL THEN
    RETURN image_url;
  END IF;
  
  -- Si es una imagen de Supabase, agregar parámetros de recorte
  IF image_url LIKE '%supabase.co%' THEN
    RETURN image_url || 
           '?width=400&height=192&quality=80&format=webp' ||
           '&crop_x=' || (crop_data->>'x') ||
           '&crop_y=' || (crop_data->>'y') ||
           '&crop_scale=' || (crop_data->>'scale') ||
           '&crop_rotation=' || (crop_data->>'rotation');
  END IF;
  
  RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear vista para menú con imágenes recortadas
CREATE OR REPLACE VIEW menu_items_with_crops AS
SELECT 
  id,
  restaurant_id,
  name,
  description,
  price,
  image_url,
  get_cropped_image_url(image_url, crop_data) as cropped_image_url,
  crop_data,
  category_id,
  allergens,
  dietary_info,
  ingredients,
  preparation_time,
  is_available,
  is_featured,
  display_order,
  created_at,
  updated_at
FROM menu_items
WHERE is_available = true;

-- 7. Crear función para limpiar datos de recorte huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_crop_data()
RETURNS void AS $$
BEGIN
  -- Eliminar datos de recorte de elementos sin imagen
  UPDATE menu_items 
  SET crop_data = NULL 
  WHERE image_url IS NULL OR image_url = '';
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para limpiar crop_data cuando se elimina imagen
CREATE OR REPLACE FUNCTION cleanup_crop_data_on_image_remove()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se eliminó la imagen, eliminar también los datos de recorte
  IF OLD.image_url IS NOT NULL AND (NEW.image_url IS NULL OR NEW.image_url = '') THEN
    NEW.crop_data = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_cleanup_crop_data ON menu_items;
CREATE TRIGGER trigger_cleanup_crop_data
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_crop_data_on_image_remove();

-- 9. Crear estadísticas de uso de recorte
CREATE OR REPLACE VIEW crop_data_stats AS
SELECT 
  COUNT(*) as total_menu_items,
  COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as items_with_images,
  COUNT(CASE WHEN crop_data IS NOT NULL THEN 1 END) as items_with_crop_data,
  ROUND(
    (COUNT(CASE WHEN crop_data IS NOT NULL THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END), 0)) * 100, 
    2
  ) as crop_data_usage_percentage
FROM menu_items;

-- 10. Mensaje de confirmación
SELECT 
  'Image crop data configuration completed successfully!' as status,
  'Crop data column added' as column_status,
  'Validation functions created' as validation_status,
  'Optimized view created' as view_status,
  'Cleanup functions configured' as cleanup_status;

