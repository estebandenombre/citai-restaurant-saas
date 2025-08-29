import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
// @ts-ignore: emailService module might not have type declarations
import emailService from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get order with all details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          total_price,
          special_instructions,
          menu_items (
            name
          )
        ),
        restaurants (
          name
        )
      `)
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.customer_email) {
      return NextResponse.json({ 
        error: 'No customer email available for this order' 
      }, { status: 400 })
    }

    // Prepare email data
    const emailData = {
      orderNumber: order.order_number,
      customerName: order.customer_name || 'Cliente',
      customerEmail: order.customer_email,
      restaurantName: order.restaurants?.name || 'Restaurante',
      orderType: order.order_type || 'dine-in',
      items: order.order_items?.map((item: any) => ({
        name: item.menu_items?.name || 'Producto',
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        specialInstructions: item.special_instructions
      })) || [],
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      deliveryFee: order.delivery_fee,
      totalAmount: order.total_amount,
      specialInstructions: order.customer_special_instructions,
      tableNumber: order.customer_table_number,
      pickupTime: order.customer_pickup_time,
      address: order.customer_address
    }

    // Send email
    const emailResult = await emailService.sendOrderConfirmation(emailData)

    if (emailResult.success) {
      console.log('✅ Order confirmation email resent successfully')
      
      // Update order to mark email as sent
      await supabase
        .from('orders')
        .update({ email_sent: true })
        .eq('id', id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: emailResult.messageId
      })
    } else {
      console.error('❌ Failed to resend order confirmation email:', emailResult.error)
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: emailResult.error
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error in POST /api/orders/[id]/resend-email:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
