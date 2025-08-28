"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { PaymentProcessor } from '@/lib/payment-processor'

interface StripePaymentTestProps {
  restaurantId: string
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

export default function StripePaymentTest({
  restaurantId,
  amount,
  onSuccess,
  onError
}: StripePaymentTestProps) {
  const [cardholderName, setCardholderName] = useState('')
  const [processing, setProcessing] = useState(false)

  const handlePayment = async () => {
    if (!cardholderName.trim()) {
      onError('Please enter cardholder name')
      return
    }

    setProcessing(true)

    try {
      console.log('🔍 Starting test payment with Stripe token...')

      // Create payment intent
      const intentResult = await PaymentProcessor.createStripePaymentIntent(
        restaurantId,
        amount,
        'usd',
        {
          test: true,
          cardholder_name: cardholderName
        }
      )

      if (!intentResult.success) {
        throw new Error(intentResult.error || 'Failed to create payment intent')
      }

      console.log('🔍 Payment intent created:', intentResult.payment_intent_id)

      // Confirm payment with test token (we'll use a simple approach)
      const confirmResult = await PaymentProcessor.confirmStripePaymentWithCard(
        restaurantId,
        intentResult.payment_intent_id,
        {
          card_number: 'tok_visa', // Use Stripe test token
          expiry_date: '12/25',
          cvv: '123',
          cardholder_name: cardholderName
        }
      )

      if (confirmResult.success) {
        onSuccess({
          ...confirmResult,
          payment_method: 'stripe',
          test_payment: true
        })
      } else {
        onError(confirmResult.error || 'Payment failed')
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      onError(error.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Stripe Test Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardholder">Cardholder Name</Label>
          <Input
            id="cardholder"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            className="h-12"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Test Mode:</strong> This will use Stripe's test token (tok_visa) 
            to simulate a successful payment without requiring real card details.
          </p>
        </div>

        <Button
          onClick={handlePayment}
          className="w-full h-12"
          disabled={!cardholderName.trim() || processing}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing Test Payment...
            </>
          ) : (
            `Pay $${amount.toFixed(2)} (Test)`
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          This is a test payment using Stripe's test token system.
        </div>
      </CardContent>
    </Card>
  )
}

