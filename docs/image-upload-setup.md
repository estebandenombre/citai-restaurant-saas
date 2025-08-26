# Configuración de Subida de Imágenes

Este documento explica cómo configurar el sistema de subida de imágenes para los platos del menú en Tably.

## Requisitos Previos

- Acceso al dashboard de Supabase
- Permisos de administrador en el proyecto

## Configuración del Bucket de Almacenamiento

### 1. Crear el Bucket

1. Ve al dashboard de Supabase
2. Navega a **Storage** en el menú lateral
3. Haz clic en **Create a new bucket**
4. Configura el bucket con los siguientes parámetros:
   - **Name**: `images`
   - **Public bucket**: ✅ Habilitado
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### 2. Configurar Políticas RLS

Ejecuta el siguiente SQL en la consola SQL de Supabase:

```sql
-- Crear políticas RLS para el bucket de imágenes
-- Permitir lectura pública de imágenes
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Permitir inserción de imágenes solo a usuarios autenticados
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Permitir actualización de imágenes solo al propietario
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir eliminación de imágenes solo al propietario
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Alternativa: Usar el Script de Migración

Si prefieres usar el script de migración automático:

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `scripts/29-create-storage-bucket.sql`
3. Ejecuta el script completo

## Estructura de Carpetas

Las imágenes se organizan de la siguiente manera:

```
images/
└── menu-items/
    └── {restaurant_id}/
        ├── {timestamp}-{random_id}.jpg
        ├── {timestamp}-{random_id}.png
        └── ...
```

### Ejemplo:
```
images/menu-items/restaurant-123/1703123456789-abc123def456.jpg
```

## Características del Sistema

### Validación de Archivos
- **Tipos permitidos**: JPG, PNG, GIF, WebP
- **Tamaño máximo**: 5MB
- **Validación en tiempo real** con mensajes de error claros

### Optimización Automática
- **Redimensionamiento**: Máximo 1200px de ancho
- **Compresión**: Calidad 80% para JPG
- **Mantenimiento del aspect ratio**

### Funcionalidades
- **Drag & Drop**: Arrastra y suelta imágenes
- **Click to Upload**: Haz clic para seleccionar archivo
- **Preview**: Vista previa antes de subir
- **Información de imagen**: Dimensiones y tamaño
- **Eliminación**: Botón para quitar imagen seleccionada

## Uso en el Formulario

### Subida de Imagen
1. Ve a **Menu** → **Add Menu Item**
2. En la pestaña **Details**, encuentra la sección **Dish Image**
3. Arrastra una imagen o haz clic para seleccionar
4. La imagen se validará y mostrará una vista previa
5. Al guardar el plato, la imagen se subirá automáticamente

### URL Externa (Alternativa)
Si prefieres usar una URL externa:
1. En la sección **Image URL (optional)**
2. Pega la URL de la imagen
3. La URL se validará al guardar

## Manejo de Errores

### Errores Comunes
- **Archivo muy grande**: "El archivo es demasiado grande. Máximo 5MB"
- **Tipo no soportado**: "Tipo de archivo no soportado. Solo se permiten: JPG, PNG, GIF, WebP"
- **Error de subida**: "Error al subir la imagen. Inténtalo de nuevo."

### Solución de Problemas

#### Error: "Bucket not found"
1. Verifica que el bucket `images` existe en Storage
2. Ejecuta el script de migración si es necesario

#### Error: "Permission denied"
1. Verifica que las políticas RLS están configuradas correctamente
2. Asegúrate de que el usuario está autenticado

#### Error: "File too large"
1. Comprime la imagen antes de subirla
2. Usa un formato más eficiente (WebP en lugar de PNG)

## Seguridad

### Políticas de Acceso
- **Lectura pública**: Las imágenes son accesibles públicamente
- **Escritura autenticada**: Solo usuarios autenticados pueden subir
- **Propiedad**: Los usuarios solo pueden modificar sus propias imágenes

### Validación
- **Tipo de archivo**: Solo imágenes permitidas
- **Tamaño**: Límite de 5MB por archivo
- **Contenido**: Validación de MIME type

## Optimización de Rendimiento

### Compresión
- Las imágenes se comprimen automáticamente
- Calidad optimizada para web (80%)
- Redimensionamiento para pantallas grandes

### Caché
- Cache-Control: 3600 segundos (1 hora)
- CDN de Supabase para distribución global

## Monitoreo

### Logs
- Los errores de subida se registran en la consola del navegador
- Errores del servidor en los logs de Supabase

### Métricas
- Tamaño de archivos subidos
- Tipos de archivo más comunes
- Errores de validación

## Próximos Pasos

### Mejoras Futuras
- [ ] Soporte para múltiples imágenes por plato
- [ ] Galería de imágenes
- [ ] Recorte de imágenes
- [ ] Filtros y efectos
- [ ] Optimización automática por dispositivo

### Integración
- [ ] Mostrar imágenes en el menú público
- [ ] Thumbnails en listas
- [ ] Lazy loading
- [ ] Placeholder mientras carga

