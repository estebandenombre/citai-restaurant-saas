-- Script para eliminar usuario de auth.users
-- IMPORTANTE: Solo ejecutar después de eliminar todos los datos del usuario
-- Requiere permisos de administrador en Supabase

-- Cambiar el email del usuario que quieres eliminar
DELETE FROM auth.users WHERE email = 'usuario@ejemplo.com'; -- CAMBIAR AQUÍ EL EMAIL

-- Verificar que fue eliminado
SELECT 
    'VERIFICACION AUTH' as tipo,
    COUNT(*) as usuarios_restantes,
    'usuarios en auth.users con el mismo email' as descripcion
FROM auth.users 
WHERE email = 'usuario@ejemplo.com'; -- CAMBIAR AQUÍ EL EMAIL
