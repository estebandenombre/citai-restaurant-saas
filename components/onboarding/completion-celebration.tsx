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
import { cn } from "@/lib/utils"

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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        <Card className="relative bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-2xl">
          {/* Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-2 h-2 rounded-full animate-bounce",
                    i % 4 === 0 && "bg-yellow-400",
                    i % 4 === 1 && "bg-pink-400",
                    i % 4 === 2 && "bg-blue-400",
                    i % 4 === 3 && "bg-green-400"
                  )}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-2xl text-green-900 mb-2">
              ¡Felicidades! 🎉
            </CardTitle>
            
            <p className="text-green-700">
              Has completado la configuración de {restaurantName}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">¡Todo Listo!</h3>
              </div>
              
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Tu restaurante está completamente configurado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Ya conoces todas las funcionalidades</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Estás listo para gestionar tu negocio</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <PartyPopper className="w-3 h-3 mr-1" />
                ¡Bienvenido a Tably!
              </Badge>
              
              <p className="text-sm text-green-600">
                Tu plataforma de gestión está lista para ayudarte a hacer crecer tu restaurante
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button 
                onClick={onClose}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ¡Empezar!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 