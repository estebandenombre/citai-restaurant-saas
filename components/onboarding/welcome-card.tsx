"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <Card className="relative bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
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
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
            <ChefHat className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-purple-900">
              Welcome to {restaurantName}! 🎉
            </CardTitle>
            <p className="text-purple-700 text-sm">
              Your restaurant is set up and ready to use
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">All Inclusive</h3>
            <p className="text-xs text-gray-600">Complete restaurant management</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Easy to Use</h3>
            <p className="text-xs text-gray-600">Intuitive and modern interface</p>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ChefHat className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">Professional</h3>
            <p className="text-xs text-gray-600">Enterprise-level tools</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={onStartTour}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            <Play className="w-4 h-4" />
            <span>Start Tutorial</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleDismiss}
          >
            Explore on my own
          </Button>
        </div>

        <div className="text-center pt-2">
          <Badge variant="secondary" className="text-xs">
            💡 Tip: Complete the tutorial to learn all the features
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 