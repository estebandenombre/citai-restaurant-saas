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
          <Card className="w-80 shadow-lg border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">{title}</h3>
                    <Badge variant="secondary" className="text-xs">Nuevo</Badge>
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
              
              <p className="text-sm text-purple-700 mb-4 leading-relaxed">
                {description}
              </p>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGotIt}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Entendido
                </Button>
                
                <div className="flex items-center space-x-1 text-xs text-purple-600">
                  <span>No mostrar de nuevo</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Arrow */}
          <div className={cn(
            "absolute w-0 h-0 border-4 border-transparent",
            position === "top" && "top-full left-1/2 transform -translate-x-1/2 border-t-purple-200",
            position === "bottom" && "bottom-full left-1/2 transform -translate-x-1/2 border-b-purple-200",
            position === "left" && "left-full top-1/2 transform -translate-y-1/2 border-l-purple-200",
            position === "right" && "right-full top-1/2 transform -translate-y-1/2 border-r-purple-200"
          )} />
        </div>
      )}
    </div>
  )
} 