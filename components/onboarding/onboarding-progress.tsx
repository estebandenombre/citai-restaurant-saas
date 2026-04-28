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
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Trophy className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm">Completed</CardTitle>
              <p className="text-xs text-muted-foreground">You&rsquo;re set up and ready to go</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-foreground" />
            <p className="text-xs text-muted-foreground">
              You now have the full picture of the product
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Play className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm">Onboarding</CardTitle>
              <p className="text-xs text-muted-foreground">Complete these to get started</p>
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
                "flex items-center justify-between rounded-lg p-2 transition-colors",
                task.completed
                  ? "border border-border bg-muted/50"
                  : "border border-border bg-background hover:bg-muted/40"
              )}
            >
              <div className="flex items-center space-x-2">
                {task.completed ? (
                  <CheckCircle className="h-4 w-4 text-foreground" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
              </div>

              {!task.completed && task.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleActionClick(task)}
                  className="h-6 px-2 text-xs"
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