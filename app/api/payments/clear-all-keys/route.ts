import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    // Get current user and restaurant
    const { restaurant } = await getCurrentUserRestaurant()
    
    if (!restaurant?.id) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Get current payment settings
    const { data: currentSettings, error: fetchError } = await supabase
      .from('restaurant_payment_settings')
      .select('settings')
      .eq('restaurant_id', restaurant.id)
      .single()

    if (fetchError) {
      console.error('Error fetching current settings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch current settings' },
        { status: 500 }
      )
    }

    if (!currentSettings) {
      return NextResponse.json(
        { error: 'No payment settings found' },
        { status: 404 }
      )
    }

    // Create completely clean settings
    const updatedSettings = {
      payments_enabled: false,
      require_payment: false,
      allow_cash: true,
      allow_card: false,
      allow_apple_pay: false,
      allow_google_pay: false,
      auto_capture: true,
      gateways: {
        stripe: {
          id: 'stripe',
          name: 'Stripe',
          enabled: false,
          test_mode: true,
          public_key: '',
          secret_key: '',
          webhook_url: '',
          supported_methods: ['card', 'apple_pay', 'google_pay'],
          processing_fee: 2.9,
          setup_complete: false
        },
        paypal: {
          id: 'paypal',
          name: 'PayPal',
          enabled: false,
          test_mode: true,
          public_key: '',
          secret_key: '',
          webhook_url: '',
          supported_methods: ['card', 'paypal'],
          processing_fee: 2.9,
          setup_complete: false
        },
        apple_pay: {
          id: 'apple_pay',
          name: 'Apple Pay',
          enabled: false,
          test_mode: true,
          public_key: '',
          secret_key: '',
          webhook_url: '',
          supported_methods: ['apple_pay'],
          processing_fee: 0,
          setup_complete: false
        }
      }
    }

    // Save updated settings
    const { data: saveResult, error: saveError } = await supabase
      .from('restaurant_payment_settings')
      .update({ 
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurant.id)

    if (saveError) {
      console.error('Error saving updated settings:', saveError)
      return NextResponse.json(
        { error: 'Failed to clear payment keys' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'All payment keys have been cleared successfully',
      restaurantId: restaurant.id
    })

  } catch (error) {
    console.error('Error clearing payment keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
