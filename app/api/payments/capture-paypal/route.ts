import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurant_id, order_id } = body

    // Validate required fields
    if (!restaurant_id || !order_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: restaurant_id, order_id' 
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

    // Capture PayPal order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json()
      console.error('PayPal capture error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to capture PayPal payment',
        details: errorData.error_description || errorData.message 
      }, { status: 400 })
    }

    const captureData = await captureResponse.json()

    return NextResponse.json({
      success: true,
      capture_id: captureData.id,
      status: captureData.status,
      amount: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      currency: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.currency_code
    })

  } catch (error: any) {
    console.error('Error capturing PayPal payment:', error)
    return NextResponse.json({ 
      error: 'Failed to capture PayPal payment',
      details: error.message 
    }, { status: 500 })
  }
}

