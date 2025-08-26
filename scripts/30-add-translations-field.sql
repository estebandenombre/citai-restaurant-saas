-- Script para añadir soporte de traducciones a la tabla menu_items
-- Ejecutar en la consola SQL de Supabase

-- Añadir columna translations a la tabla menu_items
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS translations JSONB;

-- Comentario sobre la estructura de traducciones
COMMENT ON COLUMN menu_items.translations IS 'JSON object containing translations for different languages. Format: {"en": {"name": "English Name", "description": "English Description"}, "es": {"name": "Nombre Español", "description": "Descripción Española"}}';

-- Crear índice para búsquedas eficientes en traducciones
CREATE INDEX IF NOT EXISTS idx_menu_items_translations 
ON menu_items USING GIN (translations);

-- Actualizar políticas RLS si es necesario (mantener las existentes)
-- Las políticas existentes deberían seguir funcionando con el nuevo campo

-- Ejemplo de uso:
-- INSERT INTO menu_items (restaurant_id, name, description, price, translations) 
-- VALUES (
--   'restaurant_id_here',
--   'Margherita Pizza',
--   'Classic Italian pizza with tomato and mozzarella',
--   12.99,
--   '{
--     "es": {
--       "name": "Pizza Margherita",
--       "description": "Pizza italiana clásica con tomate y mozzarella"
--     },
--     "fr": {
--       "name": "Pizza Margherita",
--       "description": "Pizza italienne classique avec tomate et mozzarella"
--     }
--   }'::jsonb
-- );




