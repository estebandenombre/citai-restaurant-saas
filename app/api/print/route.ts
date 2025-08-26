import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { orderId, printerType, printerConfig, testMode } = await request.json()

    // Obtener datos de la orden y configuración del restaurante
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name,
            price
          )
        ),
        restaurants (
          name,
          address,
          phone,
          printer_config
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError && !testMode) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Si es modo test, crear datos de prueba
    let orderData = order
    if (testMode) {
      orderData = {
        id: 'test',
        order_number: 'TEST001',
        customer_name: 'Test Customer',
        customer_phone: '555-1234',
        customer_email: 'test@example.com',
        order_type: 'pickup',
        status: 'confirmed',
        subtotal: 25.00,
        tax_amount: 2.50,
        delivery_fee: 0,
        total_amount: 27.50,
        created_at: new Date().toISOString(),
        order_items: [
          {
            id: 'test-item-1',
            menu_item_id: '1',
            quantity: 2,
            unit_price: 12.50,
            total_price: 25.00,
            special_instructions: 'Extra cheese',
            menu_items: {
              name: 'Test Pizza',
              price: 12.50
            }
          }
        ],
        restaurants: {
          name: 'Test Restaurant',
          address: '123 Test St',
          phone: '555-0000',
          printer_config: printerConfig
        }
      }
    }

    if (orderError) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Obtener configuración del restaurante
    const restaurantConfig = orderData.restaurants.printer_config || {}
    const effectivePrinterType = printerType || restaurantConfig.printer_type || 'thermal'

    // Verificar si la impresión está habilitada
    if (!testMode && !restaurantConfig.enabled) {
      return NextResponse.json({
        success: false,
        error: 'Printing is disabled for this restaurant'
      })
    }

    // Generar contenido del ticket según el tipo de impresora
    let printContent = ''
    
    switch (effectivePrinterType) {
      case 'thermal':
        printContent = generateThermalReceipt(orderData, restaurantConfig)
        break
      case 'pdf':
        printContent = generatePDFReceipt(orderData, restaurantConfig)
        break
      case 'escpos':
        printContent = generateESCPOSReceipt(orderData, restaurantConfig)
        break
      default:
        printContent = generateThermalReceipt(orderData, restaurantConfig)
    }

    // Enviar a la impresora usando configuración del restaurante
    const effectivePrinterConfig = {
      printerIP: printerConfig?.printerIP || restaurantConfig.printer_ip,
      printerPort: printerConfig?.printerPort || restaurantConfig.printer_port || 9100,
      printerType: effectivePrinterType,
      ...restaurantConfig
    }

    const printResult = await sendToPrinter(printContent, effectivePrinterConfig)

    return NextResponse.json({
      success: true,
      message: printResult.message,
      pdfUrl: printResult.pdfUrl,
      printerType: effectivePrinterType
    })

  } catch (error: any) {
    console.error('Print error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

function generateThermalReceipt(order: any, config: any) {
  const restaurant = order.restaurants
  const items = order.order_items
  
  let receipt = ''
  receipt += `\x1B\x40` // Initialize printer
  receipt += `\x1B\x61\x01` // Center alignment
  
  // Header
  if (config.header_text) {
    receipt += `${config.header_text}\n`
    receipt += `\n`
  }
  receipt += `${restaurant.name}\n`
  receipt += `${restaurant.address || ''}\n`
  receipt += `${restaurant.phone || ''}\n`
  receipt += `\n`
  receipt += `Order #${order.order_number}\n`
  receipt += `Date: ${new Date(order.created_at).toLocaleDateString()}\n`
  receipt += `Time: ${new Date(order.created_at).toLocaleTimeString()}\n`
  receipt += `\n`
  
  // Items
  receipt += `\x1B\x61\x00` // Left alignment
  receipt += `Items:\n`
  receipt += `\n`
  
  items.forEach((item: any) => {
    const menuItem = item.menu_items
    receipt += `${item.quantity}x ${menuItem?.name || `Item ${item.menu_item_id}`}\n`
    receipt += `  $${item.unit_price.toFixed(2)} each\n`
    if (item.special_instructions) {
      receipt += `  Note: ${item.special_instructions}\n`
    }
    receipt += `  Total: $${item.total_price.toFixed(2)}\n`
    receipt += `\n`
  })
  
  // Totals
  receipt += `\x1B\x61\x02` // Right alignment
  receipt += `Subtotal: $${order.subtotal.toFixed(2)}\n`
  if (order.tax_amount > 0) {
    receipt += `Tax: $${order.tax_amount.toFixed(2)}\n`
  }
  if (order.delivery_fee > 0) {
    receipt += `Delivery: $${order.delivery_fee.toFixed(2)}\n`
  }
  receipt += `\n`
  receipt += `TOTAL: $${order.total_amount.toFixed(2)}\n`
  receipt += `\n`
  
  // Footer
  receipt += `\x1B\x61\x01` // Center alignment
  if (config.footer_text) {
    receipt += `${config.footer_text}\n`
  } else {
    receipt += `Thank you for your order!\n`
  }
  receipt += `\n`
  receipt += `\n`
  if (config.auto_cut !== false) {
    receipt += `\x1B\x69` // Cut paper
  }
  
  return receipt
}

function generatePDFReceipt(order: any, config: any) {
  // Generar HTML del ticket en formato ticket (80mm)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${order.order_number}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body { 
          font-family: 'Courier New', monospace; 
          margin: 0; 
          padding: 10px; 
          font-size: 12px;
          line-height: 1.2;
          width: 80mm;
        }
        .header { 
          text-align: center; 
          margin-bottom: 15px; 
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .restaurant-name { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 5px;
        }
        .order-info { 
          margin-bottom: 15px; 
          text-align: center;
        }
        .order-number {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .items { 
          margin-bottom: 15px; 
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .item { 
          margin-bottom: 8px; 
          border-bottom: 1px dotted #ccc;
          padding-bottom: 5px;
        }
        .item-name {
          font-weight: bold;
        }
        .item-details {
          margin-left: 10px;
          font-size: 10px;
        }
        .special-instructions {
          color: #d97706;
          font-style: italic;
          margin-top: 2px;
        }
        .totals { 
          border-top: 1px solid #000; 
          padding-top: 10px; 
          margin-top: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .total { 
          font-weight: bold; 
          font-size: 14px;
          border-top: 2px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        .footer { 
          text-align: center; 
          margin-top: 15px; 
          border-top: 1px dashed #000;
          padding-top: 10px;
          font-size: 10px;
        }
        .customer-info {
          margin-bottom: 10px;
          font-size: 10px;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="restaurant-name">${order.restaurants.name}</div>
        <div>${order.restaurants.address || ''}</div>
        <div>${order.restaurants.phone || ''}</div>
        ${config.header_text ? `<div style="margin-top: 5px; font-size: 10px;">${config.header_text}</div>` : ''}
      </div>
      
      <div class="order-info">
        <div class="order-number">Order #${order.order_number}</div>
        <div>Date: ${new Date(order.created_at).toLocaleDateString()}</div>
        <div>Time: ${new Date(order.created_at).toLocaleTimeString()}</div>
        <div>Type: ${order.order_type}</div>
      </div>

      <div class="customer-info">
        <div>Customer: ${order.customer_name}</div>
        ${order.customer_phone ? `<div>Phone: ${order.customer_phone}</div>` : ''}
        ${order.customer_email ? `<div>Email: ${order.customer_email}</div>` : ''}
        ${order.customer_table_number ? `<div>Table: ${order.customer_table_number}</div>` : ''}
        ${order.customer_address ? `<div>Address: ${order.customer_address}</div>` : ''}
      </div>

      <div class="divider"></div>
      
      <div class="items">
        <div style="font-weight: bold; margin-bottom: 8px;">ITEMS:</div>
        ${order.order_items.map((item: any) => `
          <div class="item">
            <div class="item-name">${item.quantity}x ${item.menu_items?.name || `Item ${item.menu_item_id}`}</div>
            <div class="item-details">
              <div>$${item.unit_price.toFixed(2)} each</div>
              ${item.special_instructions ? `<div class="special-instructions">Note: ${item.special_instructions}</div>` : ''}
              <div style="font-weight: bold;">Subtotal: $${item.total_price.toFixed(2)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${order.subtotal.toFixed(2)}</span>
        </div>
        ${order.tax_amount > 0 ? `
          <div class="total-row">
            <span>Tax:</span>
            <span>$${order.tax_amount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${order.delivery_fee > 0 ? `
          <div class="total-row">
            <span>Delivery:</span>
            <span>$${order.delivery_fee.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>$${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${order.customer_special_instructions ? `
        <div class="divider"></div>
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 5px;">SPECIAL INSTRUCTIONS:</div>
          <div style="font-size: 10px; color: #d97706;">${order.customer_special_instructions}</div>
        </div>
      ` : ''}
      
      <div class="footer">
        ${config.footer_text || 'Thank you for your order!'}
        <div style="margin-top: 5px;">Generated on ${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>
  `

  // Convertir HTML a PDF usando una librería ligera
  // Por ahora, devolvemos el HTML para que se abra en nueva ventana
  return {
    html: htmlContent,
    message: 'PDF generado - abrir en nueva ventana para imprimir'
  }
}

function generateESCPOSReceipt(order: any, config: any) {
  // Implementar comandos ESC/POS específicos
  return generateThermalReceipt(order, config) // Usar thermal como fallback
}

async function sendToPrinter(content: string, config: any) {
  const { printerType, printerIP, printerPort } = config

  switch (printerType) {
    case 'thermal':
    case 'network':
      // Para impresoras de red
      if (printerIP) {
        try {
          const response = await fetch(`http://${printerIP}:${printerPort || 9100}`, {
            method: 'POST',
            body: content,
            headers: { 'Content-Type': 'application/octet-stream' }
          })
          
          if (response.ok) {
            return { success: true, message: 'Sent to network printer' }
          } else {
            return { success: false, message: 'Network printer error' }
          }
        } catch (error) {
          return { success: false, message: 'Cannot connect to network printer' }
        }
      } else {
        return { success: false, message: 'No printer IP configured' }
      }
      
    case 'pdf':
      // Para impresión local
      return {
        success: true,
        message: 'PDF generated for local printing',
        pdfUrl: content.html || content
      }
      
    default:
      return { success: false, message: 'Unsupported printer type' }
  }
} 