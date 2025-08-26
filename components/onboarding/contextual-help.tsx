"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  X, 
  BookOpen,
  Lightbulb,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface HelpTip {
  id: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface ContextualHelpProps {
  pageId: string
  tips: HelpTip[]
  onDismiss?: () => void
}

const helpTipsByPage: Record<string, HelpTip[]> = {
  "orders": [
    {
      id: "order-status",
      title: "Estados de Pedidos",
      description: "Los pedidos pasan por diferentes estados: Pendiente → Confirmado → Preparando → Listo → Servido",
      action: {
        label: "Ver Estados",
        onClick: () => {}
      }
    },
    {
      id: "order-management",
      title: "Gestión Eficiente",
      description: "Usa los filtros para organizar pedidos por estado, tipo y hora. Los pedidos nuevos aparecen automáticamente.",
      action: {
        label: "Aplicar Filtros",
        onClick: () => {}
      }
    }
  ],
  "menu": [
    {
      id: "menu-creation",
      title: "Crear Menú",
      description: "Añade fotos atractivas, descripciones detalladas y precios claros. Los clientes verán exactamente lo que ofreces.",
      action: {
        label: "Añadir Plato",
        onClick: () => {}
      }
    },
    {
      id: "menu-categories",
      title: "Organizar por Categorías",
      description: "Crea categorías como 'Entrantes', 'Principales', 'Postres' para una mejor organización.",
      action: {
        label: "Crear Categoría",
        onClick: () => {}
      }
    }
  ],
  "reservations": [
    {
      id: "reservation-management",
      title: "Gestionar Reservas",
      description: "Organiza las reservas por fecha y hora. Puedes confirmar, cancelar o modificar fácilmente.",
      action: {
        label: "Ver Calendario",
        onClick: () => {}
      }
    },
    {
      id: "table-management",
      title: "Gestión de Mesas",
      description: "Asigna mesas específicas a cada reserva para optimizar la ocupación de tu restaurante.",
      action: {
        label: "Asignar Mesa",
        onClick: () => {}
      }
    }
  ],
  "inventory": [
    {
      id: "stock-tracking",
      title: "Control de Stock",
      description: "Lleva un registro preciso de tus ingredientes. Recibe alertas cuando el stock esté bajo.",
      action: {
        label: "Añadir Producto",
        onClick: () => {}
      }
    },
    {
      id: "low-stock-alerts",
      title: "Alertas de Stock Bajo",
      description: "Configura niveles mínimos para recibir notificaciones automáticas cuando necesites reabastecer.",
      action: {
        label: "Configurar Alertas",
        onClick: () => {}
      }
    }
  ],
  "analytics": [
    {
      id: "revenue-tracking",
      title: "Seguimiento de Ingresos",
      description: "Analiza tus ventas diarias, semanales y mensuales. Identifica tus productos más vendidos.",
      action: {
        label: "Ver Reportes",
        onClick: () => {}
      }
    },
    {
      id: "performance-metrics",
      title: "Métricas de Rendimiento",
      description: "Monitorea el tiempo promedio de preparación, satisfacción del cliente y eficiencia operativa.",
      action: {
        label: "Ver Métricas",
        onClick: () => {}
      }
    }
  ]
}

export default function ContextualHelp({ pageId, tips, onDismiss }: ContextualHelpProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)

  const pageTips = helpTipsByPage[pageId] || tips
  const currentTip = pageTips[currentTipIndex]

  useEffect(() => {
    // Check if help has been dismissed for this page
    const dismissed = localStorage.getItem(`help_dismissed_${pageId}`)
    if (!dismissed) {
      // Show help after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [pageId])

  const handleDismiss = () => {
    setIsVisible(false)
    setHasBeenDismissed(true)
    localStorage.setItem(`help_dismissed_${pageId}`, "true")
    onDismiss?.()
  }

  const nextTip = () => {
    if (currentTipIndex < pageTips.length - 1) {
      setCurrentTipIndex(prev => prev + 1)
    } else {
      handleDismiss()
    }
  }

  const prevTip = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(prev => prev - 1)
    }
  }

  if (hasBeenDismissed || !currentTip) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-sm text-purple-900">{currentTip.title}</CardTitle>
                <Badge variant="secondary" className="text-xs">Consejo</Badge>
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
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-purple-700 leading-relaxed">
            {currentTip.description}
          </p>
          
          {currentTip.action && (
            <Button
              onClick={currentTip.action.onClick}
              className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
              variant="outline"
              size="sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {currentTip.action.label}
            </Button>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {pageTips.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentTipIndex
                      ? "bg-purple-600"
                      : "bg-gray-300"
                  )}
                />
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              {currentTipIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevTip}
                  className="h-6 w-6 p-0"
                >
                  ←
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextTip}
                className="h-6 w-6 p-0"
              >
                {currentTipIndex < pageTips.length - 1 ? "→" : "✓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 