import { supabase } from './supabase'

export async function getCurrentUserRestaurant() {
  try {
    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Obtener el restaurante asociado al usuario
    const { data: userRestaurant, error: restaurantError } = await supabase
      .from('users')
      .select('restaurant_id')
      .eq('id', user.id)
      .single()

    if (restaurantError) {
      throw new Error('Restaurant not found for user')
    }

    return {
      user,
      restaurant: userRestaurant,
      restaurantId: userRestaurant.restaurant_id
    }
  } catch (error) {
    console.error('Error getting current user restaurant:', error)
    throw error
  }
} 