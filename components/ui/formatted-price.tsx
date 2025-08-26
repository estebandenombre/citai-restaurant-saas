"use client"

import { useRestaurantCurrency } from "@/hooks/use-restaurant-currency"

interface FormattedPriceProps {
  amount: number
  restaurantId?: string
  className?: string
}

export function FormattedPrice({ amount, restaurantId, className = "" }: FormattedPriceProps) {
  const { currencyConfig, loading } = useRestaurantCurrency(restaurantId)

  const formatPrice = (amount: number) => {
    if (loading || !currencyConfig) {
      // Default formatting while loading
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
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
    
    if (currency === 'JPY') {
      // JPY doesn't use decimals
      formattedAmount = Math.round(amount).toLocaleString('en-US')
    } else {
      formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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
    <span className={className}>
      {formatPrice(amount)}
    </span>
  )
} 