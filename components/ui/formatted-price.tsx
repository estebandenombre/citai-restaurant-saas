"use client"

import { useRestaurantCurrency } from "@/hooks/use-restaurant-currency"
import { useI18n } from "@/components/i18n/i18n-provider"

interface FormattedPriceProps {
  amount: number
  restaurantId?: string
  className?: string
}

export function FormattedPrice({ amount, restaurantId, className = "" }: FormattedPriceProps) {
  const { currencyConfig, loading } = useRestaurantCurrency(restaurantId)
  const { intlLocale } = useI18n()

  const formatPrice = (amount: number) => {
    if (loading || !currencyConfig) {
      // Locale-aware default while config loads.
      return new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    const { currency, position } = currencyConfig
    
    // Currency symbols
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      MXN: '$',
      BRL: 'R$'
    }

    const symbol = symbols[currency] || '$'
    
    // Format the number
    let formattedAmount: string
    
    if (currency === "JPY") {
      // JPY usually doesn't use decimals.
      formattedAmount = Math.round(amount).toLocaleString(intlLocale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    } else {
      formattedAmount = amount.toLocaleString(intlLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    
    // Apply symbol position
    if (position === 'after') {
      return `${formattedAmount}${symbol}`
    } else {
      return `${symbol}${formattedAmount}`
    }
  }

  return (
    <span data-slot="price" className={`tabular-nums ${className}`}>
      {formatPrice(amount)}
    </span>
  )
} 