"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, Clock, Sparkles, Zap, ChevronRight } from "lucide-react"
import { SubscriptionStatus } from "@/hooks/use-subscription"

interface PlanBadgeProps {
  subscriptionStatus: SubscriptionStatus | null
  loading?: boolean
  compact?: boolean
  onClick?: () => void
  clickable?: boolean
}

export function PlanBadge({ subscriptionStatus, loading = false, compact = false, onClick, clickable = false }: PlanBadgeProps) {
  if (loading) {
    return (
      <Badge className="bg-gray-100 text-gray-600 text-xs font-medium animate-pulse">
        <div className="w-3 h-3 bg-gray-300 rounded-full mr-1" />
        Loading...
      </Badge>
    )
  }

  if (!subscriptionStatus) {
    return (
      <Badge className="bg-gray-100 text-gray-600 text-xs font-medium">
        <Sparkles className="h-3 w-3 mr-1" />
        No Plan
      </Badge>
    )
  }

  const getPlanIcon = () => {
    switch (subscriptionStatus.plan_name) {
      case 'Free Trial':
        return <Clock className="h-3 w-3" />
      case 'Starter':
        return <Zap className="h-3 w-3" />
      case 'Pro':
      case 'Multi':
        return <Crown className="h-3 w-3" />
      default:
        return <Sparkles className="h-3 w-3" />
    }
  }

  const getPlanColor = () => {
    switch (subscriptionStatus.plan_name) {
      case 'Free Trial':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Starter':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Pro':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Multi':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusIndicator = () => {
    if (subscriptionStatus.is_trial) {
      return (
        <span className="text-xs opacity-75 ml-1">
          ({subscriptionStatus.days_remaining}d left)
        </span>
      )
    }
    
    if (subscriptionStatus.days_remaining <= 3 && subscriptionStatus.days_remaining > 0) {
      return (
        <span className="text-xs text-orange-600 ml-1">
          (Expires soon)
        </span>
      )
    }
    
    return null
  }

  const badgeContent = (
    <>
      {getPlanIcon()}
      {compact ? subscriptionStatus.plan_name.split(' ')[0] : subscriptionStatus.plan_name}
      {getStatusIndicator()}
      {clickable && <ChevronRight className="h-3 w-3 ml-1" />}
    </>
  )

  if (clickable && onClick) {
    return (
      <button
        onClick={onClick}
        className={`${getPlanColor()} text-xs font-medium flex items-center gap-1.5 w-fit border px-2 py-1 rounded-full cursor-pointer hover:scale-105 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        title="Click to view subscription details"
      >
        {badgeContent}
      </button>
    )
  }

  return (
    <Badge className={`${getPlanColor()} text-xs font-medium flex items-center gap-1.5 w-fit border px-2 py-1`}>
      {badgeContent}
    </Badge>
  )
}
