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
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-zinc-950 px-4 py-3.5 text-zinc-50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div className="min-w-0">
            <h3 className="font-medium leading-tight">Trial ended</h3>
            <p className="text-sm text-zinc-400">Choose a plan to keep every feature.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUpgrade}
            className="bg-zinc-100 text-zinc-950 hover:bg-white"
          >
            <Crown className="mr-1.5 h-4 w-4" />
            View plans
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Dismiss
          </Button>
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
    <Card className="border-border/90 bg-card">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
          <AlertTriangle className="h-6 w-6 text-foreground" />
        </div>
        <CardTitle className="font-display text-2xl font-medium tracking-[-0.02em]">Trial period ended</CardTitle>
        <CardDescription>
          Your trial is over. Pick a plan to keep full access to the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-foreground/60" />
            <span>Analytics</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-4 w-4 text-foreground/60" />
            <span>AI assistant</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-foreground/60" />
            <span>Support</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={handleUpgrade} className="w-full">
            <Crown className="mr-2 h-4 w-4" />
            View plans
          </Button>
          <p className="text-xs text-muted-foreground">help@tably.digital</p>
        </div>
      </CardContent>
    </Card>
  )
}
