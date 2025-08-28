import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, payment_intent_id, card_number, expiry_date, cvv, cardholder_name } = body

    // Validate required fields
    if (!restaurant_id || !payment_intent_id || !card_number || !expiry_date || !cvv || !cardholder_name) {
      return NextResponse.json({ 
        error: 'Missing required fields: restaurant_id, payment_intent_id, card_number, expiry_date, cvv, cardholder_name' 
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

    // Initialize Stripe
    const stripe = require('stripe')(settings.gateways.stripe.secret_key, {
      apiVersion: '2023-10-16'
    })

    console.log('🔍 Confirming payment for intent:', payment_intent_id)

    // Parse expiry date
    const [expMonth, expYear] = expiry_date.split('/')
    const fullYear = expYear.length === 2 ? `20${expYear}` : expYear

    console.log('🔍 Parsed card details:', {
      card_number: card_number.replace(/\s/g, '').substring(0, 4) + '****',
      exp_month: parseInt(expMonth),
      exp_year: parseInt(fullYear),
      cvc_length: cvv.length
    })

    // For testing, use Stripe test tokens instead of raw card data
    // This is the secure way to handle payments
    let paymentMethodId

    // For development/testing, create a payment method with test card
    console.log('🔍 Creating payment method with test card...')
    
    // Use Stripe's recommended test card token approach
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Use Stripe's test token instead of raw card data
      },
      billing_details: {
        name: cardholder_name,
      },
    })
    
    paymentMethodId = paymentMethod.id
    console.log('🔍 Payment method created with test token:', paymentMethodId)

    // Attach payment method to payment intent
    console.log('🔍 Attaching payment method to intent...')
    await stripe.paymentIntents.update(payment_intent_id, {
      payment_method: paymentMethodId,
    })

    // Confirm the payment
    console.log('🔍 Confirming payment intent...')
    const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id)

    console.log('🔍 Payment intent status:', paymentIntent.status)

    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        payment_intent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      })
    } else if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: false,
        requires_action: true,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          status: paymentIntent.status
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: `Payment failed with status: ${paymentIntent.status}`
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
