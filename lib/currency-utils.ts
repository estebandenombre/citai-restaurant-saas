// Currency configuration and formatting utilities
// This service handles restaurant-specific currency display

export interface CurrencyConfig {
  currency: string
  position: 'before' | 'after'
}

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    case 'GBP':
      return '£'
    case 'JPY':
      return '¥'
    case 'CAD':
      return 'C$'
    case 'AUD':
      return 'A$'
    case 'CHF':
      return 'CHF '
    case 'CNY':
      return '¥'
    case 'MXN':
      return '$'
    case 'BRL':
      return 'R$ '
    default:
      return '$'
  }
}

export function formatCurrency(amount: number, currency: string, position: 'before' | 'after' = 'before'): string {
  const symbol = getCurrencySymbol(currency)
  const formattedAmount = amount.toFixed(2)
  
  if (position === 'after') {
    return `${formattedAmount}${symbol}`
  } else {
    return `${symbol}${formattedAmount}`
  }
}

export function formatCurrencyWithConfig(amount: number, currencyConfig: any): string {
  if (!currencyConfig) {
    return formatCurrency(amount, 'USD', 'before')
  }
  
  const currency = currencyConfig.currency || 'USD'
  const position = currencyConfig.position || 'before'
  
  return formatCurrency(amount, currency, position)
}

export function getDefaultCurrencyConfig(): CurrencyConfig {
  return {
    currency: 'USD',
    position: 'before'
  }
} 