import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface CurrencyConfig {
  currency: string
  position: 'before' | 'after'
}

export function useRestaurantCurrency(restaurantId?: string) {
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) {
      setCurrencyConfig(null)
      setLoading(false)
      return
    }

    const fetchCurrencyConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('currency_config')
          .eq('id', restaurantId)
          .single()

        if (error) {
          console.error('Error fetching currency config:', error)
          setCurrencyConfig({ currency: 'USD', position: 'before' })
        } else {
          setCurrencyConfig(data.currency_config || { currency: 'USD', position: 'before' })
        }
      } catch (error) {
        console.error('Error fetching currency config:', error)
        setCurrencyConfig({ currency: 'USD', position: 'before' })
      } finally {
        setLoading(false)
      }
    }

    fetchCurrencyConfig()
  }, [restaurantId])

  return { currencyConfig, loading }
}



