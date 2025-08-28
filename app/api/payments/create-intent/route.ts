import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, amount, currency, metadata } = body

    // Validate required fields
    if (!restaurant_id || !amount || !currency) {
      return NextResponse.json({ 
        error: 'Missing required fields: restaurant_id, amount, currency' 
      }, { status: 400 })
    }

    // Get restaurant payment settings
    const settings = await PaymentService.getPaymentSettings(restaurant_id)
    if (!settings) {
      return NextResponse.json({ 
        error: 'Payment settings not found for this restaurant' 
      }, { status: 404 })
    }

    // Check if Stripe is enabled and configured
    if (!settings.gateways.stripe.enabled || !settings.gateways.stripe.setup_complete) {
      return NextResponse.json({ 
        error: 'Stripe is not configured for this restaurant' 
      }, { status: 400 })
    }

    // Validate payment amount
    if (amount <= 0) {
      return NextResponse.json({ 
        error: 'Payment amount must be greater than 0' 
      }, { status: 400 })
    }

    // Create Stripe payment intent
    console.log('🔍 Creating Stripe payment intent with:', {
      amount,
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        restaurant_id: restaurant_id,
        gateway: 'stripe'
      },
      processing_fee: settings.gateways.stripe.processing_fee
    })

    const stripe = require('stripe')(settings.gateways.stripe.secret_key, {
      apiVersion: '2023-10-16'
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        restaurant_id: restaurant_id,
        gateway: 'stripe'
      },
      payment_method_types: ['card']
      // Removed application_fee_amount as it might be causing issues
    })

    console.log('🔍 Payment intent created successfully:', paymentIntent.id)

    return NextResponse.json({
      success: true,
      payment_intent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    })

  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    
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
      error: 'Failed to create payment intent',
      details: error.message 
    }, { status: 500 })
  }
}
