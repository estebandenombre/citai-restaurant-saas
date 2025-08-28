import { supabase } from './supabase'

export interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string
  price: number
  billing_cycle: 'trial' | 'monthly' | 'yearly'
  trial_days: number
  features: {
    menu_management: boolean
    order_management: boolean
    analytics: boolean
    export: boolean
    ai_chat: boolean
    multi_restaurant: boolean
  }
  max_restaurants: number
  max_users: number
  max_orders_per_month: number
  ai_chat_enabled: boolean
  analytics_enabled: boolean
  export_enabled: boolean
  priority_support: boolean
  is_active: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'trial' | 'trial_expired' | 'active' | 'cancelled' | 'expired' | 'past_due'
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancelled_at?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  metadata: any
  plan?: SubscriptionPlan
}

export class SubscriptionService {
  // Get all available subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Since subscription_plans table doesn't exist, return hardcoded plans
    const plans: SubscriptionPlan[] = [
      {
        id: 'free-trial-plan',
        name: 'free-trial-plan',
        display_name: 'Free Trial',
        description: 'Start selling today - 14-day free trial',
        price: 0.00,
        billing_cycle: 'trial',
        trial_days: 14,
        features: {
          ai_chat: false,
          multi_restaurant: false,
          analytics: false,
          menu_management: true,
          order_management: true,
          export: false
        },
        max_restaurants: 1,
        max_users: 1,
        max_orders_per_month: 50,
        ai_chat_enabled: false,
        analytics_enabled: false,
        export_enabled: false,
        priority_support: false,
        is_active: true
      },
      {
        id: 'starter-plan',
        name: 'starter-plan',
        display_name: 'Starter',
        description: 'Essential tools to sell without chaos',
        price: 29.00,
        billing_cycle: 'monthly',
        trial_days: 0,
        features: {
          ai_chat: false,
          multi_restaurant: false,
          analytics: false,
          menu_management: true,
          order_management: true,
          export: false
        },
        max_restaurants: 1,
        max_users: 1,
        max_orders_per_month: 500,
        ai_chat_enabled: false,
        analytics_enabled: false,
        export_enabled: false,
        priority_support: false,
        is_active: true
      },
      {
        id: 'growth-plan',
        name: 'growth-plan',
        display_name: 'Growth',
        description: 'Grow with intelligence - AI-powered insights',
        price: 69.00,
        billing_cycle: 'monthly',
        trial_days: 0,
        features: {
          ai_chat: true,
          multi_restaurant: false,
          analytics: true,
          menu_management: true,
          order_management: true,
          export: true
        },
        max_restaurants: 2,
        max_users: 3,
        max_orders_per_month: 2000,
        ai_chat_enabled: true,
        analytics_enabled: true,
        export_enabled: true,
        priority_support: true,
        is_active: true
      },
      {
        id: 'multi-plan',
        name: 'multi-plan',
        display_name: 'Multi',
        description: 'Total control of multiple locations',
        price: 149.00,
        billing_cycle: 'monthly',
        trial_days: 0,
        features: {
          ai_chat: true,
          multi_restaurant: true,
          analytics: true,
          menu_management: true,
          order_management: true,
          export: true
        },
        max_restaurants: 5,
        max_users: 10,
        max_orders_per_month: 10000,
        ai_chat_enabled: true,
        analytics_enabled: true,
        export_enabled: true,
        priority_support: true,
        is_active: true
      }
    ]

    return plans
  }

  // Get current user's subscription (simplified - all users are on free trial)
  static async getCurrentUserSubscription(): Promise<UserSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('No authenticated user found')
        return null
      }

      console.log('Fetching subscription for user:', user.email)

      // Get user from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          created_at
        `)
        .eq('email', user.email)
        .single()

      if (userError || !userData) {
        console.error('Error fetching user from public.users:', userError)
        return null
      }

      console.log('Found user in public.users:', userData.id)

      // All users are on free trial - calculate trial status based on created_at
      const trialDays = 14
      const trialStart = new Date(userData.created_at)
      const trialEnd = new Date(trialStart.getTime() + (trialDays * 24 * 60 * 60 * 1000))
      const now = new Date()
      
      const isTrialExpired = now > trialEnd
      const status: 'trial' | 'trial_expired' = isTrialExpired ? 'trial_expired' : 'trial'
      const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))

      // Create subscription object based on trial status
      const subscription: UserSubscription = {
        id: userData.id,
        user_id: userData.id,
        plan_id: 'free-trial-plan',
        status,
        current_period_start: trialStart.toISOString(),
        current_period_end: trialEnd.toISOString(),
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        metadata: {
          trial_days_remaining: daysRemaining
        },
        plan: {
          id: 'free-trial-plan',
          name: 'free-trial-plan',
          display_name: 'Free Trial',
          description: '14-day free trial with all features except AI chat',
          price: 0.00,
          billing_cycle: 'trial',
          trial_days: 14,
          features: {
            ai_chat: false,
            multi_restaurant: false,
            analytics: true,
            menu_management: true,
            order_management: true,
            export: true
          },
          max_restaurants: 1,
          max_users: 1,
          max_orders_per_month: 100,
          ai_chat_enabled: false,
          analytics_enabled: true,
          export_enabled: true,
          priority_support: false,
          is_active: true
        }
      }

      console.log('Constructed subscription:', subscription.status, subscription.plan?.display_name)
      return subscription
    } catch (error) {
      console.error('Error in getCurrentUserSubscription:', error)
      return null
    }
  }

  // Note: All users are automatically on free trial based on created_at
  // No need to create subscriptions manually

  // Simplified feature access - all users have full access during trial
  static async hasFeatureAccess(feature: keyof SubscriptionPlan['features']): Promise<boolean> {
    const subscription = await this.getCurrentUserSubscription()
    
    if (!subscription) {
      return false
    }

    // If trial has expired, restrict access
    if (subscription.status === 'trial_expired') {
      return false
    }

    // During trial, all users have access to all features
    return true
  }

  // Check if user can access AI Chat
  static async canAccessAIChat(): Promise<boolean> {
    return this.hasFeatureAccess('ai_chat')
  }

  // Check if user can access analytics
  static async canAccessAnalytics(): Promise<boolean> {
    return this.hasFeatureAccess('analytics')
  }

  // Check if user can export data
  static async canExportData(): Promise<boolean> {
    return this.hasFeatureAccess('export')
  }

  // Check if user can manage multiple restaurants
  static async canManageMultipleRestaurants(): Promise<boolean> {
    return this.hasFeatureAccess('multi_restaurant')
  }

  // Get user's current plan limits
  static async getPlanLimits(): Promise<{
    max_restaurants: number
    max_users: number
    max_orders_per_month: number
  } | null> {
    const subscription = await this.getCurrentUserSubscription()
    
    if (!subscription?.plan) {
      return null
    }

    return {
      max_restaurants: subscription.plan.max_restaurants,
      max_users: subscription.plan.max_users,
      max_orders_per_month: subscription.plan.max_orders_per_month
    }
  }

  // Check if user can create more restaurants
  static async canCreateRestaurant(): Promise<boolean> {
    const limits = await this.getPlanLimits()
    if (!limits) return false

    // Count current restaurants for this user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Get user from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, restaurant_id')
      .eq('email', user.email)
      .single()

    if (userError || !userData) return false

    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', userData.restaurant_id)

    return true // For now, allow one restaurant per user
  }

  // Note: Subscription management is now handled manually via Supabase
  // Users are automatically on free trial based on created_at

  // Get subscription status for display
  static async getSubscriptionStatus(): Promise<{
    plan_name: string
    status: string
    expires_at: string
    is_trial: boolean
    days_remaining: number
  } | null> {
    const subscription = await this.getCurrentUserSubscription()
    
    if (!subscription) {
      return null
    }

    const now = new Date()
    const expiresAt = new Date(subscription.current_period_end)
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      plan_name: subscription.plan?.display_name || 'Unknown',
      status: subscription.status,
      expires_at: subscription.current_period_end,
      is_trial: subscription.status === 'trial',
      days_remaining: Math.max(0, daysRemaining)
    }
  }
}
