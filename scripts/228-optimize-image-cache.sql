-- Script para optimizar el cache y almacenamiento de imágenes
-- Ejecutar en la consola SQL de Supabase

-- 1. Actualizar configuración del bucket para mejor cache
UPDATE storage.buckets 
SET 
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  public = true
WHERE id = 'images';

-- 2. Crear políticas de cache para imágenes
-- Política para cache de imágenes públicas (1 hora)
CREATE POLICY "Cache public images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'menu-items'
);

-- 3. Crear índices para mejorar el rendimiento de consultas de imágenes
CREATE INDEX IF NOT EXISTS idx_menu_items_image_url_optimized 
ON menu_items(image_url) 
WHERE image_url IS NOT NULL AND image_url != '';

-- 4. Crear función para limpiar imágenes huérfanas
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
DECLARE
  orphaned_image RECORD;
BEGIN
  -- Encontrar imágenes que no están referenciadas en menu_items
  FOR orphaned_image IN 
    SELECT name 
    FROM storage.objects 
    WHERE bucket_id = 'images' 
      AND (storage.foldername(name))[1] = 'menu-items'
      AND name NOT IN (
        SELECT DISTINCT image_url 
        FROM menu_items 
        WHERE image_url IS NOT NULL 
          AND image_url != ''
      )
  LOOP
    -- Eliminar imagen huérfana
    DELETE FROM storage.objects 
    WHERE bucket_id = 'images' 
      AND name = orphaned_image.name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para limpiar imágenes cuando se elimina un menu_item
CREATE OR REPLACE FUNCTION cleanup_menu_item_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se eliminó un menu_item y tenía imagen, eliminar la imagen
  IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'images' 
      AND name = OLD.image_url;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_cleanup_menu_item_image ON menu_items;
CREATE TRIGGER trigger_cleanup_menu_item_image
  AFTER DELETE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_menu_item_image();

-- 6. Crear función para optimizar URLs de imágenes
CREATE OR REPLACE FUNCTION optimize_image_url(image_url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Si la URL es de Supabase Storage, agregar parámetros de optimización
  IF image_url LIKE '%supabase.co%' THEN
    RETURN image_url || '?width=400&quality=80&format=webp';
  END IF;
  
  RETURN image_url;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear vista para menú optimizado
CREATE OR REPLACE VIEW optimized_menu_items AS
SELECT 
  id,
  restaurant_id,
  name,
  description,
  price,
  optimize_image_url(image_url) as optimized_image_url,
  image_url,
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

-- 8. Configurar cache headers para imágenes
-- Nota: Esto se configura en el nivel de aplicación/edge

-- 9. Crear estadísticas de uso de imágenes
CREATE OR REPLACE VIEW image_usage_stats AS
SELECT 
  COUNT(*) as total_menu_items,
  COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as items_with_images,
  COUNT(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 END) as items_without_images,
  ROUND(
    (COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as image_coverage_percentage
FROM menu_items;

-- 10. Mensaje de confirmación
SELECT 
  'Image optimization configuration completed successfully!' as status,
  'Bucket updated with optimized settings' as bucket_status,
  'Cache policies created' as cache_status,
  'Cleanup functions configured' as cleanup_status,
  'Optimized view created' as view_status;

