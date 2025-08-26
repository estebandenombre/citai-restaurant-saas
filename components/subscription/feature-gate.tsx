"use client"

import { ReactNode, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Lock, 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  Download,
  Building2
} from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { SubscriptionService } from '@/lib/subscription-service'

interface FeatureGateProps {
  feature: 'ai_chat' | 'analytics' | 'export' | 'multi_restaurant'
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

const featureConfig = {
  ai_chat: {
    name: 'AI Chat',
    description: 'Get instant help and insights from our AI assistant',
    icon: MessageSquare,
    requiredPlan: 'Starter',
    plans: ['free-trial-plan', 'pro-plan', 'multi-plan']
  },
  analytics: {
    name: 'Analytics',
    description: 'Advanced analytics and reporting features',
    icon: BarChart3,
    requiredPlan: 'Starter',
    plans: ['free-trial-plan', 'pro-plan', 'multi-plan']
  },
  export: {
    name: 'Data Export',
    description: 'Export your data in multiple formats',
    icon: Download,
    requiredPlan: 'Starter',
    plans: ['starter-plan', 'pro-plan', 'multi-plan']
  },
  multi_restaurant: {
    name: 'Multi-Restaurant',
    description: 'Manage multiple restaurants from one account',
    icon: Building2,
    requiredPlan: 'Multi',
    plans: ['multi-plan']
  }
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { subscriptionStatus, loading } = useSubscription()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const config = featureConfig[feature]

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await SubscriptionService.hasFeatureAccess(feature)
        setHasAccess(access)
      } catch (error) {
        console.error(`Error checking ${feature} access:`, error)
        setHasAccess(false)
      }
    }

    if (!loading) {
      checkAccess()
    }
  }, [feature, loading])

  // Show loading state
  if (loading || hasAccess === null) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  // If user has access, show the feature
  if (hasAccess) {
    return <>{children}</>
  }

  // If custom fallback is provided, show it
  if (fallback) {
    return <>{fallback}</>
  }

  // If upgrade prompt is disabled, show nothing
  if (!showUpgradePrompt) {
    return null
  }

  // Show upgrade prompt
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 bg-gray-100 rounded-full">
            <config.icon className="h-6 w-6 text-gray-500" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-gray-500" />
          {config.name} Locked
        </CardTitle>
        <CardDescription>
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            Available in {config.requiredPlan} Plan
          </span>
        </div>

        {subscriptionStatus && (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">
              Current: {subscriptionStatus.plan_name}
            </Badge>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade to {config.requiredPlan}
          </Button>
          <p className="text-xs text-muted-foreground">
            Unlock this feature and many more with our premium plans
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Convenience components for specific features
export function AIChatGate({ children, fallback, showUpgradePrompt }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="ai_chat" fallback={fallback} showUpgradePrompt={showUpgradePrompt}>
      {children}
    </FeatureGate>
  )
}

export function AnalyticsGate({ children, fallback, showUpgradePrompt }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="analytics" fallback={fallback} showUpgradePrompt={showUpgradePrompt}>
      {children}
    </FeatureGate>
  )
}

export function ExportGate({ children, fallback, showUpgradePrompt }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="export" fallback={fallback} showUpgradePrompt={showUpgradePrompt}>
      {children}
    </FeatureGate>
  )
}

export function MultiRestaurantGate({ children, fallback, showUpgradePrompt }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="multi_restaurant" fallback={fallback} showUpgradePrompt={showUpgradePrompt}>
      {children}
    </FeatureGate>
  )
}
