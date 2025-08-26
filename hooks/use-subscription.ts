import { useState, useEffect } from 'react'
import { SubscriptionService, SubscriptionPlan, UserSubscription } from '@/lib/subscription-service'

export interface SubscriptionStatus {
  plan_name: string
  status: string
  expires_at: string
  is_trial: boolean
  is_trial_expired: boolean
  days_remaining: number
}

export interface PlanLimits {
  max_restaurants: number
  max_users: number
  max_orders_per_month: number
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load subscription data
  const loadSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading subscription data...')

      const [currentSubscription, status, limits] = await Promise.all([
        SubscriptionService.getCurrentUserSubscription(),
        SubscriptionService.getSubscriptionStatus(),
        SubscriptionService.getPlanLimits()
      ])

      console.log('Subscription data loaded:', {
        subscription: currentSubscription?.status,
        status: status?.plan_name,
        limits: limits
      })

      setSubscription(currentSubscription)
      setSubscriptionStatus(status)
      setPlanLimits(limits)
    } catch (err) {
      console.error('Error loading subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
      // Set default values on error
      setSubscription(null)
      setSubscriptionStatus(null)
      setPlanLimits(null)
    } finally {
      setLoading(false)
    }
  }

  // Check feature access
  const hasFeatureAccess = async (feature: keyof SubscriptionPlan['features']): Promise<boolean> => {
    try {
      return await SubscriptionService.hasFeatureAccess(feature)
    } catch (err) {
      console.error(`Error checking ${feature} access:`, err)
      return false
    }
  }

  // Check specific feature access
  const canAccessAIChat = async (): Promise<boolean> => {
    return SubscriptionService.canAccessAIChat()
  }

  const canAccessAnalytics = async (): Promise<boolean> => {
    return SubscriptionService.canAccessAnalytics()
  }

  const canExportData = async (): Promise<boolean> => {
    return SubscriptionService.canExportData()
  }

  const canManageMultipleRestaurants = async (): Promise<boolean> => {
    return SubscriptionService.canManageMultipleRestaurants()
  }

  // Upgrade subscription
  const upgradeSubscription = async (planId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const newSubscription = await SubscriptionService.upgradeSubscription(planId)
      setSubscription(newSubscription)
      
      // Reload subscription data
      await loadSubscription()
    } catch (err) {
      console.error('Error upgrading subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to upgrade subscription')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cancel subscription
  const cancelSubscription = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      await SubscriptionService.cancelCurrentSubscription()
      
      // Reload subscription data
      await loadSubscription()
    } catch (err) {
      console.error('Error cancelling subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Load subscription on mount
  useEffect(() => {
    loadSubscription()
  }, [])

  // Check if trial has expired
  const isTrialExpired = subscription?.status === 'trial_expired'

  return {
    subscription,
    subscriptionStatus,
    planLimits,
    loading,
    error,
    isTrialExpired,
    loadSubscription,
    hasFeatureAccess,
    canAccessAIChat,
    canAccessAnalytics,
    canExportData,
    canManageMultipleRestaurants,
    upgradeSubscription,
    cancelSubscription
  }
}
