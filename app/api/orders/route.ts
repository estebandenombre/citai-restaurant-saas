import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting order creation...')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const {
      restaurantId,
      orderNumber,
      customerInfo,
      cartItems,
      subtotal,
      taxAmount,
      deliveryFee,
      totalAmount
    } = body

    // Validate required fields
    if (!restaurantId || !orderNumber || !customerInfo || !cartItems || cartItems.length === 0) {
      console.error('Missing required fields:', { restaurantId, orderNumber, customerInfo, cartItems })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify restaurant exists
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurantData) {
      console.error('Restaurant not found:', restaurantError)
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    console.log('Restaurant found:', restaurantData)

    // Store restaurant name for later use
    const restaurantName = restaurantData.name

    // Prepare order data with proper null handling - using actual schema
    const orderData = {
      restaurant_id: restaurantId,
      order_number: orderNumber,
      customer_name: customerInfo.name || null,
      customer_phone: customerInfo.phone || null,
      customer_email: customerInfo.email || null,
      customer_table_number: customerInfo.table_number || null,
      customer_pickup_time: customerInfo.pickup_time || null,
      customer_address: customerInfo.address || null,
      customer_special_instructions: customerInfo.special_instructions || null,
      order_type: customerInfo.order_type || 'dine-in',
      status: 'pending', // Use 'status' instead of 'order_status'
      subtotal: subtotal,
      tax_amount: taxAmount,
      delivery_fee: deliveryFee,
      total_amount: totalAmount
    }
    
    console.log('Order data to insert:', orderData)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      console.error('Error details:', {
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
        code: orderError.code
      })
      return NextResponse.json({ 
        error: 'Failed to create order',
        details: orderError.message 
      }, { status: 500 })
    }

    console.log('Order created successfully:', order)

    // Create order items - using the actual schema
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.id, // Use the menu_item_id from the cart item
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity, // Calculate total_price
      special_instructions: item.specialInstructions
    }))
    
    console.log('Order items to insert:', orderItems)

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      console.error('Items error details:', {
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint,
        code: itemsError.code
      })
      // Try to delete the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ 
        error: 'Failed to create order items',
        details: itemsError.message 
      }, { status: 500 })
    }

    // Send confirmation email if customer email is provided and order settings allow it
    let emailSent = false
    if (customerInfo.email) {
      // Check order settings for email configuration
      const { data: orderSettings, error: settingsError } = await supabase
        .from('order_settings')
        .select('require_email, send_confirmation_email')
        .eq('restaurant_id', restaurantId)
        .single()

      if (!settingsError && orderSettings) {
        const emailsEnabled = orderSettings.require_email && orderSettings.send_confirmation_email

        if (emailsEnabled) {
          try {
            // Get order items with menu item details
            const { data: orderItemsWithDetails, error: itemsError } = await supabase
              .from('order_items')
              .select(`
                quantity,
                unit_price,
                total_price,
                special_instructions,
                menu_items (
                  name
                )
              `)
              .eq('order_id', order.id)

            if (!itemsError && orderItemsWithDetails) {
              const emailData = {
                orderNumber: order.order_number,
                customerName: customerInfo.name || 'Cliente',
                customerEmail: customerInfo.email,
                restaurantName: restaurantName || 'Restaurant',
                orderType: customerInfo.order_type || 'dine-in',
                items: orderItemsWithDetails.map(item => ({
                  name: (item.menu_items as any)?.name || 'Producto',
                  quantity: item.quantity,
                  unitPrice: item.unit_price,
                  totalPrice: item.total_price,
                  specialInstructions: item.special_instructions
                })),
                subtotal: subtotal,
                taxAmount: taxAmount,
                deliveryFee: deliveryFee,
                totalAmount: totalAmount,
                specialInstructions: customerInfo.special_instructions,
                tableNumber: customerInfo.table_number,
                pickupTime: customerInfo.pickup_time,
                address: customerInfo.address
              }

              const emailResult = await emailService.sendOrderConfirmation(emailData)
              emailSent = emailResult.success
              
              if (emailResult.success) {
                console.log('✅ Order confirmation email sent successfully')
                
                // Update order to mark email as sent
                await supabase
                  .from('orders')
                  .update({ email_sent: true })
                  .eq('id', order.id)
              } else {
                console.error('❌ Failed to send order confirmation email:', emailResult.error)
              }
            }
          } catch (emailError) {
            console.error('❌ Error sending order confirmation email:', emailError)
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: order,
      emailSent: emailSent,
      message: 'Order created successfully' 
    })

  } catch (error: any) {
    console.error('Error in POST /api/orders:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      type: error.name
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/orders START ===')
    
    // Get current user's restaurant
    const { restaurant, restaurantId } = await getCurrentUserRestaurant()
    console.log('Restaurant data:', { restaurant, restaurantId })
    
    if (!restaurant || !restaurantId) {
      console.error('Restaurant not found')
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    console.log('Fetching orders for restaurant:', restaurantId)

    // Get orders for this restaurant
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name,
            price
          )
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    console.log('Orders fetched successfully:', orders?.length || 0)
    console.log('=== GET /api/orders SUCCESS ===')

    return NextResponse.json({ orders: orders || [] })

  } catch (error: any) {
    console.error('=== GET /api/orders ERROR ===')
    console.error('Error in GET /api/orders:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
} 