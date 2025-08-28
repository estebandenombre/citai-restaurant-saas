import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, payment_intent_id, payment_method_id, gateway } = body

    // Validate required fields
    if (!restaurant_id || !payment_intent_id || !gateway) {
      return NextResponse.json({ 
        error: 'Missing required fields: restaurant_id, payment_intent_id, gateway' 
      }, { status: 400 })
    }

    // Get restaurant payment settings
    const settings = await PaymentService.getPaymentSettings(restaurant_id)
    if (!settings) {
      return NextResponse.json({ 
        error: 'Payment settings not found for this restaurant' 
      }, { status: 404 })
    }

    if (gateway === 'stripe') {
      // Check if Stripe is enabled and configured
      if (!settings.gateways.stripe.enabled || !settings.gateways.stripe.setup_complete) {
        return NextResponse.json({ 
          error: 'Stripe is not configured for this restaurant' 
        }, { status: 400 })
      }

      // Confirm Stripe payment intent
      const stripe = require('stripe')(settings.gateways.stripe.secret_key, {
        apiVersion: '2023-10-16'
      })

      const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
        payment_method: payment_method_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`
      })

      return NextResponse.json({
        success: true,
        payment_intent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      })
    } else {
      return NextResponse.json({ 
        error: 'Unsupported payment gateway' 
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error confirming payment:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 })
    } else if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ 
        error: 'Invalid payment request' 
      }, { status: 400 })
    } else if (error.type === 'StripeAPIError') {
      return NextResponse.json({ 
        error: 'Payment service temporarily unavailable' 
      }, { status: 503 })
    }

    return NextResponse.json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    }, { status: 500 })
  }
}

