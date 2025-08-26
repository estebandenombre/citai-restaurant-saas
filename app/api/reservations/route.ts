import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

// GET /api/reservations - Get reservations for the authenticated restaurant
export async function GET(request: NextRequest) {
  try {
    const { restaurantId } = await getCurrentUserRestaurant()
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true })

    if (error) {
      console.error('Error fetching reservations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reservations' },
        { status: 500 }
      )
    }

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Error in GET /api/reservations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/reservations - Create a new reservation (no authentication required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      restaurantId, 
      customerName, 
      customerEmail, 
      customerPhone, 
      partySize, 
      reservationDate, 
      reservationTime, 
      specialRequests, 
      tablePreference 
    } = body

    // Validate required fields
    if (!restaurantId || !customerName || !customerPhone || !partySize || !reservationDate || !reservationTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate party size
    if (partySize <= 0) {
      return NextResponse.json(
        { error: 'Party size must be greater than 0' },
        { status: 400 }
      )
    }

    // Validate date is not in the past
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`)
    if (reservationDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Reservation date and time cannot be in the past' },
        { status: 400 }
      )
    }

    // Check if restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Create reservation using regular client (RLS policies should allow this)
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        restaurant_id: restaurantId,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone,
        party_size: partySize,
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        special_requests: specialRequests || null,
        table_preference: tablePreference === "any" ? null : tablePreference,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reservation:', error)
      return NextResponse.json(
        { error: 'Failed to create reservation' },
        { status: 500 }
      )
    }

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/reservations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 