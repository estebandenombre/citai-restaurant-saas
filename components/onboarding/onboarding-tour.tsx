"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChefHat, 
  ShoppingCart, 
  Calendar, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Check,
  Play,
  Pause,
  X,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  target: string
  position: "top" | "bottom" | "left" | "right"
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Tably! 🎉",
    description: "Your complete platform to manage your restaurant. We'll show you all the tools you have available.",
    icon: ChefHat,
    target: "dashboard-overview",
    position: "bottom"
  },
  {
    id: "orders",
    title: "Order Management",
    description: "Here you can see all orders in real time, change statuses and manage your kitchen efficiently.",
    icon: ShoppingCart,
    target: "orders-section",
    position: "right",
    action: {
      label: "View Orders",
      onClick: () => {}
    }
  },
  {
    id: "reservations",
    title: "Reservations",
    description: "Manage your customers' reservations, organize tables and optimize your restaurant's occupancy.",
    icon: Calendar,
    target: "reservations-section",
    position: "right",
    action: {
      label: "Manage Reservations",
      onClick: () => {}
    }
  },
  {
    id: "menu",
    title: "Your Digital Menu",
    description: "Create and manage your menu with photos, prices and descriptions. Customers can view it online.",
    icon: ChefHat,
    target: "menu-section",
    position: "right",
    action: {
      label: "Edit Menu",
      onClick: () => {}
    }
  },
  {
    id: "inventory",
    title: "Inventory Control",
    description: "Keep precise control of your ingredients and products to avoid waste and optimize costs.",
    icon: Package,
    target: "inventory-section",
    position: "right",
    action: {
      label: "View Inventory",
      onClick: () => {}
    }
  },
  {
    id: "staff",
    title: "Staff Management",
    description: "Organize schedules, roles and responsibilities of your team for more efficient operation.",
    icon: Users,
    target: "staff-section",
    position: "right",
    action: {
      label: "Manage Staff",
      onClick: () => {}
    }
  },
  {
    id: "analytics",
    title: "Analytics and Reports",
    description: "Analyze your restaurant's performance with detailed charts and important metrics.",
    icon: BarChart3,
    target: "analytics-section",
    position: "right",
    action: {
      label: "View Analytics",
      onClick: () => {}
    }
  },
  {
    id: "settings",
    title: "Settings",
    description: "Customize your restaurant, adjust taxes, schedules and specific configurations.",
    icon: Settings,
    target: "settings-section",
    position: "right",
    action: {
      label: "Configure",
      onClick: () => {}
    }
  },
  {
    id: "complete",
    title: "All Ready! 🚀",
    description: "You now know all Tably's features. Start managing your restaurant professionally!",
    icon: Check,
    target: "dashboard-overview",
    position: "bottom"
  }
]

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const router = useRouter()

  const currentTourStep = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1
  const isFirstStep = currentStep === 0

  const nextStep = () => {
    if (!isLastStep) {
      setCompletedSteps(prev => new Set([...prev, currentTourStep.id]))
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipTour = () => {
    onComplete()
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const handleActionClick = (action: any) => {
    // Close the tour first, then navigate
    onComplete()
    
    // Navigate after a short delay to ensure smooth transition
    setTimeout(() => {
      if (action.label === "View Orders") {
        router.push("/dashboard/orders")
      } else if (action.label === "Manage Reservations") {
        router.push("/dashboard/reservations")
      } else if (action.label === "Edit Menu") {
        router.push("/dashboard/menu")
      } else if (action.label === "View Inventory") {
        router.push("/dashboard/inventory")
      } else if (action.label === "Manage Staff") {
        router.push("/dashboard/staff")
      } else if (action.label === "View Analytics") {
        router.push("/dashboard/analytics")
      } else if (action.label === "Configure") {
        router.push("/dashboard/settings")
      }
    }, 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        <Card className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <currentTourStep.icon className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePause}
                  className="h-8 w-8 p-0"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              {currentTourStep.description}
            </p>

            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              {tourSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentStep
                      ? "bg-purple-600"
                      : completedSteps.has(step.id)
                      ? "bg-green-500"
                      : "bg-gray-300"
                  )}
                />
              ))}
            </div>

            {/* Action button */}
            {currentTourStep.action && (
              <Button
                onClick={() => handleActionClick(currentTourStep.action)}
                className="w-full"
                variant="outline"
              >
                {currentTourStep.action.label}
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                >
                  Skip Tutorial
                </Button>
                
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-1"
                >
                  <span>{isLastStep ? "Finish" : "Next"}</span>
                  {!isLastStep && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 