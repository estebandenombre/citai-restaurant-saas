# 🤖 Asistente IA del Restaurante

## 📋 Descripción

El **Asistente IA** es una funcionalidad inteligente que proporciona información contextual específica de tu restaurante. Tiene acceso completo a los datos de tu negocio y puede responder preguntas sobre órdenes, ventas, clientes y más.

## 🎯 Características Principales

### **Contexto Específico del Restaurante**
- ✅ **Datos en tiempo real** de tu restaurante específico
- ✅ **Estadísticas actualizadas** automáticamente
- ✅ **Información personalizada** según tu ID de restaurante
- ✅ **Análisis inteligente** de tendencias y patrones

### **Funcionalidades del Chat**
- ✅ **Interfaz conversacional** intuitiva
- ✅ **Preguntas sugeridas** para facilitar el uso
- ✅ **Respuestas contextuales** basadas en datos reales
- ✅ **Resumen rápido** de estadísticas importantes

## 🚀 Cómo Usar

### **1. Acceder al Asistente**
- El botón del asistente IA aparece en la esquina inferior derecha
- Click en **"Asistente IA"** para abrir el chat
- Se carga automáticamente el contexto de tu restaurante

### **2. Hacer Preguntas**
Puedes preguntar sobre:

#### **Órdenes y Estado**
```
"¿Cuántas órdenes tenemos pendientes?"
"¿Cuál es el estado de las órdenes de hoy?"
"¿Cuántas órdenes completamos esta semana?"
```

#### **Ventas y Revenue**
```
"¿Cuánto hemos vendido hoy?"
"¿Cuál es nuestro revenue total?"
"¿Cuál es el valor promedio por orden?"
```

#### **Productos y Menú**
```
"¿Cuál es nuestro producto más vendido?"
"¿Qué productos son populares?"
"¿Necesitamos reabastecer algún producto?"
```

#### **Clientes y Análisis**
```
"¿Cuántos clientes únicos tenemos?"
"¿Cuáles son las tendencias de ventas?"
"¿Cómo está nuestro rendimiento?"
```

### **3. Preguntas Sugeridas**
El asistente muestra preguntas comunes:
- ¿Cuántas órdenes tenemos pendientes?
- ¿Cuál es nuestro producto más vendido?
- ¿Cuánto hemos vendido hoy?
- ¿Cuáles son las tendencias de ventas?
- ¿Necesitamos reabastecer algún producto?

## 📊 Información Disponible

### **Estadísticas en Tiempo Real**
- **Órdenes totales:** Número total de órdenes
- **Revenue total:** Ingresos totales generados
- **Valor promedio:** Promedio por orden
- **Órdenes pendientes:** Órdenes en proceso
- **Órdenes completadas:** Órdenes finalizadas
- **Clientes únicos:** Número de clientes diferentes

### **Análisis de Productos**
- **Productos más vendidos:** Top 5 productos
- **Cantidades vendidas:** Por cada producto
- **Tendencias:** Productos en crecimiento

### **Órdenes Recientes**
- **Últimas 10 órdenes:** Con detalles completos
- **Estados:** Pending, confirmed, preparing, ready, served
- **Montos:** Valores de cada orden

## 🧠 Inteligencia del Asistente

### **Análisis Contextual**
El asistente puede:

#### **Analizar Tendencias**
```
"Tus clientes están gastando bastante por orden, lo cual es excelente para tu rentabilidad."
"Tienes un buen valor promedio por orden. Considera estrategias para aumentar el ticket promedio."
"El valor promedio por orden es bajo. Considera ofrecer combos o productos premium."
```

#### **Hacer Recomendaciones**
```
"Basándome en las ventas, te recomiendo revisar el inventario de estos productos populares..."
"Revisa tu inventario para asegurar que no se agoten."
"Considera estrategias para aumentar el ticket promedio."
```

#### **Proporcionar Insights**
```
"Hoy has tenido X órdenes con un total de $Y en ventas. ¡Sigue así!"
"Tu producto más vendido es 'X' con Y unidades vendidas."
"Tienes X clientes únicos registrados en tu restaurante."
```

## 🎨 Interfaz del Usuario

### **Diseño del Chat**
- **Ventana flotante:** Posicionada en esquina inferior derecha
- **Diseño moderno:** Gradientes y efectos visuales
- **Responsive:** Se adapta a diferentes tamaños de pantalla
- **Animaciones:** Transiciones suaves y feedback visual

### **Elementos de la Interfaz**
- **Header:** Nombre del restaurante y botón de cerrar
- **Mensajes:** Burbujas de chat con timestamps
- **Indicador de carga:** "Pensando..." mientras procesa
- **Input:** Campo de texto con botón de enviar
- **Preguntas sugeridas:** Botones para preguntas comunes
- **Resumen rápido:** Estadísticas clave al inicio

### **Estados del Chat**
- **Cerrado:** Botón flotante visible
- **Abierto:** Ventana de chat completa
- **Cargando:** Indicador de procesamiento
- **Error:** Mensajes de error amigables

## 🔧 Configuración Técnica

### **API Routes**
- **`/api/ai/context`:** Obtiene contexto del restaurante
- **`/api/ai/chat`:** Procesa mensajes y genera respuestas

### **Componentes**
- **`AIAssistant`:** Componente principal del chat
- **`Sidebar`:** Navegación del dashboard
- **`DashboardLayout`:** Layout principal con asistente

### **Datos del Contexto**
```typescript
interface RestaurantContext {
  id: string
  name: string
  stats: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
    completedOrders: number
    totalCustomers: number
    popularItems: Array<{ name: string; quantity: number }>
    recentOrders: Array<{ id: string; number: string; amount: number; status: string }>
  }
}
```

## 🚨 Troubleshooting

### **Problema: No se carga el contexto**
**Solución:**
- Verificar que el usuario esté autenticado
- Comprobar que el restaurante ID sea válido
- Revisar la conexión a la base de datos

### **Problema: No responde el asistente**
**Solución:**
- Verificar que las API routes estén funcionando
- Comprobar la conexión a internet
- Revisar los logs del servidor

### **Problema: Datos desactualizados**
**Solución:**
- Los datos se actualizan automáticamente
- Refrescar la página si es necesario
- Verificar que haya nuevas órdenes en la base de datos

## 📈 Casos de Uso

### **Para Dueños de Restaurantes**
- **Monitoreo rápido:** "¿Cuántas órdenes tenemos pendientes?"
- **Análisis de ventas:** "¿Cuánto hemos vendido hoy?"
- **Gestión de inventario:** "¿Necesitamos reabastecer algún producto?"

### **Para Managers**
- **Supervisión:** "¿Cuál es el estado de las órdenes?"
- **Análisis de rendimiento:** "¿Cuáles son las tendencias?"
- **Toma de decisiones:** "¿Qué productos son más populares?"

### **Para Staff**
- **Información rápida:** "¿Cuántos clientes tenemos?"
- **Estado del negocio:** "¿Cómo va el día?"

## 🔄 Próximas Mejoras

### **Funcionalidades Planificadas**
- 🚧 **Predicciones:** Análisis predictivo de ventas
- 🚧 **Alertas inteligentes:** Notificaciones automáticas
- 🚧 **Recomendaciones personalizadas:** Sugerencias específicas
- 🚧 **Integración con inventario:** Alertas de stock bajo

### **Mejoras Técnicas**
- 🚧 **IA más avanzada:** Integración con GPT o similar
- 🚧 **Análisis temporal:** Tendencias por hora/día/semana
- 🚧 **Reportes automáticos:** Generación de informes
- 🚧 **Notificaciones push:** Alertas en tiempo real

## 🎯 Beneficios

### **Para el Negocio**
- ✅ **Información instantánea** sobre el estado del restaurante
- ✅ **Toma de decisiones** basada en datos reales
- ✅ **Eficiencia operativa** mejorada
- ✅ **Monitoreo continuo** del rendimiento

### **Para el Usuario**
- ✅ **Interfaz intuitiva** y fácil de usar
- ✅ **Respuestas rápidas** a preguntas comunes
- ✅ **Contexto específico** de su restaurante
- ✅ **Insights valiosos** para el negocio

¡El Asistente IA está listo para ayudarte a gestionar tu restaurante de manera más inteligente! 