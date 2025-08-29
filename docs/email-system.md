# Sistema de Emails Automáticos para Pedidos

## 📧 Descripción General

El sistema de emails automáticos permite enviar confirmaciones y actualizaciones de pedidos a los clientes utilizando la API de Brevo (anteriormente Sendinblue).

## 🚀 Características

### ✅ Funcionalidades Implementadas

1. **Email de Confirmación de Pedido**
   - Se envía automáticamente cuando se crea un pedido
   - Incluye detalles completos del pedido
   - Diseño responsive y profesional
   - Formato HTML con estilos CSS inline

2. **Email de Actualización de Estado**
   - Se envía cuando se actualiza el estado del pedido
   - Estados soportados: confirmed, preparing, ready, delivered, cancelled
   - Mensajes personalizados según el estado

3. **Reenvío de Emails**
   - Botón para reenviar email de confirmación
   - Indicadores visuales del estado del email
   - Tracking del envío de emails

4. **Interfaz de Usuario**
   - Indicadores de estado de email en la lista de pedidos
   - Botones para reenviar emails
   - Badges que muestran el estado del envío

## 🔧 Configuración

### API Key de Brevo

La API key está configurada como variable de entorno en `.env.local`:

```bash
BREVO_API_KEY=tu_clave_api_de_brevo_aqui
```

**Para configurar:**

1. **Crear archivo `.env.local`** en la raíz del proyecto
2. **Agregar la variable:**
   ```bash
   BREVO_API_KEY=tu_clave_api_de_brevo
   ```
3. **Reiniciar el servidor** de desarrollo

**Nota:** El archivo `.env.local` está en `.gitignore` y no se sube al repositorio por seguridad.

### Remitente de Email

Los emails se envían desde `info@tably.digital` (dominio verificado en Brevo).

### Configuración por Restaurante

Cada restaurante puede configurar sus propias opciones de email:

- **Habilitar/Deshabilitar emails**: Control principal para activar o desactivar el sistema
- **Confirmación de pedido**: Email automático cuando se crea un pedido
- **Actualizaciones de estado**: Email cuando cambia el estado del pedido

La configuración se encuentra en **Dashboard > Configuración > Configuración de Emails**.

### Base de Datos

Se agregó el campo `email_sent` a la tabla `orders`:

```sql
ALTER TABLE orders ADD COLUMN email_sent BOOLEAN DEFAULT false;
```

## 📁 Estructura de Archivos

### Servicios
- `lib/email-service.ts` - Servicio principal de emails
- `components/ui/email-status-badge.tsx` - Componentes de UI para estado de email
- `components/restaurant/email-settings.tsx` - Componente de configuración de emails

### APIs
- `app/api/orders/route.ts` - Creación de pedidos con envío de email
- `app/api/orders/[id]/route.ts` - Actualización de estado con email
- `app/api/orders/[id]/resend-email/route.ts` - Reenvío de emails

### Base de Datos
- `scripts/242-add-email-sent-field.sql` - Script para agregar campo email_sent
- `scripts/243-add-email-settings.sql` - Script para agregar configuración de emails por restaurante

## 🎨 Plantillas de Email

### Email de Confirmación

```html
<!DOCTYPE html>
<html>
<head>
  <title>Confirmación de Pedido</title>
</head>
<body>
  <!-- Header con logo del restaurante -->
  <!-- Información del pedido -->
  <!-- Lista de productos -->
  <!-- Resumen de costos -->
  <!-- Información de contacto -->
</body>
</html>
```

### Email de Actualización de Estado

```html
<!DOCTYPE html>
<html>
<head>
  <title>Actualización de Pedido</title>
</head>
<body>
  <!-- Header con logo del restaurante -->
  <!-- Mensaje de actualización -->
  <!-- Detalles del pedido -->
  <!-- Información de contacto -->
</body>
</html>
```

## 🔄 Flujo de Trabajo

### 1. Creación de Pedido
1. Cliente realiza pedido
2. Sistema crea pedido en base de datos
3. **Verifica configuración de email del restaurante**
4. Si hay email del cliente Y emails están habilitados, se envía confirmación
5. Se marca `email_sent = true` si el envío es exitoso

### 2. Actualización de Estado
1. Restaurante actualiza estado del pedido
2. **Verifica configuración de email del restaurante**
3. Si emails están habilitados, sistema envía email de actualización
4. Cliente recibe notificación del cambio

### 3. Reenvío de Email
1. Usuario hace clic en botón de reenvío
2. Sistema reenvía email de confirmación
3. Se actualiza estado `email_sent`

## 📊 Estados de Email

### Indicadores Visuales
- ✅ **Verde**: Email enviado exitosamente
- ❌ **Rojo**: Error al enviar email
- ⏳ **Amarillo**: Envío en progreso
- 📧 **Gris**: Sin email de cliente

### Estados en Base de Datos
- `email_sent = true`: Email enviado exitosamente
- `email_sent = false`: Email no enviado o error
- `email_sent = null`: Sin email de cliente

## 🛠️ Uso

### Envío Automático
Los emails se envían automáticamente cuando:
- Se crea un nuevo pedido con email de cliente
- Se actualiza el estado de un pedido existente

### Reenvío Manual
Para reenviar un email:
1. Ir a la página de pedidos
2. Buscar el pedido deseado
3. Hacer clic en el botón de email (📧)
4. El sistema reenviará el email de confirmación

## 🔍 Monitoreo

### Logs del Sistema
- ✅ `Order confirmation email sent successfully`
- ❌ `Failed to send order confirmation email: [error]`
- ✅ `Order status update email sent successfully`

### Estadísticas
El script SQL incluye consultas para monitorear:
- Total de pedidos
- Pedidos con email
- Emails enviados exitosamente
- Emails pendientes

## 🚨 Manejo de Errores

### Errores Comunes
1. **Email inválido**: Se valida formato antes del envío
2. **API key inválida**: Error de autenticación con Brevo
3. **Red no disponible**: Timeout en envío
4. **Cuota excedida**: Límite de emails de Brevo

### Recuperación
- Los errores se registran en logs
- El sistema continúa funcionando aunque falle el email
- Se puede reenviar manualmente desde la interfaz

## 🔒 Seguridad

### Protección de Datos
- Emails se envían solo a direcciones válidas
- No se almacenan emails en logs
- API key está protegida en el servidor

### Validaciones
- Formato de email válido
- Contenido sanitizado
- Rate limiting implícito

## 📈 Mejoras Futuras

### Funcionalidades Planificadas
1. **Plantillas personalizables** por restaurante
2. **Notificaciones push** además de email
3. **SMS** para clientes sin email
4. **Tracking de apertura** de emails
5. **Automatización** de recordatorios

### Optimizaciones
1. **Cola de emails** para mejor rendimiento
2. **Retry automático** en caso de fallo
3. **Métricas detalladas** de envío
4. **A/B testing** de plantillas

## 📞 Soporte

Para problemas con el sistema de emails:
1. Verificar logs del servidor
2. Comprobar API key de Brevo
3. Validar formato de emails de clientes
4. Revisar cuota de emails en Brevo
