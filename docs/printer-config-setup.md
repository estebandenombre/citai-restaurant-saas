# Configuración de Impresión de Tickets

## 📋 Descripción

Este sistema permite a cada restaurante configurar su propia impresora de tickets con configuraciones personalizadas.

## 🚀 Instalación

### 1. Ejecutar Migración SQL

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido de `scripts/install-printer-config.sql`
3. Ejecuta el script

### 2. Verificar Instalación

Ejecuta el script de verificación:
1. Copia y pega el contenido de `scripts/verify-printer-config.sql`
2. Ejecuta el script
3. Verifica que todos los elementos estén presentes

El script mostrará un resumen con:
- ✅ Estado de la instalación
- 📊 Total de restaurantes
- 🔧 Restaurantes con configuración
- 🛡️ Políticas RLS activas

## 🖨️ Configuración por Restaurante

### Acceso a la Configuración

1. Inicia sesión en el dashboard
2. Ve a **Settings** → **Printer** en el sidebar
3. Configura tu impresora

### Opciones de Configuración

#### **Configuración de Impresora**
- ✅ **Habilitar Impresión**: Activar/desactivar impresión automática
- 🖨️ **Tipo de Impresora**: Thermal, Network, PDF, ESC/POS
- 🌐 **IP de Impresora**: Para impresoras de red
- 🔌 **Puerto**: Puerto de la impresora (default: 9100)
- 📏 **Ancho de Papel**: Ancho en mm (default: 80mm)
- ✂️ **Auto-corte**: Cortar papel automáticamente

#### **Personalización de Tickets**
- 🖼️ **Logo del Restaurante**: Incluir logo en tickets
- 📝 **Texto de Encabezado**: Mensaje personalizado arriba
- 📝 **Texto de Pie**: Mensaje personalizado abajo
- 🧪 **Test de Impresión**: Probar configuración

## 🗄️ Estructura de Base de Datos

### Tabla: `restaurants`

```sql
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
```

### Campos de Configuración

| Campo | Tipo | Descripción | Default |
|-------|------|-------------|---------|
| `enabled` | boolean | Habilitar impresión | `false` |
| `printer_type` | string | Tipo de impresora | `"thermal"` |
| `printer_ip` | string | IP de impresora de red | `null` |
| `printer_port` | number | Puerto de impresora | `9100` |
| `paper_width` | number | Ancho de papel en mm | `80` |
| `auto_cut` | boolean | Auto-corte de papel | `true` |
| `print_logo` | boolean | Incluir logo | `true` |
| `header_text` | string | Texto de encabezado | `null` |
| `footer_text` | string | Texto de pie | `"Thank you for your order!"` |

## 🔧 Tipos de Impresoras Soportadas

### 1. **Thermal Printer** 🖨️
- Impresoras térmicas de tickets
- Comandos ESC/POS
- Conexión por red o USB

### 2. **Network Printer** 🌐
- Impresoras de red
- Configuración por IP y puerto
- Ideal para restaurantes grandes

### 3. **PDF (Local Print)** 📄
- Genera PDF para impresión local
- Abre en nueva ventana
- Imprime desde navegador

### 4. **ESC/POS** 📋
- Comandos ESC/POS específicos
- Para impresoras especializadas
- Configuración avanzada

## 🧪 Testing

### Test de Impresión
1. Configura tu impresora
2. Click en **"Send Test Receipt"**
3. Verifica que el ticket se imprima correctamente

### Verificar Configuración
```sql
-- Ver restaurantes con impresión habilitada
SELECT 
  id,
  name,
  printer_config->>'enabled' as printer_enabled,
  printer_config->>'printer_type' as printer_type,
  printer_config->>'printer_ip' as printer_ip
FROM restaurants 
WHERE printer_config->>'enabled' = 'true';
```

## 🔒 Seguridad

### Políticas RLS (Row Level Security)
- Usuarios solo pueden ver/editar configuración de su restaurante
- Políticas automáticas por `restaurant_id`
- Acceso controlado por autenticación

### Validación
- Configuración validada antes de guardar
- Valores por defecto seguros
- Manejo de errores robusto

## 🚨 Troubleshooting

### Problemas Comunes

#### **1. Error de Conexión**
```
Error: Cannot connect to printer
```
**Solución:**
- Verificar IP y puerto de la impresora
- Comprobar conectividad de red
- Verificar que la impresora esté encendida

#### **2. Ticket No Se Imprime**
```
Error: Print failed
```
**Solución:**
- Verificar que la impresión esté habilitada
- Comprobar configuración de impresora
- Ejecutar test de impresión

#### **3. Configuración No Se Guarda**
```
Error: Configuration not saved
```
**Solución:**
- Verificar permisos de usuario
- Comprobar conexión a base de datos
- Revisar políticas RLS

#### **4. Error de Columna user_id**
```
ERROR: 42703: column "user_id" does not exist
```
**Solución:**
- ✅ **CORREGIDO**: Las políticas RLS ahora usan `id` en lugar de `user_id`
- Ejecutar el script actualizado: `scripts/install-printer-config.sql`
- Verificar con: `scripts/verify-printer-config.sql`

#### **5. Error de Políticas RLS**
```
Error: Policy not found
```
**Solución:**
- Ejecutar el script de instalación completo
- Verificar que las políticas se crearon correctamente
- Comprobar que RLS está habilitado en la tabla restaurants

### Logs de Debug
```javascript
// En la consola del navegador
console.log('Printer config:', config)
console.log('Save result:', result)
```

### Verificación de Instalación
```sql
-- Ejecutar este script para verificar la instalación
-- Copiar contenido de scripts/verify-printer-config.sql
```

## 📞 Soporte

Si tienes problemas:
1. Revisa la configuración de tu impresora
2. Ejecuta el test de impresión
3. Verifica los logs en la consola
4. Ejecuta el script de verificación
5. Contacta al equipo de soporte

## 🔄 Actualizaciones

### Migración de Versiones Anteriores
```sql
-- Si tienes configuración anterior
UPDATE restaurants 
SET printer_config = '{
  "enabled": true,
  "printer_type": "thermal",
  "printer_ip": "192.168.1.100",
  "printer_port": 9100,
  "paper_width": 80,
  "auto_cut": true,
  "print_logo": true,
  "header_text": "Welcome!",
  "footer_text": "Thank you!"
}'::jsonb
WHERE id = 'your-restaurant-id';
```

## ✅ Checklist de Instalación

- [ ] Ejecutar `scripts/install-printer-config.sql`
- [ ] Verificar con `scripts/verify-printer-config.sql`
- [ ] Comprobar que la columna `printer_config` existe
- [ ] Verificar que el índice `idx_restaurants_printer_config` existe
- [ ] Confirmar que las políticas RLS están activas
- [ ] Probar la configuración desde el dashboard
- [ ] Ejecutar test de impresión 