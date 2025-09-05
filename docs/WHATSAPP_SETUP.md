# 📱 Configuración de WhatsApp Business con Bot de IA

## 📋 Descripción

Esta funcionalidad permite a los restaurantes integrar WhatsApp Business con un bot de IA que utiliza DeepSeek para atender automáticamente a los clientes, recibir pedidos y proporcionar información del restaurante.

## 🚀 Características Principales

### **Bot de IA Inteligente**
- ✅ **Procesamiento de lenguaje natural** con DeepSeek
- ✅ **Comprensión de pedidos** automática
- ✅ **Respuestas contextuales** basadas en el menú
- ✅ **Gestión de conversaciones** inteligente
- ✅ **Confirmación automática** de pedidos

### **Gestión de Conversaciones**
- ✅ **Interfaz de chat** en tiempo real
- ✅ **Historial de mensajes** completo
- ✅ **Búsqueda de conversaciones** por cliente
- ✅ **Estadísticas detalladas** de uso
- ✅ **Notificaciones** de nuevos mensajes

### **Configuración Flexible**
- ✅ **Horarios personalizables** de atención
- ✅ **Mensajes de bienvenida** personalizados
- ✅ **Configuración de pedidos** específica
- ✅ **Integración con menú** existente
- ✅ **Webhook configurable** para WhatsApp

## 🛠️ Instalación y Configuración

### **Paso 1: Configurar Base de Datos**

Ejecuta el script SQL para crear las tablas necesarias:

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: scripts/250-add-whatsapp-config.sql
```

### **Paso 2: Configurar Variables de Entorno**

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# AI Service (DeepSeek)
DEEPSEEK_API_KEY=tu_api_key_de_deepseek

# Application Configuration
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### **Paso 3: Configurar WhatsApp Business**

1. **Crear cuenta de WhatsApp Business**
   - Descarga WhatsApp Business desde la App Store/Google Play
   - Verifica tu número de teléfono
   - Completa el perfil de tu negocio

2. **Configurar WhatsApp Business API**
   - Ve a [Meta for Developers](https://developers.facebook.com/)
   - Crea una nueva aplicación
   - Configura WhatsApp Business API
   - Obtén el token de acceso

3. **Configurar Webhook**
   - En el dashboard de tu restaurante, ve a **WhatsApp > Configuración**
   - Copia la URL del webhook que aparece
   - Configura esta URL en tu aplicación de Meta
   - Establece el token de verificación

### **Paso 4: Configurar el Bot**

1. **Acceder a la configuración**
   - Ve a **Dashboard > WhatsApp > Configuración**
   - Habilita WhatsApp Business
   - Configura tu número de teléfono

2. **Personalizar mensajes**
   - Edita el mensaje de bienvenida
   - Configura los horarios de atención
   - Personaliza la configuración de pedidos

3. **Configurar IA**
   - Habilita el bot de IA con DeepSeek
   - Configura la confirmación automática
   - Personaliza las respuestas

## 📱 Uso del Sistema

### **Para Restaurantes**

#### **Dashboard de WhatsApp**
- **Conversaciones**: Ver y gestionar todas las conversaciones activas
- **Configuración**: Personalizar el comportamiento del bot
- **Estadísticas**: Monitorear el rendimiento del sistema

#### **Gestión de Conversaciones**
- Ver mensajes en tiempo real
- Responder manualmente cuando sea necesario
- Ver historial completo de conversaciones
- Buscar conversaciones por cliente

#### **Configuración del Bot**
- Personalizar mensajes de bienvenida
- Configurar horarios de atención
- Establecer reglas de pedidos
- Configurar respuestas automáticas

### **Para Clientes**

#### **Iniciar Conversación**
1. El cliente envía un mensaje al número de WhatsApp del restaurante
2. El bot responde automáticamente con el mensaje de bienvenida
3. El cliente puede hacer preguntas sobre el menú, horarios, etc.

#### **Hacer un Pedido**
1. El cliente indica que quiere hacer un pedido
2. El bot guía al cliente paso a paso
3. Solicita información necesaria (nombre, dirección, etc.)
4. Confirma el pedido y lo envía al restaurante

#### **Consultas Generales**
- Preguntas sobre el menú
- Consultas sobre horarios
- Información sobre precios
- Preguntas sobre alérgenos

## 🤖 Funcionalidades del Bot de IA

### **Comprensión de Pedidos**
El bot puede entender pedidos expresados en lenguaje natural:

```
Cliente: "Quiero una pizza margherita y una coca cola"
Bot: "Perfecto, he anotado tu pedido:
- 1x Pizza Margherita ($14.00)
- 1x Coca Cola ($2.50)
Total: $16.50

¿Te gustaría recoger en el local o prefieres entrega a domicilio?"
```

### **Gestión de Menú**
- Muestra productos disponibles
- Informa sobre precios
- Proporciona descripciones
- Maneja alérgenos y restricciones dietéticas

### **Confirmación de Pedidos**
- Confirma detalles del pedido
- Calcula totales automáticamente
- Solicita información faltante
- Procesa el pedido en el sistema

### **Respuestas Contextuales**
- Responde preguntas sobre horarios
- Proporciona información del restaurante
- Maneja consultas sobre alérgenos
- Ofrece alternativas cuando un producto no está disponible

## 📊 Estadísticas y Análisis

### **Métricas Disponibles**
- **Conversaciones totales**: Número de conversaciones iniciadas
- **Conversaciones activas**: Conversaciones en curso
- **Mensajes hoy**: Mensajes recibidos hoy
- **Respuestas de IA**: Respuestas automáticas enviadas
- **Órdenes recibidas**: Pedidos procesados por WhatsApp
- **Tiempo de respuesta**: Tiempo promedio de respuesta
- **Satisfacción del cliente**: Calificación promedio

### **Reportes**
- Análisis de conversaciones por período
- Productos más solicitados
- Horarios de mayor actividad
- Rendimiento del bot de IA

## 🔧 Configuración Avanzada

### **Personalización de Respuestas**
Puedes personalizar las respuestas del bot editando la configuración:

```json
{
  "welcome_message": "¡Hola! Bienvenido a [Nombre del Restaurante]",
  "ai_enabled": true,
  "auto_confirm_orders": false,
  "business_hours": {
    "monday": {"open": "09:00", "close": "22:00", "closed": false}
  }
}
```

### **Integración con Menú**
El bot accede automáticamente al menú configurado en el sistema:
- Productos disponibles
- Precios actualizados
- Categorías organizadas
- Información nutricional

### **Gestión de Horarios**
- Configura horarios por día de la semana
- Mensajes automáticos fuera de horario
- Respuestas personalizadas según disponibilidad

## 🚨 Solución de Problemas

### **Problemas Comunes**

#### **Bot no responde**
1. Verifica que WhatsApp esté habilitado en la configuración
2. Confirma que la IA esté activada
3. Revisa los logs del webhook
4. Verifica la conexión con DeepSeek

#### **Mensajes no llegan**
1. Verifica la configuración del webhook
2. Confirma que la URL sea accesible
3. Revisa los logs de error
4. Verifica la configuración de Meta

#### **Pedidos no se procesan**
1. Verifica la configuración de pedidos
2. Confirma que el menú esté configurado
3. Revisa los logs de procesamiento
4. Verifica la integración con el sistema de órdenes

### **Logs y Debugging**
- Los logs se guardan en la base de datos
- Revisa la tabla `whatsapp_messages` para ver mensajes
- Verifica la tabla `whatsapp_conversations` para conversaciones
- Revisa la configuración en `restaurants.whatsapp_config`

## 📞 Soporte

Para soporte técnico o preguntas sobre la configuración:

- **Email**: info@tably.digital
- **Documentación**: Consulta esta guía
- **Logs**: Revisa los logs en el dashboard

## 🔄 Actualizaciones

### **Versión Actual**: 1.0.0
- Integración básica con WhatsApp Business
- Bot de IA con DeepSeek
- Gestión de conversaciones
- Estadísticas básicas

### **Próximas Funcionalidades**
- Integración con pagos
- Notificaciones push
- Análisis avanzado
- Integración con delivery
- Multiidioma

---

**Nota**: Esta funcionalidad requiere una cuenta de WhatsApp Business verificada y una API key válida de DeepSeek para funcionar correctamente.
