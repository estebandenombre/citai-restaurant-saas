"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormattedPrice } from "@/components/ui/formatted-price"
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Trash2, 
  Clock, 
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import Image from "next/image"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  special_instructions?: string
}

interface LocalCartProps {
  restaurantId: string
  restaurantName: string
  restaurantPhone?: string
  restaurantEmail?: string
  restaurantAddress?: string
}

export default function LocalCart({ 
  restaurantId, 
  restaurantName, 
  restaurantPhone, 
  restaurantEmail, 
  restaurantAddress 
}: LocalCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    tableNumber: '',
    address: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`local_cart_${restaurantId}`)
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [restaurantId])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(`local_cart_${restaurantId}`, JSON.stringify(cartItems))
  }, [cartItems, restaurantId])

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number, specialInstructions?: string) => {
    console.log('LocalCart addToCart called:', { item, quantity, specialInstructions })
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { 
                ...cartItem, 
                quantity: cartItem.quantity + quantity,
                special_instructions: specialInstructions || cartItem.special_instructions
              }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity, special_instructions: specialInstructions }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, special_instructions: instructions } : item
      )
    )
  }

  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0)

  const getSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  const getTax = () => getSubtotal() * 0.08 // 8% tax

  const getTotal = () => getSubtotal() + getTax()

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem(`local_cart_${restaurantId}`)
  }

  const validateCustomerInfo = () => {
    const errors: string[] = []
    
    if (!customerInfo.name.trim()) {
      errors.push('Nombre completo es requerido')
    }
    
    if (!customerInfo.phone.trim()) {
      errors.push('Teléfono es requerido')
    }
    
    if (orderType === 'dine-in' && !customerInfo.tableNumber.trim()) {
      errors.push('Número de mesa es requerido para servicio en mesa')
    }
    
    if (orderType === 'delivery' && !customerInfo.address.trim()) {
      errors.push('Dirección de entrega es requerida')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    const validation = validateCustomerInfo()
    if (!validation.isValid) {
      alert(`Por favor completa todos los campos requeridos:\n${validation.errors.join('\n')}`)
      return
    }

    setIsSubmitting(true)
    try {
      // Create order
      const orderData = {
        restaurant_id: restaurantId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email,
        table_number: orderType === 'dine-in' ? parseInt(customerInfo.tableNumber) : null,
        order_type: orderType,
        subtotal: getSubtotal(),
        tax_amount: getTax(),
        total_amount: getTotal(),
        notes: customerInfo.notes,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          special_instructions: item.special_instructions
        }))
      }

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el pedido')
      }

      // Show success message
      alert(`¡Pedido enviado con éxito! Tu número de pedido es: ${result.order.order_number}`)
      
      // Clear cart and close dialogs
      clearCart()
      setIsCheckoutOpen(false)
      setIsOpen(false)
      setCustomerInfo({
        name: '',
        phone: '',
        email: '',
        tableNumber: '',
        address: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error al enviar el pedido. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Expose addToCart function globally for MenuItem components
  useEffect(() => {
    ;(window as any).addToCartLocal = addToCart
    
    // Listen for custom events from MenuItem components
    const handleAddToCart = (event: CustomEvent) => {
      const { item, quantity, specialInstructions } = event.detail
      console.log('LocalCart received addToCart event:', { item, quantity, specialInstructions })
      addToCart(item, quantity, specialInstructions)
    }
    
    window.addEventListener('addToCart', handleAddToCart as EventListener)
    
    return () => {
      delete (window as any).addToCartLocal
      window.removeEventListener('addToCart', handleAddToCart as EventListener)
    }
  }, [])

  return (
    <>
      {/* Cart Button */}
      <Button
        variant="outline"
        size="lg"
        className="fixed bottom-6 right-6 z-50 shadow-lg bg-white hover:bg-gray-50"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        <span className="mr-2">Carrito</span>
        {getTotalItems() > 0 && (
          <Badge className="ml-2 bg-blue-600 text-white">
            {getTotalItems()}
          </Badge>
        )}
      </Button>

      {/* Cart Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Tu Pedido</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {restaurantName}
            </DialogDescription>
          </DialogHeader>

          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400">Agrega algunos platos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <p className="text-sm text-gray-600"><FormattedPrice amount={item.price} restaurantId={restaurantId} /></p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <Textarea
                          placeholder="Special instructions..."
                          value={item.special_instructions || ''}
                          onChange={(e) => updateSpecialInstructions(item.id, e.target.value)}
                          className="mt-2 text-xs"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (8%):</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1"
                >
                  Vaciar Carrito
                </Button>
                <Button
                  onClick={() => {
                    setIsOpen(false)
                    setIsCheckoutOpen(true)
                  }}
                  className="flex-1"
                  disabled={cartItems.length === 0}
                >
                  Proceder al Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Completar Pedido</DialogTitle>
            <DialogDescription>
              Proporciona tu información para completar el pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Type */}
            <div>
              <Label>Tipo de Pedido</Label>
              <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dine-in">Comer en el restaurante</SelectItem>
                  <SelectItem value="takeaway">Para llevar</SelectItem>
                  <SelectItem value="delivery">Entrega a domicilio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <div>
                <Label>Nombre completo *</Label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <Label>Teléfono *</Label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Tu teléfono"
                  required
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@email.com"
                />
              </div>

              {orderType === 'dine-in' && (
                <div>
                  <Label>Número de mesa</Label>
                  <Input
                    type="number"
                    value={customerInfo.tableNumber}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, tableNumber: e.target.value }))}
                    placeholder="Mesa #"
                  />
                </div>
              )}

              {orderType === 'delivery' && (
                <div>
                  <Label>Dirección de entrega *</Label>
                  <Textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Dirección completa"
                    required
                  />
                </div>
              )}

              <div>
                <Label>Notas adicionales</Label>
                <Textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special instructions, allergies, etc."
                />
              </div>
            </div>

            {/* Restaurant Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {restaurantPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{restaurantPhone}</span>
                  </div>
                )}
                {restaurantEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{restaurantEmail}</span>
                  </div>
                )}
                {restaurantAddress && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{restaurantAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCheckout}
                className={`flex-1 ${
                  validateCustomerInfo().isValid 
                    ? 'bg-slate-900 hover:bg-slate-800' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={isSubmitting || !validateCustomerInfo().isValid}
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 