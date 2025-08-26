import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface InsightCardProps {
  title: string
  value: string | number
  description: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  variant?: "default" | "positive" | "negative" | "neutral"
}

export function InsightCard({
  title,
  value,
  description,
  trend,
  trendLabel,
  icon,
  variant = "default"
}: InsightCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return <Minus className="h-4 w-4 text-gray-400" />
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = () => {
    if (trend === undefined) return "text-gray-600"
    if (trend > 0) return "text-green-600"
    if (trend < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "positive":
        return "border-green-200 bg-green-50"
      case "negative":
        return "border-red-200 bg-red-50"
      case "neutral":
        return "border-gray-200 bg-gray-50"
      default:
        return ""
    }
  }

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 mt-1">
          {trend !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {trendLabel || description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeVariant = "default"
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {badge && (
            <Badge variant={badgeVariant}>{badge}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 