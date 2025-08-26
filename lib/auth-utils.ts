import { supabase } from "./supabase"

export async function getCurrentUserRestaurant() {
  try {
    // First, try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Session error:", sessionError)
      throw new Error("Session error: " + sessionError.message)
    }

    // If no session, try to refresh
    if (!session) {
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error("Refresh error:", refreshError)
        throw new Error("Authentication required")
      }
      
      if (!refreshedSession) {
        throw new Error("No authenticated user")
      }
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("No authenticated user")
    }

    // Get the user's restaurant from our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`
        restaurant_id,
        restaurants (*)
      `)
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      throw new Error("User not found in database")
    }

    if (!userData.restaurant_id || !userData.restaurants) {
      throw new Error("User has no associated restaurant")
    }

    return {
      user,
      restaurant: userData.restaurants,
      restaurantId: userData.restaurant_id,
    }
  } catch (error) {
    console.error("Error getting user restaurant:", error)
    throw error
  }
}

export async function requireAuth() {
  try {
    // First, try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Session error:", sessionError)
      throw new Error("Session error: " + sessionError.message)
    }

    // If no session, try to refresh
    if (!session) {
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error("Refresh error:", refreshError)
        throw new Error("Authentication required")
      }
      
      if (!refreshedSession) {
        throw new Error("Authentication required")
      }
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error("Authentication required")
    }

    return user
  } catch (error) {
    console.error("Auth error:", error)
    throw error
  }
}

// Helper function to handle auth state changes
export function setupAuthListener(router: any) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session ? "Session exists" : "No session")
    
    if (event === "SIGNED_OUT" || !session) {
      router.push("/auth/login")
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      // User is authenticated, can stay on current page
      console.log("User authenticated successfully")
    }
  })
}

// Debug utility to check session status
export async function debugSession() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log("Current session:", session)
    console.log("Session error:", sessionError)
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log("Current user:", user)
    console.log("User error:", userError)
    
    return { session, user, sessionError, userError }
  } catch (error) {
    console.error("Debug session error:", error)
    return { error }
  }
}
