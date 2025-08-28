"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import StripePaymentTest from '@/components/restaurant/stripe-payment-test'

export default function TestPaymentPage() {
  const [restaurantId, setRestaurantId] = useState('550e8400-e29b-41d4-a716-446655440001') // The Urban Bistro
  const [amount, setAmount] = useState(10.99)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePaymentSuccess = (paymentResult: any) => {
    setResult(paymentResult)
    setError(null)
    console.log('✅ Payment successful:', paymentResult)
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    setResult(null)
    console.error('❌ Payment failed:', errorMessage)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment System Test</h1>
        <p className="text-gray-600">Test the Stripe payment integration with test tokens</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantId">Restaurant ID</Label>
              <Input
                id="restaurantId"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                placeholder="Enter restaurant ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="10.99"
              />
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This test uses Stripe's test token system. 
                No real payments will be processed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Test */}
        <div>
          <StripePaymentTest
            restaurantId={restaurantId}
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Payment Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Payment Details:</h3>
              <pre className="text-sm text-green-700 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>1.</strong> Verify the restaurant ID is correct (should be "The Urban Bistro")</p>
            <p><strong>2.</strong> Set the payment amount you want to test</p>
            <p><strong>3.</strong> Enter a cardholder name</p>
            <p><strong>4.</strong> Click "Pay" to test the payment flow</p>
            <p><strong>5.</strong> Check the results and server logs for details</p>
            <p><strong>Note:</strong> This uses Stripe's test token system, so no real payments are processed.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

