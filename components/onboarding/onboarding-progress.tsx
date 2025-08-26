"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Circle, 
  Play,
  Trophy,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingTask {
  id: string
  title: string
  description: string
  completed: boolean
  action?: {
    label: string
    href: string
  }
}

interface OnboardingProgressProps {
  onStartTour: () => void
}

export default function OnboardingProgress({ onStartTour }: OnboardingProgressProps) {
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: "tour",
      title: "Complete Tutorial",
      description: "Learn all the features",
      completed: false,
      action: {
        label: "Start",
        href: "#"
      }
    },
    {
      id: "menu",
      title: "Create Menu",
      description: "Add your first dishes",
      completed: false,
      action: {
        label: "Create",
        href: "/dashboard/menu"
      }
    },
    {
      id: "orders",
      title: "Process Order",
      description: "Manage your first order",
      completed: false,
      action: {
        label: "View",
        href: "/dashboard/orders"
      }
    },
    {
      id: "settings",
      title: "Configure Restaurant",
      description: "Customize your information",
      completed: false,
      action: {
        label: "Configure",
        href: "/dashboard/settings"
      }
    }
  ])

  const completedTasks = tasks.filter(task => task.completed).length
  const progress = (completedTasks / tasks.length) * 100

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      )
    )
  }

  const handleActionClick = (task: OnboardingTask) => {
    if (task.id === "tour") {
      onStartTour()
    } else if (task.action?.href) {
      window.location.href = task.action.href
    }
  }

  if (progress === 100) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-sm text-green-900">Completed!</CardTitle>
              <p className="text-xs text-green-700">You now know all the features</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-green-700">
              Congratulations! You are now an expert in Tably
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-sm text-purple-900">Onboarding</CardTitle>
              <p className="text-xs text-purple-700">Complete to get started</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedTasks}/{tasks.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Progress value={progress} className="h-2" />
        
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-colors",
                task.completed 
                  ? "bg-green-100 border border-green-200" 
                  : "bg-white border border-purple-100 hover:bg-purple-50"
              )}
            >
              <div className="flex items-center space-x-2">
                {task.completed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-purple-400" />
                )}
                <div>
                  <p className={cn(
                    "text-xs font-medium",
                    task.completed ? "text-green-800" : "text-purple-900"
                  )}>
                    {task.title}
                  </p>
                  <p className={cn(
                    "text-xs",
                    task.completed ? "text-green-600" : "text-purple-600"
                  )}>
                    {task.description}
                  </p>
                </div>
              </div>
              
              {!task.completed && task.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleActionClick(task)}
                  className="text-xs h-6 px-2 text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  {task.action.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 