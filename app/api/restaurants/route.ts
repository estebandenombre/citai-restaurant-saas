import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching restaurants:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch restaurants',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: restaurants || []
    })

  } catch (error: any) {
    console.error('Error in GET /api/restaurants:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

