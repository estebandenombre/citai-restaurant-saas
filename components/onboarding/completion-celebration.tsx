"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Sparkles, 
  CheckCircle,
  Star,
  PartyPopper,
  X
} from "lucide-react"
interface CompletionCelebrationProps {
  isVisible: boolean
  onClose: () => void
  restaurantName: string
}

export default function CompletionCelebration({ 
  isVisible, 
  onClose, 
  restaurantName 
}: CompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      // Hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md">
        <Card className="relative border-border bg-card shadow-2xl">
          {showConfetti && (
            <div className="pointer-events-none absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-foreground/15 animate-bounce"
                  style={{
                    left: `${(i * 7.3) % 100}%`,
                    top: `${(i * 11.7) % 100}%`,
                    animationDelay: `${(i % 4) * 0.2}s`,
                    animationDuration: `${1.2 + (i % 3) * 0.2}s`
                  }}
                />
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 z-10 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          <CardHeader className="pb-4 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-primary-foreground">
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="absolute -right-2 -top-2">
                  <Sparkles className="h-6 w-6 animate-pulse text-foreground" />
                </div>
              </div>
            </div>

            <CardTitle className="mb-2 text-2xl">¡Felicidades!</CardTitle>

            <p className="text-muted-foreground">Has completado la configuración de {restaurantName}</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-foreground" />
                <h3 className="font-semibold">¡Todo listo!</h3>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-foreground" />
                  <span>Tu restaurante está completamente configurado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-foreground" />
                  <span>Ya conoces las funcionalidades clave</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-foreground" />
                  <span>Estás listo para gestionar tu negocio</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <Badge variant="secondary">
                <PartyPopper className="mr-1 h-3 w-3" />
                Bienvenido
              </Badge>

              <p className="text-sm text-muted-foreground">
                Tu plataforma está lista para el día a día
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button onClick={onClose} className="flex-1">
                Empezar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 