import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Delete payment keys API called')
    
    // Get current user and restaurant
    const { restaurant } = await getCurrentUserRestaurant()
    
    if (!restaurant?.id) {
      console.log('❌ Restaurant not found')
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    console.log('✅ Restaurant found:', restaurant.id)

    const { gatewayId } = await request.json()

    if (!gatewayId) {
      console.log('❌ Gateway ID is required')
      return NextResponse.json(
        { error: 'Gateway ID is required' },
        { status: 400 }
      )
    }

    console.log('✅ Gateway ID provided:', gatewayId)

    // Get current payment settings
    console.log('🔍 Fetching current payment settings...')
    const { data: currentSettings, error: fetchError } = await supabase
      .from('restaurant_payment_settings')
      .select('settings')
      .eq('restaurant_id', restaurant.id)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching current settings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch current settings' },
        { status: 500 }
      )
    }

    if (!currentSettings) {
      console.log('❌ No payment settings found')
      return NextResponse.json(
        { error: 'No payment settings found' },
        { status: 404 }
      )
    }

    console.log('✅ Current settings fetched successfully')

    // Create updated settings with cleared keys for the specified gateway
    console.log('🔧 Creating updated settings...')
    const updatedSettings = {
      ...currentSettings.settings,
      gateways: {
        ...currentSettings.settings.gateways,
        [gatewayId]: {
          ...currentSettings.settings.gateways[gatewayId],
          public_key: '',
          secret_key: '',
          setup_complete: false,
          enabled: false // Disable the gateway after clearing keys
        }
      }
    }

    console.log('✅ Updated settings created')

    // Save updated settings
    console.log('💾 Saving updated settings to database...')
    const { data: saveResult, error: saveError } = await supabase
      .from('restaurant_payment_settings')
      .update({ 
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurant.id)

    if (saveError) {
      console.error('❌ Error saving updated settings:', saveError)
      return NextResponse.json(
        { error: 'Failed to delete payment keys' },
        { status: 500 }
      )
    }

    console.log('✅ Settings saved successfully')

    return NextResponse.json({
      success: true,
      message: `Payment keys for ${gatewayId} have been deleted successfully`,
      gatewayId
    })

  } catch (error) {
    console.error('Error deleting payment keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
