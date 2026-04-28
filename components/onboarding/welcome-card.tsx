"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChefHat, 
  Sparkles, 
  Play, 
  BookOpen,
  X
} from "lucide-react"

interface WelcomeCardProps {
  restaurantName: string
  onStartTour: () => void
  onDismiss: () => void
}

export default function WelcomeCard({ restaurantName, onStartTour, onDismiss }: WelcomeCardProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  if (!isVisible) return null

  return (
    <Card className="relative border-border/90 bg-card shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 h-6 w-6 p-0"
      >
        <X className="w-4 h-4" />
      </Button>
      
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/50">
            <ChefHat className="h-6 w-6 text-foreground/80" strokeWidth={1.5} />
          </div>
          <div>
            <CardTitle className="font-display text-xl text-foreground">
              Welcome, {restaurantName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">You&rsquo;re set up — take a quick tour or explore.</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
              <Sparkles className="h-4 w-4 text-foreground/70" />
            </div>
            <h3 className="text-sm font-medium text-foreground">All-in-one</h3>
            <p className="text-xs text-muted-foreground">Orders, menu, floor</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
              <BookOpen className="h-4 w-4 text-foreground/70" />
            </div>
            <h3 className="text-sm font-medium text-foreground">Clear UI</h3>
            <p className="text-xs text-muted-foreground">Built for busy shifts</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
              <ChefHat className="h-4 w-4 text-foreground/70" />
            </div>
            <h3 className="text-sm font-medium text-foreground">Serious ops</h3>
            <p className="text-xs text-muted-foreground">Inventory &amp; analytics</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button onClick={onStartTour} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start tour
          </Button>

          <Button variant="outline" onClick={handleDismiss}>
            Skip for now
          </Button>
        </div>

        <p className="pt-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Tip: the tour takes under two minutes
        </p>
      </CardContent>
    </Card>
  )
} 