"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Sparkles,
  Zap,
  Building2,
  Users,
  BarChart3,
  Download,
  MessageSquare
} from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { SubscriptionService } from '@/lib/subscription-service'
import { useToast } from '@/hooks/use-toast'
import { SUBSCRIPTION_PLAN_IDS } from '@/lib/subscription-constants'

export function SubscriptionStatus() {
  const { subscriptionStatus, planLimits, loading, upgradeSubscription } = useSubscription()
  const [upgrading, setUpgrading] = useState(false)
  const { toast } = useToast()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You don't have an active subscription. Please choose a plan to continue.
          </p>
          <Button onClick={() => window.location.href = '/pricing'}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (subscriptionStatus.status) {
      case 'trial':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (subscriptionStatus.status) {
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(true)
      await upgradeSubscription(planId)
      toast({
        title: "Subscription upgraded successfully",
        description: "Your plan has been updated.",
      })
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          {subscriptionStatus.plan_name} Plan
        </CardTitle>
        <CardDescription>
          Your current subscription status and plan details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Status</span>
          </div>
          <Badge className={getStatusColor()}>
            {subscriptionStatus.status.charAt(0).toUpperCase() + subscriptionStatus.status.slice(1)}
          </Badge>
        </div>

        {/* Trial Progress */}
        {subscriptionStatus.is_trial && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Trial Period</span>
              <span>{subscriptionStatus.days_remaining} days remaining</span>
            </div>
            <Progress 
              value={Math.max(0, ((14 - subscriptionStatus.days_remaining) / 14) * 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Your trial expires on {new Date(subscriptionStatus.expires_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Plan Features */}
        {planLimits && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Plan Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span>Restaurants: {planLimits.max_restaurants}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-500" />
                <span>Team Members: {planLimits.max_users}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span>Orders/Month: {planLimits.max_orders_per_month.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                <span>AI Chat: {subscriptionStatus.plan_name === 'Pro' || subscriptionStatus.plan_name === 'Multi' ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Options */}
        {subscriptionStatus.is_trial && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Upgrade Your Plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <Button
                 variant="outline"
                 size="sm"
                 onClick={() => handleUpgrade(SUBSCRIPTION_PLAN_IDS.STARTER)}
                 disabled={upgrading}
                 className="flex flex-col items-center gap-1 h-auto py-3"
               >
                 <span className="font-medium">Starter</span>
                 <span className="text-xs text-muted-foreground">$29.99/month</span>
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => handleUpgrade(SUBSCRIPTION_PLAN_IDS.PRO)}
                 disabled={upgrading}
                 className="flex flex-col items-center gap-1 h-auto py-3"
               >
                 <span className="font-medium">Pro</span>
                 <span className="text-xs text-muted-foreground">$59.99/month</span>
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => handleUpgrade(SUBSCRIPTION_PLAN_IDS.MULTI)}
                 disabled={upgrading}
                 className="flex flex-col items-center gap-1 h-auto py-3"
               >
                 <span className="font-medium">Multi</span>
                 <span className="text-xs text-muted-foreground">$99.99/month</span>
               </Button>
            </div>
          </div>
        )}

        {/* Expiration Warning */}
        {subscriptionStatus.days_remaining <= 3 && subscriptionStatus.days_remaining > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-800">
                Your {subscriptionStatus.is_trial ? 'trial' : 'subscription'} expires soon
              </span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              {subscriptionStatus.days_remaining} day{subscriptionStatus.days_remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
