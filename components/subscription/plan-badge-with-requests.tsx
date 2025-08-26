"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Crown, Clock, Sparkles, Zap, ChevronRight, Bell, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { SubscriptionStatus } from "@/hooks/use-subscription"
import { UpgradeRequestService, UpgradeRequest } from "@/lib/upgrade-request-service"

interface PlanBadgeWithRequestsProps {
  subscriptionStatus: SubscriptionStatus | null
  loading?: boolean
  compact?: boolean
  onClick?: () => void
  clickable?: boolean
}

export function PlanBadgeWithRequests({ 
  subscriptionStatus, 
  loading = false, 
  compact = false, 
  onClick, 
  clickable = false 
}: PlanBadgeWithRequestsProps) {
  const [hasPendingRequests, setHasPendingRequests] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [latestRequest, setLatestRequest] = useState<UpgradeRequest | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)

  useEffect(() => {
    loadUserRequests()
  }, [])

  const loadUserRequests = async () => {
    try {
      setLoadingRequests(true)
      const requests = await UpgradeRequestService.getUserUpgradeRequests()
      const pendingRequests = requests.filter(r => r.status === 'pending')
      const recentRequests = requests.filter(r => {
        const requestDate = new Date(r.created_at)
        const daysAgo = (Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysAgo <= 7 // Show icon for requests from last 7 days
      })
      const latest = requests[0] // Most recent request
      
      setHasPendingRequests(recentRequests.length > 0)
      setPendingCount(pendingRequests.length)
      setLatestRequest(latest || null)
    } catch (error) {
      console.error('Error loading upgrade requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gray-100 text-gray-600 text-xs font-medium animate-pulse">
          <div className="w-3 h-3 bg-gray-300 rounded-full mr-1" />
          Loading...
        </Badge>
      </div>
    )
  }

  if (!subscriptionStatus) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gray-100 text-gray-600 text-xs font-medium">
          <Sparkles className="h-3 w-3 mr-1" />
          No Plan
        </Badge>
      </div>
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

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500 text-xs">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-500 text-xs">Completed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const badgeContent = (
    <>
      {getPlanIcon()}
      {compact ? subscriptionStatus.plan_name.split(' ')[0] : subscriptionStatus.plan_name}
      {getStatusIndicator()}
      {clickable && <ChevronRight className="h-3 w-3 ml-1" />}
    </>
  )

  const handlePlanClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleRequestClick = () => {
    setShowDialog(true)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Plan Badge */}
      {clickable && onClick ? (
        <button
          onClick={handlePlanClick}
          className={`${getPlanColor()} text-xs font-medium flex items-center gap-1.5 w-fit border px-2 py-1 rounded-full cursor-pointer hover:scale-105 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          title="Click to view subscription details"
        >
          {badgeContent}
        </button>
      ) : (
        <Badge className={`${getPlanColor()} text-xs font-medium flex items-center gap-1.5 w-fit border px-2 py-1`}>
          {badgeContent}
        </Badge>
      )}

      {/* Request Notification Icon */}
      {hasPendingRequests && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRequestClick}
          className="h-6 w-6 p-0 relative"
          title="View upgrade request status"
        >
          <Bell className="h-4 w-4 text-orange-500" />
          {pendingCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse flex items-center justify-center">
              <span className="text-xs text-white font-bold">{pendingCount}</span>
            </div>
          )}
        </Button>
      )}

      {/* Request Status Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Upgrade Request Status
            </DialogTitle>
            <DialogDescription>
              Details about your latest upgrade request
            </DialogDescription>
          </DialogHeader>
          
          {latestRequest ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRequestStatusIcon(latestRequest.status)}
                  <span className="font-medium">
                    Upgrade to {latestRequest.requested_plan}
                  </span>
                </div>
                {getRequestStatusBadge(latestRequest.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Plan</p>
                  <p className="font-medium">{latestRequest.current_plan || 'No plan'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Requested Plan</p>
                  <p className="font-medium">{latestRequest.requested_plan}</p>
                </div>
              </div>

              {latestRequest.message && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Your Message</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{latestRequest.message}</p>
                </div>
              )}

              {latestRequest.admin_notes && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Admin Response</p>
                  <p className="text-sm bg-blue-50 p-3 rounded-md border-l-4 border-blue-200">
                    {latestRequest.admin_notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Requested on {formatDate(latestRequest.created_at)}
                {latestRequest.processed_at && (
                  <div>Processed on {formatDate(latestRequest.processed_at)}</div>
                )}
              </div>

              {latestRequest.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    Your request is being reviewed. We'll contact you within 24 hours.
                  </p>
                </div>
              )}

              {latestRequest.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">
                    Your request has been approved! Your plan will be updated shortly.
                  </p>
                </div>
              )}

              {latestRequest.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    Your request has been rejected. Please contact support for more information.
                  </p>
                </div>
              )}

              {latestRequest.status === 'completed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    Your plan has been successfully upgraded!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upgrade requests found.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
