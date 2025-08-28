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
    <div className={cn("bg-white rounded-lg border border-gray-100 p-6", className)}>
      {/* Main header content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Icon container */}
          {Icon && (
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 border border-purple-200 rounded-lg">
              <Icon className="h-5 w-5 text-purple-600" />
            </div>
          )}
          
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold text-gray-900">
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
              <p className="text-gray-500 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {action && (
          <div className="flex items-center space-x-3">
            <Button 
              onClick={action.onClick}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          </div>
        )}
      </div>

      {/* Quick stats row */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats.orders || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-xl font-bold text-gray-900">${stats.revenue?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
  )
} 