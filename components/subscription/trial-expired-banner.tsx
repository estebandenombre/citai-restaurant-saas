"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Crown, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TrialExpiredBannerProps {
  onDismiss?: () => void
}

export function TrialExpiredBanner({ onDismiss }: TrialExpiredBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-white" />
            <div>
              <h3 className="font-semibold text-lg">Your Free Trial Has Expired</h3>
              <p className="text-sm opacity-90">
                Upgrade to continue using all features and unlock premium capabilities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgrade}
              className="bg-white text-red-600 hover:bg-gray-100 border-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              View Plans
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/10"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TrialExpiredCard() {
  const router = useRouter()

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-800">Trial Period Expired</CardTitle>
        <CardDescription className="text-red-600">
          Your 14-day free trial has ended. Upgrade to continue using all features.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 justify-center">
            <Zap className="h-4 w-4 text-blue-500" />
            <span>Advanced Analytics</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>AI Chat Assistant</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Clock className="h-4 w-4 text-green-500" />
            <span>Priority Support</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            View Subscription Plans
          </Button>
          <p className="text-xs text-red-600">
            Contact support at support@tably.com for assistance
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
