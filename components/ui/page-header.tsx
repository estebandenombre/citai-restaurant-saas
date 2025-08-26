import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LucideIcon, Clock, TrendingUp, Users, ChefHat, ShoppingCart } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }
  action?: {
    label: string
    icon?: LucideIcon
    onClick: () => void
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost"
  }
  className?: string
  showStats?: boolean
  stats?: {
    orders?: number
    revenue?: number
    staff?: number
  }
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  badge, 
  action,
  className,
  showStats = false,
  stats
}: PageHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-purple-200/20 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        {/* Main header content */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            {/* Icon container */}
            {Icon && (
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent">
                  {title}
                </h1>
                
                {badge && (
                  <Badge 
                    variant={badge.variant || "secondary"}
                    className={cn("text-xs font-medium", badge.className)}
                  >
                    {badge.text}
                  </Badge>
                )}
              </div>
              
              {description && (
                <p className="text-gray-600 text-lg font-medium">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {action && (
            <Button 
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}
        </div>

        {/* Quick stats row */}
        {showStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
            <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-xl font-bold text-gray-900">{stats.orders || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-xl font-bold text-gray-900">${stats.revenue?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-xl font-bold text-gray-900">{stats.staff || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 