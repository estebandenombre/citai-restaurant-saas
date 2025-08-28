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

    // Check if PayPal is enabled and configured
    if (!settings.gateways.paypal.enabled || !settings.gateways.paypal.setup_complete) {
      return NextResponse.json({ 
        error: 'PayPal is not configured for this restaurant' 
      }, { status: 400 })
    }

    // Validate payment amount
    if (amount <= 0) {
      return NextResponse.json({ 
        error: 'Payment amount must be greater than 0' 
      }, { status: 400 })
    }

    // Get PayPal access token
    const baseUrl = settings.gateways.paypal.test_mode ? 
      'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.gateways.paypal.public_key}:${settings.gateways.paypal.secret_key}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to authenticate with PayPal' 
      }, { status: 401 })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          },
          custom_id: metadata?.order_id || `order_${Date.now()}`,
          description: metadata?.description || 'Restaurant order payment'
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`
        }
      })
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      console.error('PayPal order creation error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to create PayPal order',
        details: errorData.error_description || errorData.message 
      }, { status: 400 })
    }

    const orderData = await orderResponse.json()

    return NextResponse.json({
      success: true,
      order_id: orderData.id,
      approval_url: orderData.links.find((link: any) => link.rel === 'approve')?.href,
      status: orderData.status
    })

  } catch (error: any) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json({ 
      error: 'Failed to create PayPal order',
      details: error.message 
    }, { status: 500 })
  }
}

