# 🖨️ Guía de Impresión PDF - Formato Ticket

## 📋 Nueva Funcionalidad

**¿Qué hace?** Genera un PDF en formato ticket (80mm) cuando se pulsa el botón "Print Receipt" de una comanda.

## 🎯 Características del PDF Generado

### **Formato Ticket (80mm)**
- ✅ **Ancho:** 80mm (estándar de impresoras térmicas)
- ✅ **Fuente:** Courier New (monospace)
- ✅ **Tamaño:** 12px para mejor legibilidad
- ✅ **Diseño:** Optimizado para impresoras de tickets

### **Contenido del Ticket**
```
┌─────────────────────────────────────┐
│         RESTAURANT NAME             │
│        123 Main Street              │
│        Phone: (555) 123-4567       │
│                                     │
│        Order #12345                 │
│        Date: 1/30/2024             │
│        Time: 2:30:45 PM            │
│        Type: pickup                 │
│                                     │
│        Customer: John Doe           │
│        Phone: (555) 987-6543       │
│                                     │
│        ───────────────────────────── │
│        ITEMS:                       │
│        2x Margherita Pizza         │
│          $12.50 each               │
│          Note: Extra cheese        │
│          Subtotal: $25.00          │
│                                     │
│        1x Coca Cola                │
│          $3.00 each                │
│          Subtotal: $3.00           │
│                                     │
│        ───────────────────────────── │
│        Subtotal:    $28.00         │
│        Tax:         $2.80          │
│        TOTAL:       $30.80         │
│                                     │
│        Thank you for your order!    │
│        Generated on 1/30/2024      │
└─────────────────────────────────────┘
```

## 🚀 Cómo Usar

### **1. Configurar Impresión PDF**
1. Ve a **Settings** → **Printer**
2. Selecciona **"PDF (Local Print)"**
3. Configura las opciones:
   - **Paper Width:** 80mm
   - **Header Text:** (opcional)
   - **Footer Text:** (opcional)
4. Guarda la configuración

### **2. Imprimir una Comanda**
1. Ve a **Orders**
2. Encuentra la comanda que quieres imprimir
3. Click en **"Print Receipt"**
4. Se abre una nueva ventana con el ticket
5. Click en **"🖨️ Print Receipt"** o presiona **Ctrl+P**
6. Selecciona tu impresora USB
7. Imprime

### **3. Test de Impresión**
1. En **Settings** → **Printer**
2. Click en **"Send Test Receipt"**
3. Se abre una ventana con un ticket de prueba
4. Sigue los mismos pasos para imprimir

## 🎨 Diseño del Ticket

### **Header (Encabezado)**
- Nombre del restaurante (grande y centrado)
- Dirección y teléfono
- Texto personalizado (si está configurado)

### **Información de la Orden**
- Número de orden
- Fecha y hora
- Tipo de orden (pickup, delivery, etc.)

### **Información del Cliente**
- Nombre del cliente
- Teléfono (si está disponible)
- Email (si está disponible)
- Mesa (si es dine-in)
- Dirección (si es delivery)

### **Items (Artículos)**
- Cantidad y nombre del producto
- Precio unitario
- Notas especiales (en naranja)
- Subtotal por item

### **Totales**
- Subtotal
- Tax (si aplica)
- Delivery fee (si aplica)
- **TOTAL** (destacado)

### **Instrucciones Especiales**
- Sección separada para instrucciones especiales
- Texto en color naranja para destacar

### **Footer (Pie)**
- Mensaje personalizado
- Fecha y hora de generación

## 🔧 Configuración Avanzada

### **Personalización del Ticket**
```javascript
// En Settings → Printer
{
  "enabled": true,
  "printer_type": "pdf",
  "paper_width": 80,
  "header_text": "¡Bienvenidos a nuestro restaurante!",
  "footer_text": "¡Gracias por su pedido!",
  "print_logo": true,
  "auto_cut": true
}
```

### **Estilos CSS Personalizados**
El ticket usa CSS optimizado para impresión:
```css
@page {
  size: 80mm auto;
  margin: 0;
}
body { 
  font-family: 'Courier New', monospace; 
  width: 80mm;
  font-size: 12px;
}
```

## 📱 Ventana de Impresión

### **Características de la Ventana**
- ✅ **Tamaño:** 400x600px
- ✅ **Botón de impresión:** Fijo en la esquina superior derecha
- ✅ **Instrucciones:** Guía paso a paso
- ✅ **Diseño responsivo:** Se adapta al contenido

### **Instrucciones en la Ventana**
```
Printing Instructions:
1. Click "Print Receipt" button or press Ctrl+P
2. Select your USB printer
3. Choose "80mm" paper size if available
4. Print the receipt
```

## 🖨️ Compatibilidad con Impresoras

### **Impresoras USB Térmicas**
- ✅ **Perfecta compatibilidad**
- ✅ **Formato 80mm nativo**
- ✅ **Fuente monospace optimizada**

### **Impresoras de Escritorio**
- ✅ **Funciona con cualquier impresora**
- ✅ **Ajustar tamaño de papel a 80mm**
- ✅ **Orientación vertical**

### **Impresoras de Red**
- ✅ **Configurar como "Network Printer"**
- ✅ **Enviar directamente por IP**

## 🚨 Troubleshooting

### **Problema: No se abre la ventana**
**Solución:**
- Verificar bloqueador de ventanas emergentes
- Permitir ventanas emergentes para tu sitio
- Usar Ctrl+Click para forzar nueva ventana

### **Problema: El ticket no se ve bien**
**Solución:**
- Verificar que el ancho esté configurado en 80mm
- Comprobar orientación vertical
- Ajustar márgenes en configuración de impresora

### **Problema: Texto muy pequeño/grande**
**Solución:**
- El ticket usa fuente de 12px por defecto
- Ajustar zoom del navegador si es necesario
- Verificar configuración de impresora

### **Problema: No se imprimen las instrucciones especiales**
**Solución:**
- Verificar que el campo `customer_special_instructions` tenga contenido
- Comprobar que la orden tenga datos completos

## 📊 Comparación con Otros Formatos

| Aspecto | PDF Ticket | HTML Simple | Thermal Commands |
|---------|------------|-------------|------------------|
| **Formato** | 80mm nativo | Variable | 80mm nativo |
| **Fuente** | Courier New | Variable | Monospace |
| **Diseño** | Optimizado | Básico | Optimizado |
| **Compatibilidad** | Universal | Universal | Específica |
| **Personalización** | Alta | Media | Baja |

## 🎯 Ventajas del Nuevo Sistema

### **Para Restaurantes:**
- ✅ **Formato profesional** de ticket
- ✅ **Fácil de leer** para el personal
- ✅ **Compatible** con cualquier impresora
- ✅ **Personalizable** con logo y textos

### **Para Desarrolladores:**
- ✅ **Código limpio** y mantenible
- ✅ **CSS optimizado** para impresión
- ✅ **Fácil de extender** con nuevas características
- ✅ **Responsive** y accesible

## 🔄 Próximas Mejoras

### **Funcionalidades Planificadas:**
- 🚧 **Logo del restaurante** en el ticket
- 🚧 **Códigos QR** para pagos digitales
- 🚧 **Múltiples idiomas** en el ticket
- 🚧 **Templates personalizables** por restaurante

### **Optimizaciones Técnicas:**
- 🚧 **Generación de PDF real** (no HTML)
- 🚧 **Compresión** para archivos más pequeños
- 🚧 **Cache** para tickets frecuentes
- 🚧 **Preview** antes de imprimir

¡El sistema de impresión PDF está listo y funcionando perfectamente! 