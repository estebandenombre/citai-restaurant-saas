// Currency configuration and formatting utilities
// This service handles restaurant-specific currency display

export interface CurrencyConfig {
  currency: string
  position: 'before' | 'after'
}

// Predefined currency configurations with symbols and formatting
export const CURRENCY_CONFIGS = {
  USD: { symbol: '$', name: 'US Dollar', example: '$1,234.56' },
  EUR: { symbol: '€', name: 'Euro', example: '1.234,56€' },
  GBP: { symbol: '£', name: 'British Pound', example: '£1,234.56' },
  JPY: { symbol: '¥', name: 'Japanese Yen', example: '¥1,234' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', example: 'C$1,234.56' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', example: 'A$1,234.56' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', example: 'CHF 1,234.56' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', example: '¥1,234.56' },
  MXN: { symbol: '$', name: 'Mexican Peso', example: '$1,234.56' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', example: 'R$ 1.234,56' }
}

/**
 * Format a price according to restaurant's currency configuration
 * @param amount - The amount to format
 * @param currencyConfig - Restaurant's currency configuration
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currencyConfig: CurrencyConfig): string {
  if (!currencyConfig || !currencyConfig.currency) {
    // Fallback to USD if no configuration
    return `$${amount.toFixed(2)}`
  }

  const currency = currencyConfig.currency
  const position = currencyConfig.position
  const config = CURRENCY_CONFIGS[currency as keyof typeof CURRENCY_CONFIGS]

  if (!config) {
    // Fallback to USD if currency not found
    return `$${amount.toFixed(2)}`
  }

  // Format the number with appropriate decimal places
  let formattedAmount: string
  if (currency === 'JPY') {
    // Japanese Yen typically doesn't use decimal places
    formattedAmount = Math.round(amount).toLocaleString()
  } else {
    formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Apply currency symbol based on position
  if (position === 'after') {
    return `${formattedAmount}${config.symbol}`
  } else {
    return `${config.symbol}${formattedAmount}`
  }
}

/**
 * Format a price range (min - max)
 * @param minAmount - Minimum amount
 * @param maxAmount - Maximum amount
 * @param currencyConfig - Restaurant's currency configuration
 * @returns Formatted price range string
 */
export function formatPriceRange(minAmount: number, maxAmount: number, currencyConfig: CurrencyConfig): string {
  const minFormatted = formatPrice(minAmount, currencyConfig)
  const maxFormatted = formatPrice(maxAmount, currencyConfig)
  return `${minFormatted} - ${maxFormatted}`
}

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - Currency code (e.g., 'USD', 'EUR')
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const config = CURRENCY_CONFIGS[currencyCode as keyof typeof CURRENCY_CONFIGS]
  return config ? config.symbol : '$'
}

/**
 * Get currency name for a given currency code
 * @param currencyCode - Currency code (e.g., 'USD', 'EUR')
 * @returns Currency name
 */
export function getCurrencyName(currencyCode: string): string {
  const config = CURRENCY_CONFIGS[currencyCode as keyof typeof CURRENCY_CONFIGS]
  return config ? config.name : 'US Dollar'
}

/**
 * Parse a formatted price back to number
 * @param formattedPrice - Formatted price string
 * @param currencyConfig - Restaurant's currency configuration
 * @returns Numeric amount
 */
export function parsePrice(formattedPrice: string, currencyConfig: CurrencyConfig): number {
  if (!formattedPrice) return 0

  const config = CURRENCY_CONFIGS[currencyConfig.currency as keyof typeof CURRENCY_CONFIGS]
  if (!config) return 0

  // Remove currency symbol and commas, then parse
  let cleanPrice = formattedPrice.replace(config.symbol, '').replace(/,/g, '')
  
  // Handle different decimal separators based on currency
  if (currencyConfig.currency === 'EUR' || currencyConfig.currency === 'BRL') {
    // European format: 1.234,56 -> 1234.56
    cleanPrice = cleanPrice.replace('.', '').replace(',', '.')
  } else {
    // Standard format: 1,234.56 -> 1234.56
    cleanPrice = cleanPrice.replace(',', '')
  }

  return parseFloat(cleanPrice) || 0
}

/**
 * Calculate total with tax
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as percentage
 * @param currencyConfig - Restaurant's currency configuration
 * @returns Object with subtotal, tax amount, and total
 */
export function calculateTotalWithTax(
  subtotal: number, 
  taxRate: number, 
  currencyConfig: CurrencyConfig
): { subtotal: string; taxAmount: string; total: string } {
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  return {
    subtotal: formatPrice(subtotal, currencyConfig),
    taxAmount: formatPrice(taxAmount, currencyConfig),
    total: formatPrice(total, currencyConfig)
  }
} 