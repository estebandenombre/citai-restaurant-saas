import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"

export interface OrderSettings {
  id?: string
  restaurant_id: string
  order_enabled: boolean
  pickup_enabled: boolean
  delivery_enabled: boolean
  table_service_enabled: boolean
  require_name: boolean
  require_phone: boolean
  require_email: boolean
  require_table_number: boolean
  require_pickup_time: boolean
  require_address: boolean
  require_notes: boolean
  pickup_time_slots: string[]
  max_pickup_advance_hours: number
  min_pickup_advance_minutes: number
  auto_confirm_orders: boolean
  allow_special_instructions: boolean
  created_at?: string
  updated_at?: string
}

export function useOrderSettings(restaurantId?: string) {
  const [settings, setSettings] = useState<OrderSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)

        let targetRestaurantId = restaurantId

        // If no restaurantId provided, get current user's restaurant
        if (!targetRestaurantId) {
          const { restaurantId: userRestaurantId } = await getCurrentUserRestaurant()
          targetRestaurantId = userRestaurantId
        }

        if (!targetRestaurantId) {
          throw new Error("No restaurant ID available")
        }

        // Fetch settings for the restaurant
        const { data, error: fetchError } = await supabase
          .from("order_settings")
          .select("*")
          .eq("restaurant_id", targetRestaurantId)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError
        }

        if (data) {
          setSettings(data)
        } else {
          // Create default settings if none exist
          const defaultSettings: OrderSettings = {
            restaurant_id: targetRestaurantId,
            order_enabled: true,
            pickup_enabled: true,
            delivery_enabled: false,
            table_service_enabled: false,
            require_name: true,
            require_phone: true,
            require_email: false,
            require_table_number: false,
            require_pickup_time: false,
            require_address: false,
            require_notes: false,
            pickup_time_slots: [],
            max_pickup_advance_hours: 24,
            min_pickup_advance_minutes: 30,
            auto_confirm_orders: false,
            allow_special_instructions: true,
          }

          const { data: newSettings, error: insertError } = await supabase
            .from("order_settings")
            .insert(defaultSettings)
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          setSettings(newSettings)
        }
      } catch (err: any) {
        console.error("Error fetching order settings:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [restaurantId])

  const updateSettings = async (newSettings: Partial<OrderSettings>) => {
    try {
      setError(null)

      if (!settings?.restaurant_id) {
        throw new Error("No restaurant ID available")
      }

      const { data, error } = await supabase
        .from("order_settings")
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("restaurant_id", settings.restaurant_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setSettings(data)
      return data
    } catch (err: any) {
      console.error("Error updating order settings:", err)
      setError(err.message)
      throw err
    }
  }

  const getRequiredFields = () => {
    if (!settings) return []

    const requiredFields = []
    
    if (settings.require_name) requiredFields.push("name")
    if (settings.require_phone) requiredFields.push("phone")
    if (settings.require_email) requiredFields.push("email")
    if (settings.require_table_number) requiredFields.push("table_number")
    if (settings.require_pickup_time) requiredFields.push("pickup_time")
    if (settings.require_address) requiredFields.push("address")
    if (settings.require_notes) requiredFields.push("notes")

    return requiredFields
  }

  const isFieldRequired = (fieldName: string) => {
    if (!settings) return false

    switch (fieldName) {
      case "name":
        return settings.require_name
      case "phone":
        return settings.require_phone
      case "email":
        return settings.require_email
      case "table_number":
        return settings.require_table_number
      case "pickup_time":
        return settings.require_pickup_time
      case "address":
        return settings.require_address
      case "notes":
        return settings.require_notes
      default:
        return false
    }
  }

  const getOrderTypes = () => {
    if (!settings) return []

    const orderTypes = []
    
    if (settings.pickup_enabled) orderTypes.push("pickup")
    if (settings.delivery_enabled) orderTypes.push("delivery")
    if (settings.table_service_enabled) orderTypes.push("table_service")

    return orderTypes
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    getRequiredFields,
    isFieldRequired,
    getOrderTypes,
  }
} 