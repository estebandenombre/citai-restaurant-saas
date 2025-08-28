import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id } = body

    console.log('🔍 Testing Stripe configuration for restaurant:', restaurant_id)

    // Get restaurant payment settings
    const settings = await PaymentService.getPaymentSettings(restaurant_id)
    if (!settings) {
      return NextResponse.json({ 
        error: 'Payment settings not found for this restaurant' 
      }, { status: 404 })
    }

    console.log('🔍 Payment settings found:', {
      payments_enabled: settings.payments_enabled,
      stripe_enabled: settings.gateways.stripe.enabled,
      stripe_setup_complete: settings.gateways.stripe.setup_complete,
      has_secret_key: !!settings.gateways.stripe.secret_key,
      secret_key_prefix: settings.gateways.stripe.secret_key?.substring(0, 7)
    })

    // Check if Stripe is enabled and configured
    if (!settings.gateways.stripe.enabled || !settings.gateways.stripe.setup_complete) {
      return NextResponse.json({ 
        error: 'Stripe is not configured for this restaurant',
        details: {
          enabled: settings.gateways.stripe.enabled,
          setup_complete: settings.gateways.stripe.setup_complete
        }
      }, { status: 400 })
    }

    // Test Stripe connection
    const stripe = require('stripe')(settings.gateways.stripe.secret_key, {
      apiVersion: '2023-10-16'
    })

    console.log('🔍 Testing Stripe connection...')

    // Try to create a test payment intent
    const testPaymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        test: 'true',
        restaurant_id: restaurant_id
      }
    })

    console.log('🔍 Test payment intent created:', testPaymentIntent.id)

    // Cancel the test payment intent
    await stripe.paymentIntents.cancel(testPaymentIntent.id)

    return NextResponse.json({
      success: true,
      message: 'Stripe configuration is working correctly',
      test_payment_intent_id: testPaymentIntent.id,
      settings: {
        payments_enabled: settings.payments_enabled,
        stripe_enabled: settings.gateways.stripe.enabled,
        stripe_setup_complete: settings.gateways.stripe.setup_complete,
        processing_fee: settings.gateways.stripe.processing_fee
      }
    })

  } catch (error: any) {
    console.error('🔍 Error testing Stripe configuration:', error)
    
    return NextResponse.json({ 
      error: 'Stripe configuration test failed',
      details: error.message,
      type: error.type
    }, { status: 500 })
  }
}

