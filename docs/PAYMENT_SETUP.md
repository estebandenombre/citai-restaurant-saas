# Configuración de Pasarelas de Pago

## 📋 Resumen

Este sistema permite a cada restaurante configurar sus propias pasarelas de pago de manera independiente y segura. Cada restaurante tiene su propia configuración que no se mezcla con otros restaurantes.

## 🗄️ Estructura de Base de Datos

### Tabla: `restaurant_payment_settings`

```sql
CREATE TABLE restaurant_payment_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones de seguridad
    CONSTRAINT unique_restaurant_payment_settings UNIQUE (restaurant_id),
    CONSTRAINT valid_payment_settings CHECK (
        jsonb_typeof(settings) = 'object' AND
        settings ? 'payments_enabled' AND
        settings ? 'gateways' AND
        jsonb_typeof(settings->'gateways') = 'object'
    )
);
```

### Características de Seguridad

- ✅ **Row Level Security (RLS)** habilitado
- ✅ **Políticas de acceso** por restaurante
- ✅ **Validación de datos** en base de datos
- ✅ **Integridad referencial** con restaurantes
- ✅ **Timestamps automáticos** de creación/actualización
- ✅ **Índices optimizados** (B-tree para boolean, GIN para JSONB)

## 🚀 Instalación

### Paso 1: Ejecutar Script de Creación

**Opción Recomendada (Simplificada):**
1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el script optimizado: `scripts/224-simplified-payment-settings.sql`
3. Si hay error de sintaxis CAST, ejecuta: `scripts/225-fix-cast-syntax.sql`
4. Verifica la instalación con: `scripts/221-verify-payment-settings.sql`

**Opción Alternativa (Completa):**
1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el script: `scripts/220-create-payment-settings-table.sql`
3. Si hay errores de sintaxis con índices, ejecuta: `scripts/222-fix-payment-settings-indexes.sql`
4. Si hay errores de clase de operador GIN, ejecuta: `scripts/223-fix-gin-operator-class.sql`
5. Verifica la instalación con: `scripts/221-verify-payment-settings.sql`

### Paso 2: Verificar Instalación

El script de verificación debe mostrar:

```
✅ Tabla restaurant_payment_settings creada exitosamente!
🔒 RLS habilitado con políticas de seguridad
📊 Configuraciones por defecto creadas para todos los restaurantes
🚀 Listo para usar en la aplicación
```

## 🔧 Configuración

### Configuración por Defecto

Cada restaurante obtiene automáticamente esta configuración:

```json
{
  "payments_enabled": false,
  "require_payment": false,
  "allow_cash": true,
  "allow_card": false,
  "allow_apple_pay": false,
  "allow_google_pay": false,
  "auto_capture": true,
  "gateways": {
    "stripe": {
      "id": "stripe",
      "name": "Stripe",
      "enabled": false,
      "test_mode": true,
      "public_key": "",
      "secret_key": "",
      "supported_methods": ["card", "apple_pay", "google_pay"],
      "processing_fee": 2.9,
      "setup_complete": false
    },
    "paypal": {
      "id": "paypal",
      "name": "PayPal",
      "enabled": false,
      "test_mode": true,
      "public_key": "",
      "secret_key": "",
      "supported_methods": ["card", "paypal"],
      "processing_fee": 2.9,
      "setup_complete": false
    },
    "apple_pay": {
      "id": "apple_pay",
      "name": "Apple Pay",
      "enabled": false,
      "test_mode": true,
      "public_key": "",
      "secret_key": "",
      "supported_methods": ["apple_pay"],
      "processing_fee": 0,
      "setup_complete": false
    }
  }
}
```

## 🔐 Seguridad

### Políticas RLS Implementadas

1. **SELECT**: Usuarios solo ven configuraciones de su restaurante
2. **INSERT**: Usuarios solo insertan configuraciones para su restaurante
3. **UPDATE**: Usuarios solo actualizan configuraciones de su restaurante
4. **DELETE**: Usuarios solo eliminan configuraciones de su restaurante

### Validaciones

- ✅ Estructura JSON válida
- ✅ Campos requeridos presentes
- ✅ Claves de gateway cuando están habilitados
- ✅ Métodos de pago compatibles

## 📊 Funciones de Base de Datos

### Funciones Disponibles

1. **`get_restaurant_payment_settings(restaurant_uuid)`**
   - Obtiene configuración de pago de un restaurante
   - Retorna JSONB con la configuración

2. **`save_restaurant_payment_settings(restaurant_uuid, new_settings)`**
   - Guarda/actualiza configuración de pago
   - Valida datos antes de guardar
   - Verifica permisos de usuario

3. **`restaurant_has_payments_enabled(restaurant_uuid)`**
   - Verifica si un restaurante tiene pagos habilitados
   - Retorna BOOLEAN

4. **`get_available_payment_methods(restaurant_uuid)`**
   - Obtiene métodos de pago disponibles
   - Retorna TEXT[] con métodos

5. **`validate_payment_settings(settings_json)`**
   - Valida configuración de pago
   - Retorna BOOLEAN

## 🛠️ Uso en la Aplicación

### Servicio de Pagos

```typescript
import { PaymentService } from '@/lib/payment-service'

// Obtener configuración
const settings = await PaymentService.getPaymentSettings(restaurantId)

// Guardar configuración
const success = await PaymentService.savePaymentSettings(restaurantId, settings)

// Verificar si pagos están habilitados
const hasPayments = await PaymentService.hasPaymentsEnabled(restaurantId)

// Obtener métodos disponibles
const methods = await PaymentService.getAvailablePaymentMethods(restaurantId)
```

### Página de Configuración

- **Ruta**: `/dashboard/settings/payments`
- **Acceso**: Desde sidebar en sección "General"
- **Funcionalidades**:
  - Configurar Stripe, PayPal, Apple Pay
  - Habilitar/deshabilitar métodos de pago
  - Probar conexiones
  - Validar configuraciones

## 🔍 Monitoreo y Verificación

### Scripts de Verificación

1. **`scripts/221-verify-payment-settings.sql`**
   - Verifica estructura de tabla
   - Comprueba políticas RLS
   - Valida funciones
   - Muestra estadísticas

### Consultas Útiles

```sql
-- Ver configuraciones de pago habilitadas
SELECT 
    r.name,
    rps.settings->>'payments_enabled' as payments_enabled,
    rps.settings->'gateways'->'stripe'->>'enabled' as stripe_enabled
FROM restaurants r
JOIN restaurant_payment_settings rps ON r.id = rps.restaurant_id
WHERE (rps.settings->>'payments_enabled')::BOOLEAN = true;

-- Ver métodos de pago disponibles por restaurante
SELECT 
    r.name,
    get_available_payment_methods(r.id) as available_methods
FROM restaurants r;
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error: "restaurant_payment_settings table does not exist"**
   - Solución: Ejecutar script `224-simplified-payment-settings.sql` (recomendado)

2. **Error: "syntax error at or near '->'"**
   - Solución: Ejecutar script `222-fix-payment-settings-indexes.sql`

3. **Error: "data type text has no default operator class for access method gin"**
   - Solución: Ejecutar script `223-fix-gin-operator-class.sql`

4. **Error: "syntax error at or near '::'"**
   - Solución: Ejecutar script `225-fix-cast-syntax.sql` para corregir la sintaxis del índice

5. **Error: "RLS policy violation"**
   - Solución: Verificar que el usuario esté autenticado y tenga acceso al restaurante

6. **Error: "Invalid payment settings"**
   - Solución: Verificar estructura JSON y campos requeridos

7. **Error: "Function not found"**
   - Solución: Ejecutar script de creación completo

### Verificación de Estado

```sql
-- Verificar que todo esté funcionando
SELECT 
    'Tabla existe' as check_item,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'restaurant_payment_settings'
    ) as status
UNION ALL
SELECT 
    'RLS habilitado' as check_item,
    rowsecurity as status
FROM pg_tables 
WHERE tablename = 'restaurant_payment_settings'
UNION ALL
SELECT 
    'Funciones creadas' as check_item,
    COUNT(*) > 0 as status
FROM information_schema.routines 
WHERE routine_name IN (
    'get_restaurant_payment_settings',
    'save_restaurant_payment_settings',
    'validate_payment_settings'
);
```

## 📈 Próximos Pasos

1. **Integrar con Stripe/PayPal APIs**
2. **Implementar webhooks**
3. **Añadir Google Pay**
4. **Crear dashboard de transacciones**
5. **Implementar reportes de pagos**

## 🔗 Enlaces Útiles

- [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [Apple Pay Setup Guide](https://developer.apple.com/documentation/apple_pay_on_the_web)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**✅ Sistema de configuraciones de pago implementado y listo para usar**
