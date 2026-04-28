"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  X, 
  Check,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureTooltipProps {
  id: string
  title: string
  description: string
  position?: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
  onDismiss?: () => void
}

export default function FeatureTooltip({ 
  id, 
  title, 
  description, 
  position = "top",
  children,
  onDismiss 
}: FeatureTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)

  useEffect(() => {
    // Check if this tooltip has been dismissed before
    const dismissed = localStorage.getItem(`tooltip_dismissed_${id}`)
    if (!dismissed) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [id])

  const handleDismiss = () => {
    setIsVisible(false)
    setHasBeenDismissed(true)
    localStorage.setItem(`tooltip_dismissed_${id}`, "true")
    onDismiss?.()
  }

  const handleGotIt = () => {
    handleDismiss()
  }

  if (hasBeenDismissed) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {children}
      
      {isVisible && (
        <div className={cn(
          "absolute z-50 transition-all duration-300",
          position === "top" && "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
          position === "bottom" && "top-full left-1/2 transform -translate-x-1/2 mt-2",
          position === "left" && "right-full top-1/2 transform -translate-y-1/2 mr-2",
          position === "right" && "left-full top-1/2 transform -translate-y-1/2 ml-2"
        )}>
          <Card className="w-80 border-border/90 bg-card shadow-lg">
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50">
                    <Lightbulb className="h-4 w-4 text-foreground/80" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{title}</h3>
                    <Badge variant="secondary" className="text-[10px] font-mono uppercase tracking-wider">
                      New
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{description}</p>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={handleGotIt}>
                  <Check className="mr-1 h-4 w-4" />
                  Entendido
                </Button>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>No mostrar de nuevo</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Arrow */}
          <div className={cn(
            "absolute w-0 h-0 border-4 border-transparent",
            position === "top" && "left-1/2 top-full -translate-x-1/2 border-t-border",
            position === "bottom" && "bottom-full left-1/2 -translate-x-1/2 border-b-border",
            position === "left" && "left-full top-1/2 -translate-y-1/2 border-l-border",
            position === "right" && "right-full top-1/2 -translate-y-1/2 border-r-border"
          )} />
        </div>
      )}
    </div>
  )
} 