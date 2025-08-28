"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  DollarSign, 
  Apple, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Loader
} from 'lucide-react'
import { PaymentProcessor } from '@/lib/payment-processor'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/currency-utils'
import { supabase } from '@/lib/supabase'

interface PaymentCheckoutProps {
  restaurantId: string
  amount: number
  currency?: string
  orderData?: any
  onPaymentSuccess: (paymentResult: any) => void
  onPaymentError: (error: string) => void
  onCancel: () => void
}

export default function PaymentCheckout({
  restaurantId,
  amount,
  currency = 'USD',
  orderData,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}: PaymentCheckoutProps) {
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [enabledGateways, setEnabledGateways] = useState<any[]>([])
  const [selectedGateway, setSelectedGateway] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [processingFee, setProcessingFee] = useState(0)
  const [restaurantCurrencyConfig, setRestaurantCurrencyConfig] = useState<any>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const { toast } = useToast()

  // Load payment settings
  useEffect(() => {
    const loadPaymentSettings = async () => {
      try {
        setLoading(true)
        console.log('🔍 Loading payment settings for restaurant:', restaurantId)
        
        // Check if payments are enabled for this restaurant
        const hasPayments = await PaymentProcessor.hasPaymentsEnabled(restaurantId)
        console.log('🔍 Has payments enabled:', hasPayments)
        
        if (!hasPayments) {
          onPaymentError('Payments are not enabled for this restaurant')
          return
        }

        // Get payment settings
        const settings = await PaymentProcessor.getRestaurantPaymentSettings(restaurantId)
        console.log('🔍 Payment settings:', settings)
        setPaymentSettings(settings)

        // Get enabled gateways only
        const enabled = Object.entries(settings.gateways)
          .filter(([gatewayId, gateway]: [string, any]) => 
            gateway.enabled && gateway.setup_complete
          )
          .map(([gatewayId, gateway]: [string, any]) => ({
            id: gatewayId,
            name: gateway.name,
            config: gateway
          }))

        console.log('🔍 Enabled gateways:', enabled)
        setEnabledGateways(enabled)

        // Set default gateway
        if (enabled.length > 0) {
          setSelectedGateway(enabled[0].id)
        }

        // Calculate processing fee for the selected gateway
        if (enabled.length > 0) {
          const fee = PaymentProcessor.calculateProcessingFee(amount, enabled[0].id, settings)
          setProcessingFee(fee)
        }

        // Get restaurant currency configuration
        try {
          const { data: restaurantData } = await supabase
            .from('restaurants')
            .select('currency_config')
            .eq('id', restaurantId)
            .single()
          
          if (restaurantData?.currency_config) {
            setRestaurantCurrencyConfig(restaurantData.currency_config)
          }
        } catch (error) {
          console.error('Error fetching restaurant currency config:', error)
        }

      } catch (error) {
        console.error('Error loading payment settings:', error)
        onPaymentError('Failed to load payment options')
      } finally {
        setLoading(false)
      }
    }

    loadPaymentSettings()
  }, [restaurantId, amount])

  // Update processing fee when gateway changes
  useEffect(() => {
    if (paymentSettings && selectedGateway) {
      const fee = PaymentProcessor.calculateProcessingFee(amount, selectedGateway, paymentSettings)
      setProcessingFee(fee)
    }
  }, [selectedGateway, paymentSettings, amount])

  const handlePayment = async () => {
    if (!selectedGateway || !paymentSettings) {
      onPaymentError('Please select a payment method')
      return
    }

    setProcessing(true)

    try {
      let paymentResult

      if (selectedGateway === 'stripe') {
        if (!restaurantId) {
          throw new Error('Restaurant ID is required for payment')
        }

        // Create Stripe payment intent first
        const intentResult = await PaymentProcessor.createStripePaymentIntent(
          restaurantId as string,
          amount + (processingFee / 100), // Add processing fee
          (currency || 'USD').toLowerCase(),
          {
            order_id: orderData?.id,
            order_number: orderData?.orderNumber,
            customer_email: orderData?.customerInfo?.email
          }
        )

        if (!intentResult.success) {
          throw new Error(intentResult.error || 'Failed to create payment intent')
        }

        // Now confirm the payment with card details
        const confirmResult = await PaymentProcessor.confirmStripePaymentWithCard(
          restaurantId as string,
          intentResult.payment_intent_id,
          {
            card_number: cardNumber,
            expiry_date: expiryDate,
            cvv: cvv,
            cardholder_name: cardholderName
          }
        )

        paymentResult = confirmResult
      } else if (selectedGateway === 'paypal') {
        // Create PayPal order
        paymentResult = await PaymentProcessor.createPayPalPaymentIntent(
          restaurantId,
          amount + (processingFee / 100), // Add processing fee
          currency || 'USD',
          {
            order_id: orderData?.id,
            order_number: orderData?.orderNumber,
            customer_email: orderData?.customerInfo?.email
          }
        )
             } else if (selectedGateway === 'apple_pay') {
         // Apple Pay payment - for now, treat as successful
         paymentResult = {
           success: true,
           payment_intent_id: `apple_pay_${Date.now()}`,
           message: 'Apple Pay payment selected'
         }
      } else {
        throw new Error('Unsupported payment method')
      }

      if (paymentResult.success) {
        onPaymentSuccess({
          ...paymentResult,
          payment_method: selectedGateway,
          processing_fee: processingFee,
          total_amount: amount + (processingFee / 100)
        })
      } else {
        onPaymentError(paymentResult.error || 'Payment failed')
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      onPaymentError(error.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const getGatewayIcon = (gatewayId: string) => {
    switch (gatewayId) {
      case 'stripe':
        return <CreditCard className="h-5 w-5" />
      case 'paypal':
        return <DollarSign className="h-5 w-5" />
      case 'apple_pay':
        return <Apple className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getGatewayName = (gatewayId: string) => {
    switch (gatewayId) {
      case 'stripe':
        return 'Credit/Debit Card'
      case 'paypal':
        return 'PayPal'
      case 'apple_pay':
        return 'Apple Pay'
      default:
        return gatewayId
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Loading available payment methods...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (enabledGateways.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              No Payment Methods Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This restaurant has not configured any payment methods yet.
            </p>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Payment Methods Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Choose Payment Method
          </CardTitle>
          <CardDescription>
            Select how you'd like to pay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {enabledGateways.map((gateway) => (
            <div
              key={gateway.id}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedGateway === gateway.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedGateway(gateway.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                {getGatewayIcon(gateway.id)}
                <span className="font-medium">{getGatewayName(gateway.id)}</span>
              </div>
              {selectedGateway === gateway.id && (
                <CheckCircle className="h-5 w-5 text-blue-500" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Card Details Form (for Stripe) */}
      {selectedGateway === 'stripe' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Card Details
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
            
            <div className="space-y-2">
              <Label htmlFor="cardnumber">Card Number</Label>
              <Input
                id="cardnumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="h-12"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={4}
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(amount, currency || 'USD', restaurantCurrencyConfig?.position || 'before')}</span>
          </div>
          {processingFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing Fee</span>
              <span>{formatCurrency(processingFee / 100, currency || 'USD', restaurantCurrencyConfig?.position || 'before')}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(amount + (processingFee / 100), currency || 'USD', restaurantCurrencyConfig?.position || 'before')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Secure Payment</p>
          <p>Your payment information is encrypted and secure. We never store your card details.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 h-12"
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          className="flex-1 h-12"
          disabled={!selectedGateway || processing || (selectedGateway === 'stripe' && (!cardNumber || !expiryDate || !cvv || !cardholderName))}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount + (processingFee / 100), currency || 'USD', restaurantCurrencyConfig?.position || 'before')}`
          )}
        </Button>
      </div>
    </div>
  )
}
