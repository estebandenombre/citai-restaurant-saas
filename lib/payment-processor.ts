import { supabase } from './supabase'
import { PaymentService } from './payment-service'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  client_secret?: string
  payment_method_types: string[]
}

export interface PaymentResult {
  success: boolean
  payment_intent_id?: string
  client_secret?: string
  error?: string
  message?: string
}

export class PaymentProcessor {
  // Get payment settings for a specific restaurant
  static async getRestaurantPaymentSettings(restaurantId: string) {
    try {
      const settings = await PaymentService.getPaymentSettings(restaurantId)
      if (!settings) {
        throw new Error('Payment settings not found for this restaurant')
      }
      return settings
    } catch (error) {
      console.error('Error getting payment settings:', error)
      throw error
    }
  }

  // Check if restaurant has payments enabled
  static async hasPaymentsEnabled(restaurantId: string): Promise<boolean> {
    try {
      console.log('🔍 PaymentProcessor: Checking payments for restaurant:', restaurantId)
      const settings = await this.getRestaurantPaymentSettings(restaurantId)
      console.log('🔍 PaymentProcessor: Got settings:', settings)
      
      const paymentsEnabled = settings.payments_enabled
      const hasActiveMethods = this.hasActivePaymentMethods(settings)
      
      console.log('🔍 PaymentProcessor: payments_enabled:', paymentsEnabled)
      console.log('🔍 PaymentProcessor: hasActiveMethods:', hasActiveMethods)
      
      return paymentsEnabled && hasActiveMethods
    } catch (error) {
      console.error('Error checking payments enabled:', error)
      return false
    }
  }

  // Check if restaurant has active payment methods
  static hasActivePaymentMethods(settings: any): boolean {
    console.log('🔍 PaymentProcessor: Checking active payment methods...')
    console.log('🔍 PaymentProcessor: settings.payments_enabled:', settings.payments_enabled)
    
    if (!settings.payments_enabled) {
      console.log('🔍 PaymentProcessor: Payments not enabled in settings')
      return false
    }
    
    // Check if any gateway is enabled and properly configured
    const activeGateways = Object.entries(settings.gateways).filter(([gatewayId, gateway]: [string, any]) => {
      const isEnabled = gateway.enabled && gateway.setup_complete
      console.log(`🔍 PaymentProcessor: Gateway ${gatewayId}: enabled=${gateway.enabled}, setup_complete=${gateway.setup_complete}`)
      return isEnabled
    })
    
    console.log('🔍 PaymentProcessor: Active gateways:', activeGateways.map(([id]) => id))
    return activeGateways.length > 0
  }

  // Get available payment methods for a restaurant
  static getAvailablePaymentMethods(settings: any): string[] {
    const methods: string[] = []
    
    if (settings.allow_cash) methods.push('cash')
    
    // Check enabled gateways
    Object.entries(settings.gateways).forEach(([gatewayId, gateway]: [string, any]) => {
      if (gateway.enabled && gateway.setup_complete) {
        methods.push(...gateway.supported_methods)
      }
    })
    
    return [...new Set(methods)] // Remove duplicates
  }

  // Create payment intent with Stripe
  static async createStripePaymentIntent(
    restaurantId: string, 
    amount: number, 
    currency: string = 'usd',
    metadata: any = {}
  ): Promise<PaymentResult> {
    try {
      // Get restaurant payment settings
      const settings = await this.getRestaurantPaymentSettings(restaurantId)
      
      if (!settings.gateways.stripe.enabled || !settings.gateways.stripe.setup_complete) {
        throw new Error('Stripe is not configured for this restaurant')
      }

      // Create payment intent using server-side API
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            ...metadata,
            restaurant_id: restaurantId,
            gateway: 'stripe'
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const result = await response.json()
      
      return {
        success: true,
        payment_intent_id: result.payment_intent.id,
        client_secret: result.payment_intent.client_secret,
        message: 'Payment intent created successfully'
      }
    } catch (error: any) {
      console.error('Error creating Stripe payment intent:', error)
      return {
        success: false,
        error: error.message || 'Failed to create payment intent'
      }
    }
  }

  // Create payment intent with PayPal
  static async createPayPalPaymentIntent(
    restaurantId: string, 
    amount: number, 
    currency: string = 'USD',
    metadata: any = {}
  ): Promise<PaymentResult> {
    try {
      // Get restaurant payment settings
      const settings = await this.getRestaurantPaymentSettings(restaurantId)
      
      if (!settings.gateways.paypal.enabled || !settings.gateways.paypal.setup_complete) {
        throw new Error('PayPal is not configured for this restaurant')
      }

      // Create PayPal order using server-side API
      const response = await fetch('/api/payments/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          amount: amount,
          currency: currency,
          metadata: {
            ...metadata,
            restaurant_id: restaurantId,
            gateway: 'paypal'
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create PayPal order')
      }

      const result = await response.json()
      
      return {
        success: true,
        payment_intent_id: result.order_id,
        client_secret: result.approval_url,
        message: 'PayPal order created successfully'
      }
    } catch (error: any) {
      console.error('Error creating PayPal order:', error)
      return {
        success: false,
        error: error.message || 'Failed to create PayPal order'
      }
    }
  }

  // Confirm payment with card details (for Stripe)
  static async confirmStripePaymentWithCard(
    restaurantId: string,
    paymentIntentId: string,
    cardDetails: {
      card_number: string
      expiry_date: string
      cvv: string
      cardholder_name: string
    }
  ): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/confirm-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          payment_intent_id: paymentIntentId,
          ...cardDetails
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm payment')
      }

      const result = await response.json()
      
      if (result.success) {
        return {
          success: true,
          payment_intent_id: result.payment_intent.id,
          message: 'Payment confirmed successfully'
        }
      } else if (result.requires_action) {
        return {
          success: false,
          requires_action: true,
          client_secret: result.payment_intent.client_secret,
          error: 'Payment requires additional authentication'
        }
      } else {
        return {
          success: false,
          error: result.error || 'Payment failed'
        }
      }
    } catch (error: any) {
      console.error('Error confirming Stripe payment:', error)
      return {
        success: false,
        error: error.message || 'Failed to confirm payment'
      }
    }
  }

  // Confirm payment (for Stripe) - legacy method
  static async confirmStripePayment(
    restaurantId: string,
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId,
          gateway: 'stripe'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm payment')
      }

      const result = await response.json()
      
      return {
        success: true,
        payment_intent_id: result.payment_intent.id,
        message: 'Payment confirmed successfully'
      }
    } catch (error: any) {
      console.error('Error confirming Stripe payment:', error)
      return {
        success: false,
        error: error.message || 'Failed to confirm payment'
      }
    }
  }

  // Capture PayPal payment
  static async capturePayPalPayment(
    restaurantId: string,
    orderId: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/capture-paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          order_id: orderId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to capture PayPal payment')
      }

      const result = await response.json()
      
      return {
        success: true,
        payment_intent_id: result.capture_id,
        message: 'PayPal payment captured successfully'
      }
    } catch (error: any) {
      console.error('Error capturing PayPal payment:', error)
      return {
        success: false,
        error: error.message || 'Failed to capture PayPal payment'
      }
    }
  }

  // Get payment status
  static async getPaymentStatus(
    restaurantId: string,
    paymentIntentId: string,
    gateway: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          payment_intent_id: paymentIntentId,
          gateway: gateway
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get payment status')
      }

      const result = await response.json()
      
      return {
        success: true,
        payment_intent_id: result.payment_intent_id,
        message: `Payment status: ${result.status}`
      }
    } catch (error: any) {
      console.error('Error getting payment status:', error)
      return {
        success: false,
        error: error.message || 'Failed to get payment status'
      }
    }
  }

  // Calculate processing fee
  static calculateProcessingFee(amount: number, gateway: string, settings: any): number {
    const gatewayConfig = settings.gateways[gateway]
    if (!gatewayConfig || !gatewayConfig.processing_fee) {
      return 0
    }
    
    const percentageFee = (amount * gatewayConfig.processing_fee) / 100
    const fixedFee = 30 // $0.30 in cents
    
    return Math.round(percentageFee + fixedFee)
  }

  // Validate payment amount
  static validatePaymentAmount(amount: number, settings: any): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Payment amount must be greater than 0' }
    }

    if (settings.min_order_value && amount < settings.min_order_value) {
      return { valid: false, error: `Minimum order value is $${settings.min_order_value}` }
    }

    if (settings.max_order_value && amount > settings.max_order_value) {
      return { valid: false, error: `Maximum order value is $${settings.max_order_value}` }
    }

    return { valid: true }
  }
}
