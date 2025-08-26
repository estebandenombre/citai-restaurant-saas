import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    // Get restaurant basic info
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, address, phone')
      .eq('id', restaurantId)
      .single()

    if (restaurantError) {
      console.error('Restaurant error:', restaurantError)
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Get orders statistics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, customer_name')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Orders error:', ordersError)
      return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 })
    }

    // Ensure orders is an array
    const ordersArray = orders || []

    // Get popular items only if there are orders
    let popularItems: Array<{ name: string; quantity: number }> = []
    
    if (ordersArray.length > 0) {
      const orderIds = ordersArray.map(o => o.id).filter(Boolean)
      
      if (orderIds.length > 0) {
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            quantity,
            menu_items (
              name
            )
          `)
          .in('order_id', orderIds)

        if (itemsError) {
          console.error('Items error:', itemsError)
          // Don't fail the entire request if items fail
        } else {
          // Calculate popular items
          const itemCounts: { [key: string]: number } = {}
          orderItems?.forEach((item: any) => {
            const itemName = item.menu_items?.name || 'Unknown Item'
            itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 0)
          })

          popularItems = Object.entries(itemCounts)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)
        }
      }
    }

    // Calculate statistics
    const totalOrders = ordersArray.length
    const totalRevenue = ordersArray.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const pendingOrders = ordersArray.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length
    const completedOrders = ordersArray.filter(o => ['ready', 'served'].includes(o.status)).length
    
    // Get unique customers
    const uniqueCustomers = new Set(ordersArray.map(o => o.customer_name).filter(Boolean))
    const totalCustomers = uniqueCustomers.size

    // Get recent orders
    const recentOrders = ordersArray.slice(0, 10).map(order => ({
      id: order.id,
      number: order.order_number,
      amount: order.total_amount,
      status: order.status
    }))

    const context = {
      id: restaurant.id,
      name: restaurant.name,
      stats: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        pendingOrders,
        completedOrders,
        totalCustomers,
        popularItems,
        recentOrders
      }
    }

    return NextResponse.json({
      success: true,
      data: context
    })

  } catch (error: any) {
    console.error('Error fetching restaurant context:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 