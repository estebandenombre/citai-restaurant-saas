"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestOrderPage() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testOrderCreation = async () => {
    setLoading(true)
    setResult("")

    try {
      const testData = {
        restaurantId: "39740c1e-9152-45a7-872b-b2755b75928c", // Bella Vista
        orderNumber: "TEST-" + Date.now(),
        customerInfo: {
          name: "Test Customer",
          phone: "123-456-7890",
          email: "test@example.com",
          table_number: "",
          pickup_time: "12:00",
          address: "",
          order_type: "pickup",
          special_instructions: ""
        },
        cartItems: [
          {
            id: "test-item-1",
            name: "Test Dish",
            price: 10.00,
            quantity: 1
          }
        ],
        subtotal: 10.00,
        taxAmount: 0.80,
        deliveryFee: 0,
        totalAmount: 10.80
      }

      console.log("Sending test data:", testData)

      const response = await fetch('/api/debug-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        throw new Error(data.details || data.error || 'API test failed')
      }

      setResult("✅ Order created successfully! Check the console for details.")
      
    } catch (error: any) {
      console.error('Test failed:', error)
      setResult(`❌ Test failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Test Order Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            This will test the order creation API with a sample order.
          </p>
          
          <Button 
            onClick={testOrderCreation} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              'Test Order Creation'
            )}
          </Button>

          {result && (
            <div className={`p-3 rounded-lg ${
              result.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <span className="text-sm">{result}</span>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-4">
            <p>Check the browser console for detailed logs.</p>
            <p>If this fails, you may need to execute the SQL scripts in Supabase.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 