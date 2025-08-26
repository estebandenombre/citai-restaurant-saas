"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Timer,
  Zap,
  CheckCircle,
  ShoppingBag,
  Truck,
  Table
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
  menu_items?: {
    name: string
    price: number
  }
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  customer_table_number?: string
  customer_pickup_time?: string
  customer_address?: string
  customer_special_instructions?: string
  order_type: 'pickup' | 'delivery' | 'table_service' | 'dine-in'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
  subtotal: number
  tax_amount: number
  delivery_fee: number
  total_amount: number
  created_at: string
  order_items: OrderItem[]
}

interface Restaurant {
  id: string
  name: string
  logo_url?: string
}

const orderTypeConfig = {
  pickup: { label: 'Pickup', icon: ShoppingBag, color: 'text-blue-600' },
  delivery: { label: 'Delivery', icon: Truck, color: 'text-green-600' },
  table_service: { label: 'Table', icon: Table, color: 'text-purple-600' },
  'dine-in': { label: 'Dine-in', icon: Table, color: 'text-purple-600' }
}

export default function ClientViewPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = use(params)
  const [orders, setOrders] = useState<Order[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurantAndOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch restaurant info
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name, logo_url')
        .eq('id', restaurantId)
        .single()

      if (restaurantError) {
        throw new Error('Restaurant not found')
      }

      setRestaurant(restaurantData)

      // Fetch orders for this restaurant
      const { data: orders, error: ordersError } = await supabase
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
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      setOrders(orders || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurantAndOrders()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRestaurantAndOrders, 30000)
    return () => clearInterval(interval)
  }, [restaurantId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const preparingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
  const readyOrders = orders.filter(o => o.status === 'ready')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/60 to-zinc-50/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/60 to-zinc-50/80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading orders</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/60 to-zinc-50/80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Restaurant not found</p>
        </div>
      </div>
    )
  }

    return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
        <p className="text-lg text-gray-600">Order Status</p>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Preparing Orders Column */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-orange-600 mb-2">Preparing</h2>
              <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
            </div>
            
                         {preparingOrders.length > 0 ? (
               <div className="space-y-2">
                 {preparingOrders.map((order) => (
                   <div key={order.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                     <div className="text-xl font-bold text-orange-600">#{order.order_number}</div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders preparing</p>
              </div>
            )}
          </div>

          {/* Ready Orders Column */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-green-600 mb-2">Ready</h2>
              <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
            </div>
            
                         {readyOrders.length > 0 ? (
               <div className="space-y-2">
                 {readyOrders.map((order) => (
                   <div key={order.id} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                     <div className="text-xl font-bold text-green-600">#{order.order_number}</div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders ready</p>
              </div>
            )}
          </div>

        </div>

        {/* No Orders Message */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No active orders</h3>
            <p className="text-gray-600">Orders will appear here when customers place them</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <p className="text-gray-600 text-sm">Auto-refreshing every 30 seconds</p>
        </div>
      </div>
    </div>
  )
} 