import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing orders table structure...')
    
    // Get a test restaurant (first active restaurant)
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (restaurantError || !restaurants) {
      console.error('No restaurants found:', restaurantError)
      return NextResponse.json({ error: 'No restaurants found' }, { status: 404 })
    }

    console.log('Using test restaurant:', restaurants)

    // Test 1: Check if we can query the table
    console.log('Test 1: Checking if we can query the orders table...')
    const { data: testQuery, error: queryError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json({ 
        error: 'Cannot query orders table',
        details: queryError.message 
      }, { status: 500 })
    }

    console.log('✅ Can query orders table')

    // Test 2: Check if we can insert a test order
    console.log('Test 2: Checking if we can insert a test order...')
    const testOrder = {
      restaurant_id: restaurants.id,
      order_number: 'TEST-' + Date.now(),
      customer_name: 'Test Customer',
      customer_phone: '123-456-7890',
      customer_email: 'test@example.com',
      customer_table_number: '1',
      customer_pickup_time: '12:00:00',
      customer_address: 'Test Address',
      customer_special_instructions: 'Test instructions',
      order_type: 'pickup',
      order_status: 'pending',
      subtotal: 10.00,
      tax_amount: 1.00,
      delivery_fee: 0.00,
      total_amount: 11.00
    }

    const { data: testOrderData, error: insertError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ 
        error: 'Cannot insert into orders table',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log('✅ Can insert into orders table')

    // Test 3: Check if we can insert order items
    console.log('Test 3: Checking if we can insert order items...')
    const testOrderItems = [{
      order_id: testOrderData.id,
      dish_name: 'Test Dish',
      dish_price: 10.00,
      quantity: 1,
      special_instructions: 'Test instructions'
    }]

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(testOrderItems)

    if (itemsError) {
      console.error('Order items insert error:', itemsError)
      // Clean up test order
      await supabase.from('orders').delete().eq('id', testOrderData.id)
      return NextResponse.json({ 
        error: 'Cannot insert into order_items table',
        details: itemsError.message 
      }, { status: 500 })
    }

    console.log('✅ Can insert into order_items table')

    // Clean up test data
    await supabase.from('order_items').delete().eq('order_id', testOrderData.id)
    await supabase.from('orders').delete().eq('id', testOrderData.id)

    return NextResponse.json({ 
      success: true,
      message: 'Orders table structure is correct and working properly'
    })

  } catch (error: any) {
    console.error('Error in test orders API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
} 