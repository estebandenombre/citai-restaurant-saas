import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user's restaurant
    const { restaurant } = await getCurrentUserRestaurant()
    if (!restaurant || typeof restaurant === 'object' && !('id' in restaurant)) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status: status, // Use 'status' instead of 'order_status'
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('restaurant_id', restaurant.id) // Ensure we only update our restaurant's orders
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      order: order,
      message: 'Order status updated successfully' 
    })

  } catch (error) {
    console.error('Error in PATCH /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 