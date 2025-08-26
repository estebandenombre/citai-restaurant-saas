import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

// PATCH /api/reservations/[id] - Update reservation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { restaurantId } = await getCurrentUserRestaurant()
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update reservation (only if it belongs to the authenticated restaurant)
    const { data: reservation, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', params.id)
      .eq('restaurant_id', restaurantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating reservation:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Reservation not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update reservation' },
        { status: 500 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error in PATCH /api/reservations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/reservations/[id] - Delete reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { restaurantId } = await getCurrentUserRestaurant()
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Delete reservation (only if it belongs to the authenticated restaurant)
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', params.id)
      .eq('restaurant_id', restaurantId)

    if (error) {
      console.error('Error deleting reservation:', error)
      return NextResponse.json(
        { error: 'Failed to delete reservation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/reservations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 