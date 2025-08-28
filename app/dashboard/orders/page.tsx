"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Truck,
  Table,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Printer,
  MessageSquare,
  Calendar,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Timer,
  Star,
  Bell,
  Zap,
  Check,
  ArrowRight,
  Plus,
  Minus,
  List,
  ChefHat,
  Users,
  BarChart3,
  Grid3X3,
  MapPin as MapPinIcon,
  X,
  Utensils,
  Edit,
  Trash2,
  Grid,
  Rows,
  Monitor
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { Loading } from "@/components/ui/loading"
import { Skeleton } from "@/components/ui/skeleton"
import { FormattedPrice } from "@/components/ui/formatted-price"

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

const statusConfig = {
  pending: { 
    label: 'NEW', 
    color: 'bg-red-100 text-red-800 border-red-300', 
    icon: Bell,
    bgColor: 'bg-gradient-to-r from-red-50 to-red-100',
    textColor: 'text-red-700',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    buttonText: 'text-white',
    priority: 1
  },
  confirmed: { 
    label: 'CONFIRMED', 
    color: 'bg-blue-100 text-blue-800 border-blue-300', 
    icon: CheckCircle,
    bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100',
    textColor: 'text-blue-700',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    buttonText: 'text-white',
    priority: 2
  },
  preparing: { 
    label: 'PREPARING', 
    color: 'bg-orange-100 text-orange-800 border-orange-300', 
    icon: Timer,
    bgColor: 'bg-gradient-to-r from-orange-50 to-orange-100',
    textColor: 'text-orange-700',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
    buttonText: 'text-white',
    priority: 3
  },
  ready: { 
    label: 'READY', 
    color: 'bg-green-100 text-green-800 border-green-300', 
    icon: Zap,
    bgColor: 'bg-gradient-to-r from-green-50 to-green-100',
    textColor: 'text-green-700',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    buttonText: 'text-white',
    priority: 4
  },
  served: { 
    label: 'COMPLETED', 
    color: 'bg-gray-100 text-gray-800 border-gray-300', 
    icon: Check,
    bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
    textColor: 'text-gray-700',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    buttonText: 'text-white',
    priority: 5
  },
  cancelled: { 
    label: 'CANCELLED', 
    color: 'bg-red-100 text-red-800 border-red-300', 
    icon: XCircle,
    bgColor: 'bg-gradient-to-r from-red-50 to-red-100',
    textColor: 'text-red-700',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    buttonText: 'text-white',
    priority: 6
  }
}

const orderTypeConfig = {
  pickup: { label: 'Pickup', icon: Package, color: 'text-blue-600' },
  delivery: { label: 'Delivery', icon: Truck, color: 'text-green-600' },
  table_service: { label: 'Table', icon: Table, color: 'text-purple-600' },
  'dine-in': { label: 'Dine-in', icon: Table, color: 'text-purple-600' }
}

type ViewMode = 'kitchen' | 'server' | 'manager' | 'client'
type DisplayMode = 'cards' | 'rows'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<ViewMode>('manager')
  const [displayMode, setDisplayMode] = useState<'cards' | 'rows'>('cards')
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_table_number: "",
    customer_pickup_time: "",
    customer_address: "",
    customer_special_instructions: "",
    order_type: 'pickup' as const,
    items: [] as any[]
  })

  const fetchMenuItems = async () => {
    try {
      console.log('Fetching menu items...')
      const { restaurantId: userRestaurantId, restaurant } = await getCurrentUserRestaurant()
      console.log('Restaurant data:', { restaurantId: userRestaurantId, restaurant })
      
      if (!userRestaurantId) {
        console.error('No restaurant ID found')
        return
      }

      setRestaurantId(userRestaurantId)

      const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', userRestaurantId)
        .order('name')

      if (error) {
        console.error('Supabase error fetching menu items:', error)
        return
      }

      console.log('Menu items fetched successfully:', items?.length || 0)
      setMenuItems(items || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchMenuItems()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, typeFilter])

  const fetchOrders = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { restaurantId: userRestaurantId, restaurant: userRestaurant } = await getCurrentUserRestaurant()

      if (!userRestaurantId) {
        throw new Error('Restaurant not found')
      }

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
        .eq('restaurant_id', userRestaurantId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      console.log('Orders fetched successfully:', orders?.length || 0)
      setOrders(orders || [])
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      
      // Handle network errors with retry logic
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.code === 'NETWORK_ERROR') {
        if (retryCount < 3) {
          console.log(`Retrying fetch orders (attempt ${retryCount + 1}/3)...`)
          setTimeout(() => fetchOrders(retryCount + 1), 1000 * (retryCount + 1)) // Exponential backoff
          return
        } else {
          setError('Network connection failed. Please check your internet connection and try again.')
        }
      } else if (error.message?.includes('not authenticated')) {
        setError('Session expired. Please log in again.')
      } else if (error.message?.includes('Restaurant not found')) {
        setError('Restaurant configuration not found. Please contact support.')
      } else {
        setError(`Failed to load orders: ${error.message || 'Unknown error occurred'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.includes(searchTerm) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(order => order.order_type === typeFilter)
    }

    // Sort by priority for kitchen view
    if (viewMode === 'kitchen') {
      filtered = filtered.sort((a, b) => {
        const aPriority = statusConfig[a.status]?.priority || 999
        const bPriority = statusConfig[b.status]?.priority || 999
        if (aPriority !== bPriority) return aPriority - bPriority
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        throw error
      }

      fetchOrders()
    } catch (error: any) {
      console.error('Error updating order status:', error)
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        alert('Network error. Please check your connection and try again.')
      } else if (error.message?.includes('not authenticated')) {
        alert('Session expired. Please log in again.')
      } else {
        alert(`Failed to update order status: ${error.message || 'Unknown error occurred'}`)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      today: orders.filter(o => {
        const today = new Date().toDateString()
        return new Date(o.created_at).toDateString() === today
      }).length
    }
    return stats
  }

  const getKitchenStats = () => {
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
    const totalItems = activeOrders.reduce((sum, order) => 
      sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    
    return {
      activeOrders: activeOrders.length,
      totalItems,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length
    }
  }

  const getServerStats = () => {
    const tableOrders = orders.filter(o => ['table_service', 'dine-in'].includes(o.order_type))
    const activeTables = new Set(tableOrders.map(o => o.customer_table_number).filter(Boolean))
    
    return {
      activeTables: activeTables.size,
      tableOrders: tableOrders.length,
      readyToServe: orders.filter(o => o.status === 'ready' && ['table_service', 'dine-in'].includes(o.order_type)).length,
      completedToday: orders.filter(o => {
        const today = new Date().toDateString()
        return o.status === 'served' && new Date(o.created_at).toDateString() === today
      }).length
    }
  }

  const stats = getOrderStats()
  const kitchenStats = getKitchenStats()
  const serverStats = getServerStats()

  // Helper functions for order creation
  const updateOrderItem = (index: number, field: string, value: any) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          // Update unit price when menu item changes
          if (field === 'menu_item_id') {
            const selectedMenuItem = menuItems.find(mi => mi.id === value)
            updatedItem.unit_price = selectedMenuItem?.price || 0
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const addItemToOrder = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, {
        menu_item_id: '',
        quantity: 1,
        unit_price: 0,
        special_instructions: ''
      }]
    }))
  }

  const removeItemFromOrder = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetSteps = () => {
    setCurrentStep(1)
  }

  const createOrder = async () => {
    if (newOrder.items.length === 0) {
      alert('Please add at least one item to the order')
      return
    }

    setCreatingOrder(true)
    try {
      const restaurantData = await getCurrentUserRestaurant()
      if (!restaurantData || !restaurantData.restaurantId) {
        throw new Error('Restaurant not found')
      }

      const subtotal = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
      const tax_amount = subtotal * 0.08
      const delivery_fee = newOrder.order_type === 'delivery' ? 5 : 0
      const total_amount = subtotal + tax_amount + delivery_fee

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurantData.restaurantId,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          customer_table_number: newOrder.customer_table_number,
          customer_pickup_time: newOrder.customer_pickup_time,
          customer_address: newOrder.customer_address,
          customer_special_instructions: newOrder.customer_special_instructions,
          order_type: newOrder.order_type,
          status: 'pending',
          subtotal,
          tax_amount,
          delivery_fee,
          total_amount
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = newOrder.items.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        special_instructions: item.special_instructions
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setShowCreateOrder(false)
      resetSteps()
      fetchOrders()
    } catch (error: any) {
      console.error('Error creating order:', error)
      alert(`Failed to create order: ${error.message}`)
    } finally {
      setCreatingOrder(false)
    }
  }

  // New functions for editing and canceling orders
  const editOrder = (order: Order) => {
    setEditingOrder(order)
    setShowOrderDetail(true)
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        throw error
      }

      fetchOrders()
      setSelectedOrder(null)
      setShowOrderDetail(false)
    } catch (error: any) {
      console.error('Error cancelling order:', error)
      alert(`Failed to cancel order: ${error.message}`)
    }
  }

  const updateOrderDetails = async (orderId: string, updates: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        throw error
      }

      fetchOrders()
      setEditingOrder(null)
      setShowOrderDetail(false)
    } catch (error: any) {
      console.error('Error updating order:', error)
      alert(`Failed to update order: ${error.message}`)
    }
  }

  const viewOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const printReceipt = async (order: Order) => {
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id
          // La configuración se obtiene automáticamente del restaurante
        })
      })

      const result = await response.json()

      if (result.success) {
        if (result.printerType === 'pdf' && result.pdfUrl) {
          // Abrir PDF en nueva ventana para impresión local
          const newWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes')
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Receipt - Order #${order.order_number}</title>
                <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  .print-button {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    z-index: 1000;
                  }
                  .print-button:hover {
                    background: #1d4ed8;
                  }
                  .instructions {
                    background: #f3f4f6;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    border-left: 4px solid #2563eb;
                  }
                  .order-header {
                    background: #1f2937;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <button class="print-button" onclick="window.print()">
                  🖨️ Print Receipt
                </button>
                <div class="order-header">
                  <h2>Order #${order.order_number}</h2>
                  <p>Click the print button to print this receipt</p>
                </div>
                <div class="instructions">
                  <strong>Printing Instructions:</strong><br>
                  1. Click "Print Receipt" button or press Ctrl+P<br>
                  2. Select your USB printer<br>
                  3. Choose "80mm" paper size if available<br>
                  4. Print the receipt
                </div>
                ${result.pdfUrl}
              </body>
              </html>
            `)
            newWindow.document.close()
            alert('Ticket abierto en nueva ventana - imprimir desde ahí')
          } else {
            alert('Bloqueador de ventanas activado - permitir ventanas emergentes')
          }
        } else {
          alert('Ticket enviado a la impresora')
        }
      } else {
        alert('Error al imprimir: ' + result.error)
      }
    } catch (error) {
      console.error('Error printing:', error)
      alert('Error al imprimir el ticket')
    }
  }

  if (loading) {
    return <Loading text="Loading orders..." />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchOrders()}>Try again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Minimalist Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-green-50 border border-green-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Orders
              </h1>
              <p className="text-gray-500 text-sm">
                Track and manage all restaurant orders
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-32 border border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kitchen">
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 text-orange-600" />
                    <span>Kitchen</span>
                  </div>
                </SelectItem>
                <SelectItem value="server">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Server</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span>Manager</span>
                  </div>
                </SelectItem>
                <SelectItem value="client">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>Client View</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Display Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <Button
                variant={displayMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('cards')}
                className={`px-3 py-2 ${displayMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === 'rows' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('rows')}
                className={`px-3 py-2 ${displayMode === 'rows' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Rows className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={() => fetchOrders()}
              variant="outline"
              size="sm"
              className="border border-gray-200 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowCreateOrder(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const { restaurantId } = await getCurrentUserRestaurant()
                  if (restaurantId) {
                    window.open(`/client-view/${restaurantId}`, '_blank')
                  }
                } catch (error) {
                  console.error('Error getting restaurant ID:', error)
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              <Monitor className="h-4 w-4 mr-2" />
              TV Display
            </Button>
          </div>
        </div>
      </div>



      {/* Filters */}
              <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={viewMode === 'kitchen' ? "Search by dish name..." : 
                             viewMode === 'server' ? "Search by table, customer..." : 
                             "Search by order number, customer, phone..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-gray-200 bg-white"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">New</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="served">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 border border-gray-200">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="table_service">Table</SelectItem>
                <SelectItem value="dine-in">Table</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0 
                ? "Orders will appear here when customers place them"
                : "No orders match your current filters"
              }
            </p>
            {orders.length > 0 && (
              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div>
          {/* Manager View - All orders with cards/rows toggle */}
          {viewMode === 'manager' && (
            <div className="space-y-6">
              {displayMode === 'cards' ? (
                // Cards View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => {
                    const statusInfo = statusConfig[order.status]
                    const typeInfo = orderTypeConfig[order.order_type] || orderTypeConfig['pickup']
                    return (
                      <Card key={order.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-lg">#{order.order_number}</h4>
                              <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                              <div className="mt-1 flex items-center space-x-1">
                                <typeInfo.icon className={`h-3 w-3 ${typeInfo.color}`} />
                                <span className="text-xs text-gray-500">{typeInfo.label}</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{order.customer_name}</span>
                            </div>
                            {order.customer_phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{order.customer_phone}</span>
                              </div>
                            )}
                            <div className="space-y-2">
                              {order.order_items.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">{item.quantity}x</span>
                                    <span className="text-sm text-gray-700">{item.menu_items?.name || `Item ${item.menu_item_id}`}</span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    <FormattedPrice amount={item.total_price} restaurantId={restaurantId} />
                                  </span>
                                </div>
                              ))}
                              {order.order_items.length > 3 && (
                                <div className="text-center">
                                  <span className="text-xs text-gray-500">+{order.order_items.length - 3} more items</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t pt-3">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">Total:</span>
                                <span className="font-semibold text-lg">
                                  <FormattedPrice amount={order.total_amount} restaurantId={restaurantId} />
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button 
                              onClick={() => viewOrderDetail(order)}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              onClick={() => editOrder(order)}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                              <Button 
                                onClick={() => cancelOrder(order.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                // Rows View
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredOrders.map((order) => {
                            const statusInfo = statusConfig[order.status]
                            const typeInfo = orderTypeConfig[order.order_type] || orderTypeConfig['pickup']
                            return (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">#{order.order_number}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{order.customer_name}</div>
                                  {order.customer_phone && (
                                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <typeInfo.icon className={`h-4 w-4 ${typeInfo.color}`} />
                                    <span className="text-sm text-gray-900">{typeInfo.label}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant="outline" className={statusInfo.color}>
                                    {statusInfo.label}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {order.order_items.length} items
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} total
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                  <FormattedPrice amount={order.total_amount} restaurantId={restaurantId} />
                                </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      onClick={() => viewOrderDetail(order)}
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      onClick={() => editOrder(order)}
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                                      <Button 
                                        onClick={() => cancelOrder(order.id)}
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Kitchen View - Dishes grouped by preparation status */}
          {viewMode === 'kitchen' && (
            <div className="space-y-6">
              {/* To Prepare Section */}
              {filteredOrders.filter(o => ['pending', 'confirmed'].includes(o.status)).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="h-5 w-5 text-red-500 mr-2" />
                    To Prepare
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders
                      .filter(o => ['pending', 'confirmed'].includes(o.status))
                      .map((order) => (
                        <Card key={order.id} className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-all duration-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-lg">#{order.order_number}</h4>
                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                              </div>
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                {order.order_type === 'table_service' || order.order_type === 'dine-in' ? `Table ${order.customer_table_number}` : (orderTypeConfig[order.order_type] || orderTypeConfig['pickup']).label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-bold text-lg text-red-600">{item.quantity}x</span>
                                    <div>
                                      <p className="font-medium">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                                      {item.special_instructions && (
                                        <p className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1">
                                          {item.special_instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex gap-2">
                              {order.status === 'pending' && (
                                <Button 
                                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                  size="sm"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                              )}
                              {order.status === 'confirmed' && (
                                <Button 
                                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                                  size="sm"
                                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  <Timer className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Preparing Section */}
              {filteredOrders.filter(o => o.status === 'preparing').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Timer className="h-5 w-5 text-orange-500 mr-2" />
                    Preparing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders
                      .filter(o => o.status === 'preparing')
                      .map((order) => (
                        <Card key={order.id} className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-all duration-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-lg">#{order.order_number}</h4>
                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                              </div>
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                {order.order_type === 'table_service' || order.order_type === 'dine-in' ? `Table ${order.customer_table_number}` : (orderTypeConfig[order.order_type] || orderTypeConfig['pickup']).label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-bold text-lg text-orange-600">{item.quantity}x</span>
                                    <div>
                                      <p className="font-medium">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                                      {item.special_instructions && (
                                        <p className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1">
                                          {item.special_instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4">
                              <Button 
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                Mark Ready
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Ready Section */}
              {filteredOrders.filter(o => o.status === 'ready').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-5 w-5 text-green-500 mr-2" />
                    Ready to Serve
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders
                      .filter(o => o.status === 'ready')
                      .map((order) => (
                        <Card key={order.id} className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-all duration-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-lg">#{order.order_number}</h4>
                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                              </div>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                {order.order_type === 'table_service' || order.order_type === 'dine-in' ? `Table ${order.customer_table_number}` : (orderTypeConfig[order.order_type] || orderTypeConfig['pickup']).label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-bold text-lg text-green-600">{item.quantity}x</span>
                                    <div>
                                      <p className="font-medium">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                                      {item.special_instructions && (
                                        <p className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1">
                                          {item.special_instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4">
                              <Button 
                                onClick={() => updateOrderStatus(order.id, 'served')}
                                size="sm"
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark Served
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Server View - Table orders */}
          {viewMode === 'server' && (
            <div className="space-y-6">
              {/* Table Orders */}
              {filteredOrders.filter(o => ['table_service', 'dine-in'].includes(o.order_type)).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Table className="h-5 w-5 text-purple-500 mr-2" />
                    Table Orders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders
                      .filter(o => ['table_service', 'dine-in'].includes(o.order_type))
                      .map((order) => {
                        const statusInfo = statusConfig[order.status]
                        return (
                          <Card key={order.id} className="border-2 border-purple-200 bg-purple-50 hover:shadow-lg transition-all duration-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-lg">Table {order.customer_table_number}</h4>
                                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                                </div>
                                <Badge variant="outline" className={statusInfo.color}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                {order.order_items.slice(0, 3).map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center space-x-3">
                                      <span className="font-bold text-lg text-purple-600">{item.quantity}x</span>
                                      <div>
                                        <p className="font-medium">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                                        {item.special_instructions && (
                                          <p className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1">
                                            {item.special_instructions}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {order.order_items.length > 3 && (
                                  <div className="text-center">
                                    <span className="text-xs text-gray-500">+{order.order_items.length - 3} more items</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-4 flex gap-2">
                                {order.status === 'ready' && (
                                  <Button 
                                    onClick={() => updateOrderStatus(order.id, 'served')}
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Serve
                                  </Button>
                                )}
                                <Button 
                                  onClick={() => viewOrderDetail(order)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Pickup/Delivery Orders */}
              {filteredOrders.filter(o => 
                ['pickup', 'delivery'].includes(o.order_type) && 
                ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
              ).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 text-blue-500 mr-2" />
                    Pickup & Delivery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders
                      .filter(o => ['pickup', 'delivery'].includes(o.order_type) && ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status))
                      .map((order) => {
                        const statusInfo = statusConfig[order.status]
                        const typeInfo = orderTypeConfig[order.order_type] || orderTypeConfig['pickup']
                        return (
                          <Card key={order.id} className="border-2 border-blue-200 bg-blue-50">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-lg">#{order.order_number}</h4>
                                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className={statusInfo.color}>
                                    {statusInfo.label}
                                  </Badge>
                                  <div className="mt-1 flex items-center space-x-1">
                                    <typeInfo.icon className={`h-3 w-3 ${typeInfo.color}`} />
                                    <span className="text-xs text-gray-500">{typeInfo.label}</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 mb-4">
                                {order.order_items.slice(0, 3).map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                                    <div className="flex items-center space-x-3">
                                      <span className="font-medium">{item.quantity}x</span>
                                      <span className="text-gray-700">{item.menu_items?.name || `Item ${item.menu_item_id}`}</span>
                                    </div>
                                    <span className="font-medium">
                                      <FormattedPrice amount={item.total_price} restaurantId={restaurantId} />
                                    </span>
                                  </div>
                                ))}
                                {order.order_items.length > 3 && (
                                  <div className="text-center">
                                    <span className="text-xs text-gray-500">+{order.order_items.length - 3} more items</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {order.status === 'ready' && (
                                  <Button 
                                    onClick={() => updateOrderStatus(order.id, 'served')}
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                )}
                                <Button 
                                  onClick={() => viewOrderDetail(order)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Client View - McDonald's Style */}
          {viewMode === 'client' && (
            <div className="space-y-8">
              {/* Preparing Orders Section */}
              {filteredOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Timer className="h-6 w-6 text-orange-500 mr-3" />
                      Preparing Your Order
                    </h3>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                      {filteredOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length} orders
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders
                      .filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
                      .map((order) => (
                        <Card key={order.id} className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 hover:shadow-lg transition-all duration-300">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900">#{order.order_number}</h4>
                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                  {order.status === 'pending' ? 'Order Received' : 
                                   order.status === 'confirmed' ? 'Confirmed' : 'Preparing'}
                                </Badge>
                                <div className="mt-2 flex items-center space-x-1">
                                  {(() => {
                                    const typeConfig = orderTypeConfig[order.order_type] || orderTypeConfig['pickup']
                                    const IconComponent = typeConfig.icon
                                    return <IconComponent className={`h-4 w-4 ${typeConfig.color}`} />
                                  })()}
                                  <span className="text-xs text-gray-500">{(orderTypeConfig[order.order_type] || orderTypeConfig['pickup']).label}</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3 mb-4">
                              {order.order_items.slice(0, 4).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-bold text-lg text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                      {item.quantity}x
                                    </span>
                                    <div>
                                      <p className="font-medium text-gray-900">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                                      {item.special_instructions && (
                                        <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1">
                                          💬 {item.special_instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-medium text-gray-700">
                                    <FormattedPrice amount={item.total_price} restaurantId={restaurantId} />
                                  </span>
                                </div>
                              ))}
                              {order.order_items.length > 4 && (
                                <div className="text-center py-2">
                                  <span className="text-sm text-gray-500">+{order.order_items.length - 4} more items</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t border-orange-200 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600">Total:</span>
                                <span className="text-xl font-bold text-gray-900">
                                  <FormattedPrice amount={order.total_amount} restaurantId={restaurantId} />
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-orange-100 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      order.status === 'pending' ? 'bg-orange-300 w-1/3' :
                                      order.status === 'confirmed' ? 'bg-orange-400 w-2/3' :
                                      'bg-orange-500 w-full'
                                    }`}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {order.status === 'pending' ? 'Ordered' : 
                                   order.status === 'confirmed' ? 'Confirmed' : 'Preparing'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Ready Orders Section */}
              {filteredOrders.filter(o => o.status === 'ready').length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Zap className="h-6 w-6 text-green-500 mr-3" />
                      Ready for Pickup
                    </h3>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      {filteredOrders.filter(o => o.status === 'ready').length} orders
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders
                      .filter(o => o.status === 'ready')
                      .map((order) => (
                        <Card key={order.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-all duration-300">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900">#{order.order_number}</h4>
                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                  Ready!
                                </Badge>
                                <div className="mt-2 flex items-center space-x-1">
                                  {(() => {
                                    const typeConfig = orderTypeConfig[order.order_type] || orderTypeConfig['pickup']
                                    const IconComponent = typeConfig.icon
                                    return <IconComponent className={`h-4 w-4 ${typeConfig.color}`} />
                                  })()}
                                  <span className="text-xs text-gray-500">{(orderTypeConfig[order.order_type] || orderTypeConfig['pickup']).label}</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3 mb-4">
                              {order.order_items.slice(0, 4).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-bold text-lg text-green-600 bg-green-100 px-2 py-1 rounded">
                                      {item.quantity}x
                                    </span>
                                    <div>
                                      <p className="font-medium text-gray-900">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                                      {item.special_instructions && (
                                        <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1">
                                          💬 {item.special_instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-medium text-gray-700">
                                    <FormattedPrice amount={item.total_price} restaurantId={restaurantId} />
                                  </span>
                                </div>
                              ))}
                              {order.order_items.length > 4 && (
                                <div className="text-center py-2">
                                  <span className="text-sm text-gray-500">+{order.order_items.length - 4} more items</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t border-green-200 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600">Total:</span>
                                <span className="text-xl font-bold text-gray-900">
                                  <FormattedPrice amount={order.total_amount} restaurantId={restaurantId} />
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-green-100 rounded-full h-2">
                                  <div className="h-2 rounded-full bg-green-500 w-full"></div>
                                </div>
                                <span className="text-xs text-green-600 font-medium">Ready!</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Completed Orders Section */}
              {filteredOrders.filter(o => o.status === 'served').length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <CheckCircle className="h-6 w-6 text-gray-500 mr-3" />
                      Recently Completed
                    </h3>
                    <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                      {filteredOrders.filter(o => o.status === 'served').length} orders
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders
                      .filter(o => o.status === 'served')
                      .slice(0, 6) // Show only last 6 completed orders
                      .map((order) => (
                        <Card key={order.id} className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 hover:shadow-md transition-all duration-300">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">#{order.order_number}</h4>
                                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                                  Completed
                                </Badge>
                                <div className="mt-2 flex items-center space-x-1">
                                  {(() => {
                                    const typeConfig = orderTypeConfig[order.order_type] || orderTypeConfig['pickup']
                                    const IconComponent = typeConfig.icon
                                    return <IconComponent className={`h-4 w-4 ${typeConfig.color}`} />
                                  })()}
                                  <span className="text-xs text-gray-500">{(orderTypeConfig[order.order_type] || orderTypeConfig['pickup']).label}</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2 mb-4">
                              <div className="text-sm text-gray-600">
                                {order.order_items.length} items • <FormattedPrice amount={order.total_amount} restaurantId={restaurantId} />
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">Order completed successfully</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* No Orders Message */}
              {filteredOrders.length === 0 && (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders available</h3>
                    <p className="text-gray-600">
                      Orders will appear here when customers place them
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order details</h2>
                <Button 
                  onClick={() => setSelectedOrder(null)}
                  variant="ghost"
                  size="sm"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* Order Header */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">#{selectedOrder.order_number}</h3>
                    <p className="text-sm text-gray-600">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      <FormattedPrice amount={selectedOrder.total_amount} restaurantId={restaurantId} />
                    </p>
                    <Badge className={statusConfig[selectedOrder.status].color}>
                      {statusConfig[selectedOrder.status].label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Customer information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    {selectedOrder.customer_phone && (
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                    )}
                    {selectedOrder.customer_email && (
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {selectedOrder.customer_table_number && (
                      <p><span className="font-medium">Table:</span> {selectedOrder.customer_table_number}</p>
                    )}
                    {selectedOrder.customer_pickup_time && (
                      <p><span className="font-medium">Pickup time:</span> {formatTime(selectedOrder.customer_pickup_time)}</p>
                    )}
                    {selectedOrder.customer_address && (
                      <p><span className="font-medium">Address:</span> {selectedOrder.customer_address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Order items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                        <p className="text-sm text-gray-600">${item.unit_price.toFixed(2)} × {item.quantity}</p>
                        {item.special_instructions && (
                          <p className="text-sm text-gray-600 mt-1">
                            <FileText className="h-3 w-3 inline mr-1" />
                            {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Order summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span><FormattedPrice amount={selectedOrder.subtotal} restaurantId={restaurantId} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span><FormattedPrice amount={selectedOrder.tax_amount} restaurantId={restaurantId} /></span>
                  </div>
                  {selectedOrder.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery fee:</span>
                      <span><FormattedPrice amount={selectedOrder.delivery_fee} restaurantId={restaurantId} /></span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span><FormattedPrice amount={selectedOrder.total_amount} restaurantId={restaurantId} /></span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.customer_special_instructions && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Special instructions</h4>
                  <p className="text-yellow-700">{selectedOrder.customer_special_instructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedOrder.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'confirmed')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.confirmed.buttonColor} ${statusConfig.confirmed.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm order
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'preparing')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.preparing.buttonColor} ${statusConfig.preparing.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Start preparing
                  </Button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'ready')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.ready.buttonColor} ${statusConfig.ready.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Mark ready
                  </Button>
                )}
                {selectedOrder.status === 'ready' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'served')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.served.buttonColor} ${statusConfig.served.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark completed
                  </Button>
                )}
                
                {['pending', 'confirmed', 'preparing'].includes(selectedOrder.status) && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'cancelled')
                      setSelectedOrder(null)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel order
                  </Button>
                )}

                {/* Print receipt button temporarily disabled
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  <Printer className="h-4 w-4 mr-2" />
                  Print receipt
                </Button>
                */}

                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-center pt-20 pb-8">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
                  {/* Step Indicator */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      1
                    </div>
                    <div className={`w-2 h-0.5 ${
                      currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      2
                    </div>
                    <div className={`w-2 h-0.5 ${
                      currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      3
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCreateOrder(false)}
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Step 1: Customer Information */}
                  {currentStep === 1 && (
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Customer Information</CardTitle>
                        <p className="text-sm text-gray-600">Enter customer details and order type</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Customer Name *</label>
                            <Input
                              value={newOrder.customer_name}
                              onChange={(e) => setNewOrder(prev => ({ ...prev, customer_name: e.target.value }))}
                              placeholder="Enter customer name"
                              className="mt-1 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                            <Input
                              value={newOrder.customer_phone}
                              onChange={(e) => setNewOrder(prev => ({ ...prev, customer_phone: e.target.value }))}
                              placeholder="Enter phone number"
                              className="mt-1 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input
                              value={newOrder.customer_email}
                              onChange={(e) => setNewOrder(prev => ({ ...prev, customer_email: e.target.value }))}
                              placeholder="Enter email address"
                              className="mt-1 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Order Type *</label>
                            <Select 
                              value={newOrder.order_type} 
                              onValueChange={(value: any) => setNewOrder(prev => ({ ...prev, order_type: value }))}
                            >
                              <SelectTrigger className="mt-1 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pickup">Pickup</SelectItem>
                                <SelectItem value="delivery">Delivery</SelectItem>
                                <SelectItem value="table_service">Table Service</SelectItem>
                                <SelectItem value="dine-in">Dine-in</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newOrder.order_type === 'table_service' || newOrder.order_type === 'dine-in' ? (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Table Number</label>
                              <Input
                                value={newOrder.customer_table_number}
                                onChange={(e) => setNewOrder(prev => ({ ...prev, customer_table_number: e.target.value }))}
                                placeholder="Enter table number"
                                className="mt-1 bg-white"
                              />
                            </div>
                          ) : newOrder.order_type === 'pickup' ? (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Pickup Time</label>
                              <Input
                                type="time"
                                value={newOrder.customer_pickup_time}
                                onChange={(e) => setNewOrder(prev => ({ ...prev, customer_pickup_time: e.target.value }))}
                                className="mt-1 bg-white"
                              />
                            </div>
                          ) : newOrder.order_type === 'delivery' ? (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                              <Input
                                value={newOrder.customer_address}
                                onChange={(e) => setNewOrder(prev => ({ ...prev, customer_address: e.target.value }))}
                                placeholder="Enter delivery address"
                                className="mt-1 bg-white"
                              />
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                          <Input
                            value={newOrder.customer_special_instructions}
                            onChange={(e) => setNewOrder(prev => ({ ...prev, customer_special_instructions: e.target.value }))}
                            placeholder="Any special instructions for the order"
                            className="mt-1 bg-white"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 2: Order Items */}
                  {currentStep === 2 && (
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Order Items</CardTitle>
                            <p className="text-sm text-gray-600">Add items to the order</p>
                          </div>
                          <Button
                            onClick={addItemToOrder}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {newOrder.items.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No items added yet</p>
                            <p className="text-sm">Click "Add Item" to start building the order</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {newOrder.items.map((item, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                                  <Button
                                    onClick={() => removeItemFromOrder(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Menu Item</label>
                                    <Select 
                                      value={item.menu_item_id} 
                                      onValueChange={(value) => updateOrderItem(index, 'menu_item_id', value)}
                                    >
                                      <SelectTrigger className="mt-1 bg-white">
                                        <SelectValue placeholder="Select menu item" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {menuItems.map((menuItem) => (
                                          <SelectItem key={menuItem.id} value={menuItem.id}>
                                            {menuItem.name} - ${menuItem.price}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                      className="mt-1 bg-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Unit Price</label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={item.unit_price}
                                      onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                      className="mt-1 bg-white"
                                    />
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                                  <Input
                                    value={item.special_instructions}
                                    onChange={(e) => updateOrderItem(index, 'special_instructions', e.target.value)}
                                    placeholder="Any special instructions for this item"
                                    className="mt-1 bg-white"
                                  />
                                </div>
                                <div className="mt-3 text-right">
                                  <span className="font-medium text-gray-900">
                                    Subtotal: ${(item.quantity * item.unit_price).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 3: Order Summary */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Order Summary</CardTitle>
                          <p className="text-sm text-gray-600">Review and confirm the order</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Customer Info Summary */}
                            <div className="border-b border-gray-200 pb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">Name:</span> {newOrder.customer_name}</div>
                                <div><span className="font-medium">Phone:</span> {newOrder.customer_phone || 'N/A'}</div>
                                <div><span className="font-medium">Email:</span> {newOrder.customer_email || 'N/A'}</div>
                                <div><span className="font-medium">Order Type:</span> {newOrder.order_type}</div>
                                {newOrder.customer_table_number && (
                                  <div><span className="font-medium">Table:</span> {newOrder.customer_table_number}</div>
                                )}
                                {newOrder.customer_pickup_time && (
                                  <div><span className="font-medium">Pickup Time:</span> {newOrder.customer_pickup_time}</div>
                                )}
                                {newOrder.customer_address && (
                                  <div><span className="font-medium">Address:</span> {newOrder.customer_address}</div>
                                )}
                              </div>
                            </div>

                            {/* Items Summary */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {newOrder.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <div>
                                      <span className="font-medium">
                                        {menuItems.find(mi => mi.id === item.menu_item_id)?.name || 'Unknown Item'}
                                      </span>
                                      <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                                    </div>
                                    <span className="font-medium">
                                      <FormattedPrice amount={item.total_price} restaurantId={restaurantId} />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Total Summary */}
                            <div className="border-t border-gray-200 pt-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>${newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax (8%):</span>
                                  <span>${(newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) * 0.08).toFixed(2)}</span>
                                </div>
                                {newOrder.order_type === 'delivery' && (
                                  <div className="flex justify-between">
                                    <span>Delivery Fee:</span>
                                    <span>$5.00</span>
                                  </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                  <span>Total:</span>
                                  <span>${(newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) * 1.08 + (newOrder.order_type === 'delivery' ? 5 : 0)).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-100">
                    <div className="flex space-x-3">
                      {currentStep > 1 && (
                        <Button 
                          onClick={prevStep}
                          variant="outline"
                          className="border-gray-300"
                        >
                          Previous
                        </Button>
                      )}
                      <Button 
                        onClick={() => setShowCreateOrder(false)}
                        variant="outline"
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                    <div className="flex space-x-3">
                      {currentStep < 3 ? (
                        <Button 
                          onClick={nextStep}
                          disabled={
                            (currentStep === 1 && !newOrder.customer_name) ||
                            (currentStep === 2 && newOrder.items.length === 0)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button 
                          onClick={createOrder}
                          disabled={creatingOrder}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {creatingOrder ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Create Order
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && !editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <Badge variant="outline" className={statusConfig[selectedOrder.status].color}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>
              <Button 
                onClick={() => {
                  setShowOrderDetail(false)
                  setSelectedOrder(null)
                  setEditingOrder(null)
                }}
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">#{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{(orderTypeConfig[selectedOrder.order_type] || orderTypeConfig['pickup']).label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="outline" className={statusConfig[selectedOrder.status].color}>
                        {statusConfig[selectedOrder.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                    {selectedOrder.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedOrder.customer_email}</span>
                      </div>
                    )}
                    {selectedOrder.customer_table_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Table:</span>
                        <span className="font-medium">{selectedOrder.customer_table_number}</span>
                      </div>
                    )}
                    {selectedOrder.customer_address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{selectedOrder.customer_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-lg">{item.quantity}x</span>
                        <div>
                          <p className="font-medium">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                          {item.special_instructions && (
                            <p className="text-sm text-orange-600 mt-1">{item.special_instructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.total_price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${item.unit_price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.customer_special_instructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">{selectedOrder.customer_special_instructions}</p>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span><FormattedPrice amount={selectedOrder.subtotal} restaurantId={restaurantId} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span><FormattedPrice amount={selectedOrder.tax_amount} restaurantId={restaurantId} /></span>
                  </div>
                  {selectedOrder.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span><FormattedPrice amount={selectedOrder.delivery_fee} restaurantId={restaurantId} /></span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span><FormattedPrice amount={selectedOrder.total_amount} restaurantId={restaurantId} /></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {selectedOrder.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'confirmed')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.confirmed.buttonColor} ${statusConfig.confirmed.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Order
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'preparing')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.preparing.buttonColor} ${statusConfig.preparing.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Start Preparing
                  </Button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'ready')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.ready.buttonColor} ${statusConfig.ready.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Mark Ready
                  </Button>
                )}
                {selectedOrder.status === 'ready' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'served')
                      setSelectedOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.served.buttonColor} ${statusConfig.served.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Completed
                  </Button>
                )}
                
                {['pending', 'confirmed', 'preparing'].includes(selectedOrder.status) && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'cancelled')
                      setSelectedOrder(null)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}

                {/* Print Receipt button temporarily disabled
                <Button 
                  onClick={() => printReceipt(selectedOrder)}
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                */}

                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Edit Modal */}
      {showOrderDetail && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Order</h2>
                <Badge variant="outline" className={statusConfig[editingOrder.status].color}>
                  {statusConfig[editingOrder.status].label}
                </Badge>
              </div>
              <Button 
                onClick={() => {
                  setShowOrderDetail(false)
                  setSelectedOrder(null)
                  setEditingOrder(null)
                }}
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">#{editingOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(editingOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{(orderTypeConfig[editingOrder.order_type] || orderTypeConfig['pickup']).label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="outline" className={statusConfig[editingOrder.status].color}>
                        {statusConfig[editingOrder.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{editingOrder.customer_name}</span>
                    </div>
                    {editingOrder.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{editingOrder.customer_phone}</span>
                      </div>
                    )}
                    {editingOrder.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{editingOrder.customer_email}</span>
                      </div>
                    )}
                    {editingOrder.customer_table_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Table:</span>
                        <span className="font-medium">{editingOrder.customer_table_number}</span>
                      </div>
                    )}
                    {editingOrder.customer_address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{editingOrder.customer_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {editingOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-lg">{item.quantity}x</span>
                        <div>
                          <p className="font-medium">{item.menu_items?.name || `Item ${item.menu_item_id}`}</p>
                          {item.special_instructions && (
                            <p className="text-sm text-orange-600 mt-1">{item.special_instructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.total_price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${item.unit_price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {editingOrder.customer_special_instructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">{editingOrder.customer_special_instructions}</p>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${editingOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${editingOrder.tax_amount.toFixed(2)}</span>
                  </div>
                  {editingOrder.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>${editingOrder.delivery_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span><FormattedPrice amount={editingOrder.total_amount} restaurantId={restaurantId} /></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {editingOrder.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(editingOrder.id, 'confirmed')
                      setEditingOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.confirmed.buttonColor} ${statusConfig.confirmed.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Order
                  </Button>
                )}
                {editingOrder.status === 'confirmed' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(editingOrder.id, 'preparing')
                      setEditingOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.preparing.buttonColor} ${statusConfig.preparing.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Start Preparing
                  </Button>
                )}
                {editingOrder.status === 'preparing' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(editingOrder.id, 'ready')
                      setEditingOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.ready.buttonColor} ${statusConfig.ready.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Mark Ready
                  </Button>
                )}
                {editingOrder.status === 'ready' && (
                  <Button 
                    onClick={() => {
                      updateOrderStatus(editingOrder.id, 'served')
                      setEditingOrder(null)
                    }}
                    className={`flex-1 ${statusConfig.served.buttonColor} ${statusConfig.served.buttonText} shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Completed
                  </Button>
                )}
                
                {['pending', 'confirmed', 'preparing'].includes(editingOrder.status) && (
                  <Button 
                    onClick={() => {
                      cancelOrder(editingOrder.id)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}

                {/* Print Receipt button temporarily disabled
                <Button 
                  onClick={() => printReceipt(editingOrder)}
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                */}

                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
