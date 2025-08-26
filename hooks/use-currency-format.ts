import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"

export interface CurrencySettings {
  currency_code: string
  currency_symbol: string
  currency_position: 'before' | 'after'
}

export function useCurrencyFormat() {
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>({
    currency_code: 'USD',
    currency_symbol: '$',
    currency_position: 'before'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrencySettings()
  }, [])

  const fetchCurrencySettings = async () => {
    try {
      const restaurant = await getCurrentUserRestaurant()
      if (!restaurant) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('order_settings')
        .select('currency_code, currency_symbol, currency_position')
        .eq('restaurant_id', restaurant.id)
        .single()

      if (error) {
        console.error('Error fetching currency settings:', error)
        // Use defaults if error
        setCurrencySettings({
          currency_code: 'USD',
          currency_symbol: '$',
          currency_position: 'before'
        })
      } else if (data) {
        setCurrencySettings({
          currency_code: data.currency_code || 'USD',
          currency_symbol: data.currency_symbol || '$',
          currency_position: data.currency_position || 'before'
        })
      }
    } catch (error) {
      console.error('Error in fetchCurrencySettings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, decimals: number = 2): string => {
    const formattedAmount = amount.toFixed(decimals)
    
    if (currencySettings.currency_position === 'after') {
      return `${formattedAmount}${currencySettings.currency_symbol}`
    } else {
      return `${currencySettings.currency_symbol}${formattedAmount}`
    }
  }

  const updateCurrencySettings = async (settings: Partial<CurrencySettings>) => {
    try {
      const restaurant = await getCurrentUserRestaurant()
      if (!restaurant) return false

      const { error } = await supabase
        .from('order_settings')
        .update({
          currency_code: settings.currency_code,
          currency_symbol: settings.currency_symbol,
          currency_position: settings.currency_position,
          updated_at: new Date().toISOString()
        })
        .eq('restaurant_id', restaurant.id)

      if (error) {
        console.error('Error updating currency settings:', error)
        return false
      }

      setCurrencySettings(prev => ({ ...prev, ...settings }))
      return true
    } catch (error) {
      console.error('Error in updateCurrencySettings:', error)
      return false
    }
  }

  return {
    currencySettings,
    formatCurrency,
    updateCurrencySettings,
    loading
  }
} 