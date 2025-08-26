import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG ORDERS API START ===')
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
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
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'One or more required fields are missing'
      }, { status: 400 })
    }

    console.log('✅ All required fields present')

    // Verify restaurant exists
    console.log('Checking if restaurant exists:', restaurantId)
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single()

    if (restaurantError) {
      console.error('Restaurant query error:', restaurantError)
      return NextResponse.json({ 
        error: 'Restaurant not found',
        details: restaurantError.message 
      }, { status: 404 })
    }

    if (!restaurant) {
      console.error('Restaurant not found')
      return NextResponse.json({ 
        error: 'Restaurant not found',
        details: 'Restaurant with provided ID does not exist'
      }, { status: 404 })
    }

    console.log('✅ Restaurant found:', restaurant)

    // Test table access
    console.log('Testing orders table access...')
    const { data: testQuery, error: testError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('Orders table access error:', testError)
      return NextResponse.json({ 
        error: 'Cannot access orders table',
        details: testError.message 
      }, { status: 500 })
    }

    console.log('✅ Orders table accessible')

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
    
    console.log('Order data to insert:', JSON.stringify(orderData, null, 2))

    // Create order
    console.log('Attempting to insert order...')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Order insert error:', orderError)
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

    console.log('✅ Order created successfully:', order)

    // Create order items - using the actual schema
    console.log('Creating order items...')
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.id, // Use the menu_item_id from the cart item
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity, // Calculate total_price
      special_instructions: item.specialInstructions || null
    }))
    
    console.log('Order items to insert:', JSON.stringify(orderItems, null, 2))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items insert error:', itemsError)
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

    console.log('✅ Order items created successfully')

    console.log('=== DEBUG ORDERS API SUCCESS ===')

    return NextResponse.json({ 
      success: true, 
      order: order,
      message: 'Order created successfully' 
    })

  } catch (error: any) {
    console.error('=== DEBUG ORDERS API ERROR ===')
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
} 