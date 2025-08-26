# Multiidioma Setup - Sistema de Traducciones

## 📋 Descripción General

El sistema de multiidioma permite que los elementos del menú tengan nombres y descripciones en diferentes idiomas. Esto es especialmente útil para restaurantes que atienden a clientes internacionales o que operan en regiones con múltiples idiomas oficiales.

## 🗄️ Estructura de la Base de Datos

### Campo `translations` en `menu_items`

```sql
ALTER TABLE menu_items 
ADD COLUMN translations JSONB;
```

### Estructura JSON de las traducciones

```json
{
  "es": {
    "name": "Pizza Margherita",
    "description": "Pizza italiana clásica con tomate y mozzarella"
  },
  "fr": {
    "name": "Pizza Margherita", 
    "description": "Pizza italienne classique avec tomate et mozzarella"
  },
  "de": {
    "name": "Pizza Margherita",
    "description": "Klassische italienische Pizza mit Tomate und Mozzarella"
  }
}
```

## 🌍 Idiomas Soportados

| Código | Idioma | Bandera | Nombre |
|--------|--------|---------|--------|
| `en` | English | 🇺🇸 | English |
| `es` | Español | 🇪🇸 | Español |
| `fr` | Français | 🇫🇷 | Français |
| `de` | Deutsch | 🇩🇪 | Deutsch |
| `it` | Italiano | 🇮🇹 | Italiano |
| `pt` | Português | 🇵🇹 | Português |
| `ca` | Català | 🏴󠁥󠁳󠁣󠁴󠁿 | Català |
| `eu` | Euskara | 🏴󠁥󠁳󠁰󠁶󠁿 | Euskara |
| `gl` | Galego | 🏴󠁥󠁳󠁧󠁡󠁿 | Galego |

## 🚀 Configuración

### 1. Ejecutar la migración de base de datos

```sql
-- Ejecutar en la consola SQL de Supabase
-- Ver archivo: scripts/30-add-translations-field.sql
```

### 2. Verificar la instalación

```sql
-- Verificar que la columna se creó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menu_items' AND column_name = 'translations';
```

## 📝 Uso en el Formulario

### Añadir Traducciones

1. **Abrir el formulario** de añadir/editar elemento del menú
2. **Ir a la pestaña "Translations"**
3. **Seleccionar un idioma** del dropdown
4. **Completar los campos**:
   - **Name**: Nombre del plato en el idioma seleccionado
   - **Description**: Descripción del plato en el idioma seleccionado
5. **Repetir** para cada idioma deseado

### Gestión de Traducciones

- **Añadir**: Seleccionar idioma del dropdown
- **Eliminar**: Hacer clic en el botón ❌ junto al idioma
- **Editar**: Modificar directamente los campos de texto

## 🔧 Hook `useTranslations`

### Importación

```typescript
import { useTranslations, SUPPORTED_LANGUAGES } from "@/hooks/use-translations"
```

### Uso Básico

```typescript
const { name, description, hasTranslation, getTranslation } = useTranslations(
  menuItem.name,           // Nombre por defecto
  menuItem.description,    // Descripción por defecto
  menuItem.translations,   // Objeto de traducciones
  'es'                     // Idioma actual
)
```

### Funciones Disponibles

```typescript
// Obtener contenido traducido
const { name, description } = useTranslations(...)

// Verificar si existe traducción
const hasSpanish = hasTranslation('es')

// Obtener traducción específica
const spanishTranslation = getTranslation('es')

// Obtener idiomas disponibles
const availableLanguages = getAvailableLanguages()
```

## 🎨 Componente `TranslationBadge`

### Uso

```typescript
import { TranslationBadge } from "@/components/menu/translation-badge"

<TranslationBadge 
  translations={menuItem.translations}
  className="mt-2"
/>
```

### Resultado Visual

Muestra badges con banderas e idiomas disponibles:
🇪🇸 ES 🇫🇷 FR 🇩🇪 DE

## 📊 Ejemplos de Uso

### 1. Crear elemento con traducciones

```typescript
const newMenuItem = {
  name: "Margherita Pizza",
  description: "Classic Italian pizza with tomato and mozzarella",
  price: 12.99,
  translations: {
    es: {
      name: "Pizza Margherita",
      description: "Pizza italiana clásica con tomate y mozzarella"
    },
    fr: {
      name: "Pizza Margherita",
      description: "Pizza italienne classique avec tomate et mozzarella"
    }
  }
}
```

### 2. Mostrar contenido traducido

```typescript
function MenuItemDisplay({ item, currentLanguage }) {
  const { name, description } = useTranslations(
    item.name,
    item.description,
    item.translations,
    currentLanguage
  )

  return (
    <div>
      <h3>{name}</h3>
      <p>{description}</p>
      <TranslationBadge translations={item.translations} />
    </div>
  )
}
```

### 3. Selector de idioma

```typescript
function LanguageSelector({ currentLanguage, onLanguageChange }) {
  return (
    <Select value={currentLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

## 🔍 Consultas SQL Útiles

### Buscar elementos con traducciones

```sql
-- Elementos que tienen traducciones
SELECT * FROM menu_items 
WHERE translations IS NOT NULL;

-- Elementos con traducción en español
SELECT * FROM menu_items 
WHERE translations->>'es' IS NOT NULL;

-- Contar elementos por idioma
SELECT 
  COUNT(*) as total_items,
  COUNT(translations->>'es') as spanish_translations,
  COUNT(translations->>'fr') as french_translations
FROM menu_items;
```

### Actualizar traducciones existentes

```sql
-- Añadir traducción en español a un elemento específico
UPDATE menu_items 
SET translations = COALESCE(translations, '{}'::jsonb) || 
    '{"es": {"name": "Nuevo Nombre", "description": "Nueva Descripción"}}'::jsonb
WHERE id = 'item_id_here';
```

## ⚠️ Consideraciones Importantes

### 1. Idioma por Defecto
- El idioma principal (generalmente inglés) se almacena en los campos `name` y `description`
- Las traducciones son adicionales y opcionales

### 2. Validación
- Los campos de traducción son opcionales
- Si no existe traducción, se usa el contenido por defecto
- Los nombres de idioma deben coincidir con los códigos soportados

### 3. Rendimiento
- Se creó un índice GIN para búsquedas eficientes en JSONB
- Las consultas con filtros por idioma son optimizadas

### 4. Compatibilidad
- El sistema es retrocompatible
- Los elementos existentes sin traducciones funcionan normalmente
- El campo `translations` puede ser NULL

## 🚀 Próximas Mejoras

1. **Traducción automática** usando APIs como Google Translate
2. **Gestión masiva** de traducciones
3. **Validación de idiomas** en tiempo real
4. **Exportación/importación** de traducciones
5. **Soporte para más idiomas** según demanda
6. **Traducción de categorías** y otros elementos del menú

## 📞 Soporte

Para dudas o problemas con la funcionalidad de multiidioma:

1. Verificar que la migración se ejecutó correctamente
2. Revisar la estructura JSON de las traducciones
3. Confirmar que los códigos de idioma son válidos
4. Verificar los permisos de RLS en Supabase






