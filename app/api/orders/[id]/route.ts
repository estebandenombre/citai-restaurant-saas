import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Get current order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (
          name
        )
      `)
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update order status',
        details: updateError.message 
      }, { status: 500 })
    }

    // Send status update email if customer email is provided and restaurant has emails enabled
    let emailSent = false
    if (order.customer_email && order.customer_name) {
      // Check restaurant email settings
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('email_settings')
        .eq('id', order.restaurant_id)
        .single()

      if (!restaurantError && restaurantData?.email_settings) {
        const emailSettings = restaurantData.email_settings
        const emailsEnabled = emailSettings.enabled && emailSettings.send_status_updates

        if (emailsEnabled) {
          try {
            const emailResult = await emailService.sendOrderStatusUpdate(
              order.customer_email,
              order.customer_name,
              order.order_number,
              order.restaurants?.name || 'Restaurante',
              status
            )
            
            emailSent = emailResult.success
            
            if (emailResult.success) {
              console.log('✅ Order status update email sent successfully')
            } else {
              console.error('❌ Failed to send order status update email:', emailResult.error)
            }
          } catch (emailError) {
            console.error('❌ Error sending order status update email:', emailError)
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      emailSent: emailSent,
      message: 'Order status updated successfully' 
    })

  } catch (error: any) {
    console.error('Error in PATCH /api/orders/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name,
            description,
            price
          )
        ),
        restaurants (
          name,
          phone,
          email,
          address
        )
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })

  } catch (error: any) {
    console.error('Error in GET /api/orders/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
} 