"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FormattedPrice } from "@/components/ui/formatted-price"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Package,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Table,
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Truck,
} from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
}

interface CustomerInfo {
  name: string
  phone: string
  email: string
  table_number: string
  pickup_time: string
  address: string
  order_type: string
  special_instructions: string
}

interface OrderSettings {
  order_enabled: boolean
  pickup_enabled: boolean
  delivery_enabled: boolean
  table_service_enabled: boolean
  require_name: boolean
  require_phone: boolean
  require_email: boolean
  require_table_number: boolean
  require_pickup_time: boolean
  require_address: boolean
  require_notes: boolean
  pickup_time_slots: string[]
  max_pickup_advance_hours: number
  min_pickup_advance_minutes: number
  auto_confirm_orders: boolean
  allow_special_instructions: boolean
  tax_enabled: boolean
  tax_rate: number
  tax_name: string
}

interface SimpleCartProps {
  restaurantId?: string
}

export default function SimpleCart({ restaurantId }: SimpleCartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCheckout, setIsCheckout] = useState(false)
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: order type, 2: customer info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    table_number: "",
    pickup_time: "",
    address: "",
    order_type: "",
    special_instructions: "",
  })

  // Load settings from localStorage
  const [settings, setSettings] = useState<OrderSettings>({
    order_enabled: true,
    pickup_enabled: true,
    delivery_enabled: false,
    table_service_enabled: false,
    require_name: true,
    require_phone: true,
    require_email: false,
    require_table_number: false,
    require_pickup_time: false,
    require_address: false,
    require_notes: false,
    pickup_time_slots: [],
    max_pickup_advance_hours: 24,
    min_pickup_advance_minutes: 30,
    auto_confirm_orders: false,
    allow_special_instructions: true,
    tax_enabled: false,
    tax_rate: 0,
    tax_name: "Tax",
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('orderSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Try to load from database if available
    const loadDatabaseSettings = async () => {
      try {
        // Get current user's restaurant
        const { restaurant } = await getCurrentUserRestaurant()
        if (restaurant && typeof restaurant === 'object' && 'id' in restaurant) {
          const { data: dbSettings, error } = await supabase
            .from("order_settings")
            .select("*")
            .eq("restaurant_id", restaurant.id)
            .single()

          if (dbSettings && !error) {
            setSettings(dbSettings)
            // Update localStorage with database settings
            localStorage.setItem('orderSettings', JSON.stringify(dbSettings))
          }
        }
      } catch (error) {
        console.error("Error loading database settings:", error)
        // Keep using localStorage settings if database fails
      }
    }

    loadDatabaseSettings()

    // Load cart items from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }

    // Listen for add to cart events
    const handleAddToCart = (event: CustomEvent) => {
      const { item } = event.detail
      setCartItems(prev => {
        const existingItem = prev.find(cartItem => cartItem.id === item.id)
        if (existingItem) {
          return prev.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        } else {
          return [...prev, { ...item, quantity: 1 }]
        }
      })
    }

    window.addEventListener('addToCart', handleAddToCart as EventListener)

    return () => {
      window.removeEventListener('addToCart', handleAddToCart as EventListener)
    }
  }, [])

  useEffect(() => {
    // Save cart items to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTax = () => {
    if (!settings.tax_enabled) return 0
    return getSubtotal() * (settings.tax_rate / 100)
  }

  const getDeliveryFee = () => {
    return customerInfo.order_type === 'delivery' ? 3.99 : 0
  }

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryFee()
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    setCartItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const generateOrderNumber = () => {
    return `ORD-${Date.now().toString().slice(-6)}`
  }

  const handleCheckout = async () => {
    try {
      // Generate order number
      const newOrderNumber = generateOrderNumber()
      setOrderNumber(newOrderNumber)
      
      // Prepare order data
      const orderData = {
        restaurantId: restaurantId,
        orderNumber: newOrderNumber,
        customerInfo,
        cartItems,
        subtotal: getSubtotal(),
        taxAmount: getTax(),
        deliveryFee: getDeliveryFee(),
        totalAmount: getTotal()
      }

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        console.error('Response status:', response.status)
        console.error('Response headers:', Object.fromEntries(response.headers.entries()))
        throw new Error(errorData.details || errorData.error || `Failed to place order (Status: ${response.status})`)
      }

      const result = await response.json()
      console.log('Order created successfully:', result)
      
      // Mark order as placed
      setIsOrderPlaced(true)
      
      // Clear cart after order is placed
      clearCart()
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert(`Error placing order: ${error.message}`)
    }
  }

  const resetOrder = () => {
    setIsCheckout(false)
    setIsOrderPlaced(false)
    setOrderNumber("")
    setCheckoutStep(1)
    setCustomerInfo({
      name: "",
      phone: "",
      email: "",
      table_number: "",
      pickup_time: "",
      address: "",
      order_type: "",
      special_instructions: "",
    })
  }

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Don't show cart if orders are disabled
  if (!settings.order_enabled) {
    return null
  }

  return (
    <>
      {/* Floating Cart Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        size="lg"
        className="fixed bottom-6 right-6 z-50 shadow-xl bg-slate-900 hover:bg-slate-800 text-white rounded-full h-14 w-14 p-0 transition-all duration-300 hover:scale-110"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
            {itemCount}
          </Badge>
        )}
      </Button>

      {/* Cart Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-end p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md h-[95vh] bg-white shadow-2xl rounded-t-3xl rounded-b-3xl animate-in slide-in-from-bottom duration-300 flex flex-col border border-slate-200">
            {/* Header */}
            <CardHeader className="pb-4 flex-shrink-0 border-b bg-gradient-to-r from-slate-50 to-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Your Cart</CardTitle>
                    <p className="text-sm text-slate-500">{itemCount} items</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false)
                    if (isOrderPlaced) {
                      resetOrder()
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <CardContent className="p-6">
                {isOrderPlaced ? (
                  // Order Confirmation View
                  <div className="text-center space-y-6">
                    <div className="p-4 bg-green-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h3>
                      <p className="text-slate-600">Thank you for your order</p>
                    </div>
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border">
                      <p className="text-sm text-slate-600 mb-1">Order Number</p>
                      <p className="text-xl font-bold text-slate-900">{orderNumber}</p>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>We'll notify you when your order is ready</p>
                      {customerInfo.order_type === 'delivery' && (
                        <p>Estimated delivery time: 30-45 minutes</p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        resetOrder()
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : isCheckout ? (
                  // Checkout View - Step by Step
                  <div className="space-y-6">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className={`flex items-center space-x-2 ${checkoutStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          checkoutStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          1
                        </div>
                        <span className="text-sm font-medium">Order Type</span>
                      </div>
                      <div className={`w-8 h-1 rounded-full ${checkoutStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                      <div className={`flex items-center space-x-2 ${checkoutStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          checkoutStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          2
                        </div>
                        <span className="text-sm font-medium">Details</span>
                      </div>
                    </div>

                    {checkoutStep === 1 ? (
                      // Step 1: Order Type Selection
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">How would you like your order?</h3>
                          <p className="text-slate-600">Choose your preferred order type</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {settings.pickup_enabled && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerInfo({ ...customerInfo, order_type: 'pickup' })
                                setCheckoutStep(2)
                              }}
                              className="relative p-6 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                  <Package className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-bold text-lg text-slate-900 mb-1">Pickup</div>
                                  <div className="text-slate-600">Collect your order at the counter</div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              </div>
                            </button>
                          )}

                          {settings.delivery_enabled && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerInfo({ ...customerInfo, order_type: 'delivery' })
                                setCheckoutStep(2)
                              }}
                              className="relative p-6 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                                  <Truck className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-bold text-lg text-slate-900 mb-1">Delivery</div>
                                  <div className="text-slate-600">We'll deliver to your address</div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              </div>
                            </button>
                          )}

                          {settings.table_service_enabled && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerInfo({ ...customerInfo, order_type: 'table_service' })
                                setCheckoutStep(2)
                              }}
                              className="relative p-6 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                  <Table className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-bold text-lg text-slate-900 mb-1">Table Service</div>
                                  <div className="text-slate-600">We'll serve you at your table</div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Step 2: Customer Information
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Your Information</h3>
                          <p className="text-slate-600">We need a few details to complete your order</p>
                        </div>
                        
                        <div className="space-y-4">
                          {settings.require_name && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-700">Full Name *</Label>
                              <Input
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                placeholder="Enter your full name"
                                className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-lg bg-white"
                              />
                            </div>
                          )}

                          {settings.require_phone && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-700">Phone Number *</Label>
                              <Input
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                placeholder="Enter your phone number"
                                className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-lg bg-white"
                              />
                            </div>
                          )}

                          {settings.require_email && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-700">Email Address *</Label>
                              <Input
                                type="email"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                placeholder="Enter your email address"
                                className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-lg bg-white"
                              />
                            </div>
                          )}

                          {settings.require_table_number && customerInfo.order_type === 'table_service' && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-700">Table Number *</Label>
                              <Input
                                value={customerInfo.table_number}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, table_number: e.target.value })}
                                placeholder="Enter your table number"
                                className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-lg bg-white"
                              />
                            </div>
                          )}

                          {settings.require_pickup_time && customerInfo.order_type === 'pickup' && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-700">Pickup Time *</Label>
                              <Input
                                type="time"
                                value={customerInfo.pickup_time}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, pickup_time: e.target.value })}
                                className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-lg bg-white"
                              />
                            </div>
                          )}

                          {settings.require_address && customerInfo.order_type === 'delivery' && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-700">Delivery Address *</Label>
                              <Textarea
                                value={customerInfo.address}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                placeholder="Enter your delivery address"
                                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-lg resize-none bg-white"
                                rows={3}
                              />
                            </div>
                          )}

                          {settings.allow_special_instructions && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-700">Special Instructions (Optional)</Label>
                              <Textarea
                                value={customerInfo.special_instructions}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, special_instructions: e.target.value })}
                                placeholder="Any special requests, dietary requirements, or cooking preferences..."
                                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-lg resize-none bg-white"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 pt-6 space-y-4">
                      {checkoutStep === 1 ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsCheckout(false)}
                          className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" />
                          Back to Cart
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleCheckout}
                            className="w-full h-14 text-base font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-lg"
                          >
                            <Package className="h-5 w-5 mr-3" />
                            Place Order - <FormattedPrice amount={getTotal()} restaurantId={restaurantId} />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCheckoutStep(1)}
                            className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                          >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Order Type
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  // Cart Items View
                  <div className="space-y-4">
                    {cartItems.length === 0 ? (
                      // Empty Cart View
                      <div className="text-center py-12">
                        <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4">
                          <ShoppingCart className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
                        <p className="text-slate-600 mb-6">Add some delicious items to get started</p>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                          <p className="text-sm text-amber-800">
                            🎉 Free delivery on orders over <FormattedPrice amount={25} restaurantId={restaurantId} />!
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Cart Items
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">{item.name}</h4>
                                <p className="text-slate-600 text-sm"><FormattedPrice amount={item.price} restaurantId={restaurantId} /></p>
                                {item.specialInstructions && (
                                  <div className="flex items-start space-x-2 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-amber-800">{item.specialInstructions}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-lg font-bold min-w-[2rem] text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Order Summary */}
                        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-6">
                          <h4 className="font-semibold text-slate-900 mb-4">Order Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span><FormattedPrice amount={getSubtotal()} restaurantId={restaurantId} /></span>
                            </div>
                            {settings.tax_enabled && (
                              <div className="flex justify-between">
                                <span>{settings.tax_name}</span>
                                <span><FormattedPrice amount={getTax()} restaurantId={restaurantId} /></span>
                              </div>
                            )}
                            {customerInfo.order_type === 'delivery' && (
                              <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span><FormattedPrice amount={getDeliveryFee()} restaurantId={restaurantId} /></span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold text-lg">
                              <span>Total</span>
                              <span><FormattedPrice amount={getTotal()} restaurantId={restaurantId} /></span>
                            </div>
                          </div>
                          {customerInfo.order_type === 'delivery' && (
                            <p className="text-xs text-slate-500 mt-2">
                              Free delivery on orders over <FormattedPrice amount={25} restaurantId={restaurantId} />
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Button
                            onClick={() => setIsCheckout(true)}
                            className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] bg-slate-900 hover:bg-slate-800"
                          >
                            <ChevronRight className="h-5 w-5 mr-2" />
                            Proceed to Checkout
                          </Button>
                          <Button
                            variant="outline"
                            onClick={clearCart}
                            className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
                          >
                            <Trash2 className="h-5 w-5 mr-2" />
                            Clear Cart
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 