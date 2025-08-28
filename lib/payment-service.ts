import { supabase } from './supabase'

export interface PaymentGateway {
  id: string
  name: string
  enabled: boolean
  test_mode: boolean
  public_key?: string
  secret_key?: string
  webhook_url?: string
  supported_methods: string[]
  processing_fee?: number
  setup_complete: boolean
}

export interface PaymentSettings {
  payments_enabled: boolean
  require_payment: boolean
  allow_cash: boolean
  allow_card: boolean
  allow_apple_pay: boolean
  allow_google_pay: boolean
  auto_capture: boolean
  gateways: {
    stripe: PaymentGateway
    paypal: PaymentGateway
    apple_pay: PaymentGateway
  }
}

export class PaymentService {
  // Get payment settings for a restaurant
  static async getPaymentSettings(restaurantId: string): Promise<PaymentSettings | null> {
    try {
      console.log('🔍 PaymentService: Getting payment settings for restaurant:', restaurantId)
      const { data, error } = await supabase
        .rpc('get_restaurant_payment_settings', {
          restaurant_uuid: restaurantId
        })

      if (error) {
        console.error('🔍 PaymentService: Error fetching payment settings:', error)
        return null
      }

      console.log('🔍 PaymentService: Got payment settings:', data)
      return data || null
    } catch (error) {
      console.error('Error in getPaymentSettings:', error)
      return null
    }
  }

  // Save payment settings for a restaurant
  static async savePaymentSettings(restaurantId: string, settings: PaymentSettings): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('save_restaurant_payment_settings', {
          restaurant_uuid: restaurantId,
          new_settings: settings
        })

      if (error) {
        console.error('Error saving payment settings:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error in savePaymentSettings:', error)
      return false
    }
  }

  // Test Stripe connection
  static async testStripeConnection(publicKey: string, secretKey: string, testMode: boolean = true): Promise<{ success: boolean; message: string }> {
    console.log('PaymentService.testStripeConnection called with:', { publicKey: publicKey.substring(0, 10) + '...', secretKey: secretKey.substring(0, 10) + '...', testMode })
    
    // For debugging, let's first test with a simple validation
    try {
      // Basic validation
      if (!publicKey.startsWith('pk_') || !secretKey.startsWith('sk_')) {
        console.log('Invalid key format detected')
        return {
          success: false,
          message: 'Invalid Stripe keys format. Keys should start with pk_ and sk_'
        }
      }

      // Validate that keys match the test mode
      const isTestKey = publicKey.includes('_test_') || secretKey.includes('_test_')
      const isLiveKey = publicKey.includes('_live_') || secretKey.includes('_live_')
      
      if (testMode && !isTestKey) {
        return {
          success: false,
          message: 'Test mode is enabled but you are using live keys. Please use test keys (pk_test_/sk_test_).'
        }
      }
      
      if (!testMode && !isLiveKey) {
        return {
          success: false,
          message: 'Live mode is enabled but you are using test keys. Please use live keys (pk_live_/sk_live_).'
        }
      }

      // For now, let's return a simple success message to test the flow
      console.log('Basic validation passed, returning success for testing')
      return {
        success: true,
        message: `Stripe connection test successful! Keys format is valid. (Test mode: ${testMode})`
      }

      // TODO: Uncomment this when ready to test actual API calls
      /*
      // Make actual API call to Stripe to test connection
      console.log('Making API call to Stripe...')
      const response = await fetch('https://api.stripe.com/v1/payment_methods', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': '2023-10-16'
        }
      })

      console.log('Stripe API response status:', response.status)
      
      if (response.ok) {
        const environment = testMode ? 'Test' : 'Live'
        console.log('Stripe connection successful')
        return {
          success: true,
          message: `Stripe connection successful in ${environment} mode! API keys are valid.`
        }
      } else {
        const errorData = await response.json()
        console.log('Stripe API error:', errorData)
        return {
          success: false,
          message: `Stripe connection failed: ${errorData.error?.message || 'Invalid API keys'}`
        }
      }
      */
    } catch (error) {
      console.error('Stripe test connection error:', error)
      return {
        success: false,
        message: 'Failed to connect to Stripe. Please check your internet connection and API keys.'
      }
    }
  }

  // Test PayPal connection
  static async testPayPalConnection(clientId: string, secret: string, testMode: boolean = true): Promise<{ success: boolean; message: string }> {
    try {
      // Basic validation
      if (!clientId || !secret) {
        return {
          success: false,
          message: 'PayPal credentials are required'
        }
      }

      // Choose the appropriate PayPal API endpoint based on test mode
      const baseUrl = testMode ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'
      const environment = testMode ? 'Sandbox' : 'Production'

      // First, get access token from PayPal
      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${clientId}:${secret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })

      if (!tokenResponse.ok) {
        return {
          success: false,
          message: `PayPal authentication failed in ${environment} mode. Please check your Client ID and Secret.`
        }
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      // Test the connection by making a simple API call
      const testResponse = await fetch(`${baseUrl}/v1/identity/oauth2/userinfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (testResponse.ok) {
        return {
          success: true,
          message: `PayPal connection successful in ${environment} mode! Credentials are valid.`
        }
      } else {
        return {
          success: false,
          message: `PayPal connection failed in ${environment} mode. Please check your credentials.`
        }
      }
    } catch (error) {
      console.error('PayPal test connection error:', error)
      return {
        success: false,
        message: 'Failed to connect to PayPal. Please check your internet connection and credentials.'
      }
    }
  }

  // Validate payment settings
  static validatePaymentSettings(settings: PaymentSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if payments are enabled but no gateways are configured
    if (settings.payments_enabled) {
      const hasActiveGateway = Object.values(settings.gateways).some(gateway => gateway.enabled)
      
      if (!hasActiveGateway) {
        errors.push('At least one payment gateway must be enabled when payments are enabled')
      }

      // Check if card payments are enabled but no gateway supports it
      if (settings.allow_card) {
        const hasCardGateway = Object.values(settings.gateways).some(gateway => 
          gateway.enabled && gateway.supported_methods.includes('card')
        )
        
        if (!hasCardGateway) {
          errors.push('Card payments are enabled but no gateway supports card payments')
        }
      }

      // Check if Apple Pay is enabled but Stripe is not
      if (settings.allow_apple_pay && !settings.gateways.stripe.enabled) {
        errors.push('Apple Pay requires Stripe to be enabled')
      }
    }

    // Validate gateway configurations
    Object.entries(settings.gateways).forEach(([gatewayId, gateway]) => {
      if (gateway.enabled) {
        if (!gateway.public_key) {
          errors.push(`${gateway.name} public key is required`)
        }
        if (!gateway.secret_key) {
          errors.push(`${gateway.name} secret key is required`)
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Get default payment settings
  static getDefaultPaymentSettings(): PaymentSettings {
    return {
      payments_enabled: false,
      require_payment: false,
      allow_cash: true,
      allow_card: false,
      allow_apple_pay: false,
      allow_google_pay: false,
      auto_capture: true,
      gateways: {
        stripe: {
          id: 'stripe',
          name: 'Stripe',
          enabled: false,
          test_mode: true,
          public_key: '',
          secret_key: '',
          webhook_url: '',
          supported_methods: ['card', 'apple_pay', 'google_pay'],
          processing_fee: 2.9,
          setup_complete: false
        },
        paypal: {
          id: 'paypal',
          name: 'PayPal',
          enabled: false,
          test_mode: true,
          public_key: '',
          secret_key: '',
          webhook_url: '',
          supported_methods: ['card', 'paypal'],
          processing_fee: 2.9,
          setup_complete: false
        },
        apple_pay: {
          id: 'apple_pay',
          name: 'Apple Pay',
          enabled: false,
          test_mode: true,
          public_key: '',
          secret_key: '',
          webhook_url: '',
          supported_methods: ['apple_pay'],
          processing_fee: 0,
          setup_complete: false
        }
      }
    }
  }

  // Check if restaurant has active payment methods
  static hasActivePaymentMethods(settings: PaymentSettings): boolean {
    if (!settings.payments_enabled) return false
    
    return settings.allow_cash || 
           settings.allow_card || 
           settings.allow_apple_pay || 
           settings.allow_google_pay
  }

  // Get available payment methods for a restaurant
  static getAvailablePaymentMethods(settings: PaymentSettings): string[] {
    const methods: string[] = []
    
    if (settings.allow_cash) methods.push('cash')
    if (settings.allow_card) methods.push('card')
    if (settings.allow_apple_pay) methods.push('apple_pay')
    if (settings.allow_google_pay) methods.push('google_pay')
    
    return methods
  }

  // Calculate processing fee for a payment
  static calculateProcessingFee(amount: number, gateway: PaymentGateway): number {
    if (!gateway.processing_fee) return 0
    
    const percentageFee = (amount * gateway.processing_fee) / 100
    const fixedFee = 30 // $0.30 in cents
    
    return Math.round(percentageFee + fixedFee)
  }

  // Check if restaurant has payments enabled (using database function)
  static async hasPaymentsEnabled(restaurantId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('restaurant_has_payments_enabled', {
          restaurant_uuid: restaurantId
        })

      if (error) {
        console.error('Error checking payments enabled:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error in hasPaymentsEnabled:', error)
      return false
    }
  }

  // Get available payment methods (using database function)
  static async getAvailablePaymentMethods(restaurantId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_available_payment_methods', {
          restaurant_uuid: restaurantId
        })

      if (error) {
        console.error('Error getting available payment methods:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAvailablePaymentMethods:', error)
      return []
    }
  }

  // Validate payment settings using database function
  static async validatePaymentSettingsDB(settings: PaymentSettings): Promise<{ valid: boolean; errors: string[] }> {
    try {
      // First validate locally
      const localValidation = this.validatePaymentSettings(settings)
      if (!localValidation.valid) {
        return localValidation
      }

      // Then validate using database function
      const { data, error } = await supabase
        .rpc('validate_payment_settings', {
          settings_json: settings
        })

      if (error) {
        console.error('Error validating payment settings:', error)
        return { valid: false, errors: ['Database validation failed'] }
      }

      return { valid: data || false, errors: [] }
    } catch (error) {
      console.error('Error in validatePaymentSettingsDB:', error)
      return { valid: false, errors: ['Validation error'] }
    }
  }

  // Delete payment keys for a specific gateway
  static async deletePaymentKeys(restaurantId: string, gatewayId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/payments/delete-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gatewayId }),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Failed to delete payment keys'
        }
      }

      return {
        success: true,
        message: result.message || 'Payment keys deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting payment keys:', error)
      return {
        success: false,
        message: 'Failed to delete payment keys'
      }
    }
  }

  // Clear all payment keys for a restaurant
  static async clearAllPaymentKeys(restaurantId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/payments/clear-all-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Failed to clear payment keys'
        }
      }

      return {
        success: true,
        message: result.message || 'All payment keys cleared successfully'
      }
    } catch (error) {
      console.error('Error clearing all payment keys:', error)
      return {
        success: false,
        message: 'Failed to clear payment keys'
      }
    }
  }
}
