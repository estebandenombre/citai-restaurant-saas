"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Download, FileText, Plus, Trash2 } from 'lucide-react'
import { TicketGenerator, OrderData } from '@/lib/ticket-generator'
import { getCurrencySymbol, formatCurrency } from '@/lib/currency-utils'

export default function TestTicketPage() {
  const [restaurantName, setRestaurantName] = useState('The Urban Bistro')
  const [restaurantAddress, setRestaurantAddress] = useState('123 Main Street, Downtown')
  const [restaurantPhone, setRestaurantPhone] = useState('+1 (555) 123-4567')
  const [restaurantEmail, setRestaurantEmail] = useState('info@urbanbistro.com')
  const [restaurantCurrency, setRestaurantCurrency] = useState('USD')
  const [currencyPosition, setCurrencyPosition] = useState<'before' | 'after'>('before')
  
  const [customerName, setCustomerName] = useState('John Doe')
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 987-6543')
  const [customerEmail, setCustomerEmail] = useState('john.doe@email.com')
  const [orderType, setOrderType] = useState('delivery')
  const [specialInstructions, setSpecialInstructions] = useState('Extra spicy, please!')
  
  const [items, setItems] = useState([
    { name: 'Margherita Pizza', quantity: 2, price: 15.99, total: 31.98, notes: 'Extra cheese' },
    { name: 'Caesar Salad', quantity: 1, price: 12.99, total: 12.99, notes: 'No croutons' },
    { name: 'Garlic Bread', quantity: 1, price: 5.99, total: 5.99, notes: '' }
  ])

  const [generating, setGenerating] = useState(false)

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0, total: 0, notes: '' }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate total
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price
    }
    
    setItems(newItems)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.total, 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.08 // 8% tax
  }

  const getDeliveryFee = () => {
    return orderType === 'delivery' ? 3.99 : 0
  }

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryFee()
  }

  const generateTicket = async () => {
    setGenerating(true)
    
    try {
      const currencySymbol = getCurrencySymbol(restaurantCurrency)
      
      const ticketData: OrderData = {
        orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
        orderDate: new Date().toLocaleString(),
        restaurant: {
          name: restaurantName,
          address: restaurantAddress,
          phone: restaurantPhone,
          email: restaurantEmail,
          currency: restaurantCurrency,
          currencySymbol: currencySymbol,
          currencyPosition: currencyPosition
        },
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          order_type: orderType,
          special_instructions: specialInstructions
        },
        items: items,
        subtotal: getSubtotal(),
        taxAmount: getTax(),
        deliveryFee: getDeliveryFee(),
        totalAmount: getTotal(),
        paymentMethod: 'Credit Card',
        paymentStatus: 'completed'
      }

      // Generate and download the ticket
      TicketGenerator.downloadTicket(ticketData)
      
      // Optional: Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Error generating ticket:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Generator Test</h1>
        <p className="text-gray-600">Test the PDF ticket generation system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Restaurant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurantAddress">Address</Label>
              <Input
                id="restaurantAddress"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Phone</Label>
              <Input
                id="restaurantPhone"
                value={restaurantPhone}
                onChange={(e) => setRestaurantPhone(e.target.value)}
              />
            </div>
            
                         <div className="space-y-2">
               <Label htmlFor="restaurantEmail">Email</Label>
               <Input
                 id="restaurantEmail"
                 value={restaurantEmail}
                 onChange={(e) => setRestaurantEmail(e.target.value)}
               />
             </div>
             
                            <div className="space-y-2">
                 <Label htmlFor="restaurantCurrency">Currency</Label>
                 <select
                   id="restaurantCurrency"
                   value={restaurantCurrency}
                   onChange={(e) => setRestaurantCurrency(e.target.value)}
                   className="w-full p-2 border border-gray-300 rounded-md"
                 >
                   <option value="USD">USD - US Dollar ($)</option>
                   <option value="EUR">EUR - Euro (€)</option>
                   <option value="GBP">GBP - British Pound (£)</option>
                   <option value="JPY">JPY - Japanese Yen (¥)</option>
                   <option value="CAD">CAD - Canadian Dollar (C$)</option>
                   <option value="AUD">AUD - Australian Dollar (A$)</option>
                   <option value="CHF">CHF - Swiss Franc (CHF)</option>
                   <option value="CNY">CNY - Chinese Yuan (¥)</option>
                   <option value="MXN">MXN - Mexican Peso ($)</option>
                   <option value="BRL">BRL - Brazilian Real (R$)</option>
                 </select>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="currencyPosition">Currency Position</Label>
                 <select
                   id="currencyPosition"
                   value={currencyPosition}
                   onChange={(e) => setCurrencyPosition(e.target.value as 'before' | 'after')}
                   className="w-full p-2 border border-gray-300 rounded-md"
                 >
                   <option value="before">Before amount ($123.45)</option>
                   <option value="after">After amount (123.45$)</option>
                 </select>
               </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <select
                id="orderType"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
                <option value="dine-in">Dine-in</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Items
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Notes"
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  />
                </div>
                                 <div className="col-span-1">
                   <span className="font-semibold">{formatCurrency(item.total, restaurantCurrency, currencyPosition)}</span>
                 </div>
                <div className="col-span-1">
                  <Button
                    onClick={() => removeItem(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
                     <div className="space-y-2 text-sm">
             <div className="flex justify-between">
               <span>Subtotal:</span>
               <span>{formatCurrency(getSubtotal(), restaurantCurrency, currencyPosition)}</span>
             </div>
             <div className="flex justify-between">
               <span>Tax (8%):</span>
               <span>{formatCurrency(getTax(), restaurantCurrency, currencyPosition)}</span>
             </div>
             {orderType === 'delivery' && (
               <div className="flex justify-between">
                 <span>Delivery Fee:</span>
                 <span>{formatCurrency(getDeliveryFee(), restaurantCurrency, currencyPosition)}</span>
               </div>
             )}
             <div className="flex justify-between font-semibold text-lg border-t pt-2">
               <span>Total:</span>
               <span>{formatCurrency(getTotal(), restaurantCurrency, currencyPosition)}</span>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <Button
            onClick={generateTicket}
            disabled={generating}
            className="w-full h-12"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate and Download Ticket
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
