"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Users, 
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"

interface Insight {
  type: "positive" | "negative" | "neutral" | "warning"
  title: string
  description: string
  metric?: string
  action?: string
  icon: React.ReactNode
}

interface PerformanceInsightsProps {
  analyticsData: any
  currencyConfig?: {
    currency: string
    position: 'before' | 'after'
  }
}

export function PerformanceInsights({ analyticsData, currencyConfig }: PerformanceInsightsProps) {
  const getCurrencySymbol = (currency: string): string => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'MXN': '$',
      'BRL': 'R$'
    }
    return symbols[currency] || '$'
  }

  const formatCurrency = (amount: number): string => {
    if (!currencyConfig) {
      return `$${amount.toLocaleString()}`
    }
    const symbol = getCurrencySymbol(currencyConfig.currency)
    const formattedAmount = amount.toLocaleString()
    if (currencyConfig.position === 'after') {
      return `${formattedAmount}${symbol}`
    } else {
      return `${symbol}${formattedAmount}`
    }
  }

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []
    
    // Revenue insights
    if (analyticsData.revenue.growth > 10) {
             insights.push({
         type: "positive",
         title: "Strong Revenue Growth",
         description: `Revenue increased by ${analyticsData.revenue.growth.toFixed(1)}% compared to last week`,
         metric: `${formatCurrency(analyticsData.revenue.today)} today`,
         icon: <TrendingUp className="h-5 w-5 text-green-600" />
       })
    } else if (analyticsData.revenue.growth < -5) {
             insights.push({
         type: "negative",
         title: "Revenue Decline",
         description: `Revenue decreased by ${Math.abs(analyticsData.revenue.growth).toFixed(1)}% compared to last week`,
         metric: `${formatCurrency(analyticsData.revenue.today)} today`,
         action: "Consider promotional campaigns",
         icon: <TrendingDown className="h-5 w-5 text-red-600" />
       })
    }

    // Order insights
    if (analyticsData.orders.growth > 15) {
      insights.push({
        type: "positive",
        title: "High Order Volume",
        description: `Orders increased by ${analyticsData.orders.growth.toFixed(1)}% compared to last week`,
        metric: `${analyticsData.orders.today} orders today`,
        icon: <Target className="h-5 w-5 text-blue-600" />
      })
    }

    // Customer insights
    if (analyticsData.customers.new > 10) {
      insights.push({
        type: "positive",
        title: "New Customer Acquisition",
        description: `${analyticsData.customers.new} new customers this month`,
        metric: `${analyticsData.customers.total} total customers`,
        icon: <Users className="h-5 w-5 text-green-600" />
      })
    }

    // Average order value insights
    const avgOrderValue = analyticsData.orders.total > 0 ? analyticsData.revenue.total / analyticsData.orders.total : 0
         if (avgOrderValue > 25) {
       insights.push({
         type: "positive",
         title: "High Average Order Value",
         description: `Customers are spending an average of ${formatCurrency(avgOrderValue)} per order`,
         metric: "Above industry average",
         icon: <DollarSign className="h-5 w-5 text-green-600" />
       })
     } else if (avgOrderValue < 15) {
       insights.push({
         type: "warning",
         title: "Low Average Order Value",
         description: `Average order value is ${formatCurrency(avgOrderValue)}, consider upselling strategies`,
         metric: "Below target",
         action: "Review menu pricing and promotions",
         icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
       })
     }

    // Peak hours insight
    const peakHour = analyticsData.salesByHour.reduce((max: any, hour: any) => 
      hour.revenue > max.revenue ? hour : max
    )
         if (peakHour.revenue > 0) {
       insights.push({
         type: "neutral",
         title: "Peak Business Hours",
         description: `Highest revenue at ${peakHour.hour} with ${formatCurrency(peakHour.revenue)}`,
         metric: "Consider staffing optimization",
         icon: <Clock className="h-5 w-5 text-blue-600" />
       })
     }

    return insights
  }

  const insights = generateInsights()

  const getInsightStyles = (type: string) => {
    switch (type) {
      case "positive":
        return "border-green-200 bg-green-50"
      case "negative":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "neutral":
        return "border-blue-200 bg-blue-50"
      default:
        return ""
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "positive":
        return "default"
      case "negative":
        return "destructive"
      case "warning":
        return "secondary"
      case "neutral":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <span>Performance Insights</span>
        </CardTitle>
        <CardDescription>
          AI-powered insights and recommendations based on your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No insights available yet. Continue collecting data for personalized recommendations.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightStyles(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                        {insight.type === "positive" && "Good"}
                        {insight.type === "negative" && "Attention"}
                        {insight.type === "warning" && "Warning"}
                        {insight.type === "neutral" && "Info"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    {insight.metric && (
                      <p className="text-xs font-medium text-gray-700 mb-2">{insight.metric}</p>
                    )}
                    {insight.action && (
                      <Button size="sm" variant="outline" className="text-xs">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface KPIComparisonProps {
  current: number
  previous: number
  label: string
  format?: "currency" | "number" | "percentage"
  currencyConfig?: {
    currency: string
    position: 'before' | 'after'
  }
}

export function KPIComparison({ current, previous, label, format = "number", currencyConfig }: KPIComparisonProps) {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
  const isPositive = change >= 0

  const getCurrencySymbol = (currency: string): string => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'MXN': '$',
      'BRL': 'R$'
    }
    return symbols[currency] || '$'
  }

  const formatValue = (value: number) => {
    switch (format) {
      case "currency":
        if (!currencyConfig) {
          return `$${value.toLocaleString()}`
        }
        const symbol = getCurrencySymbol(currencyConfig.currency)
        const formattedAmount = value.toLocaleString()
        if (currencyConfig.position === 'after') {
          return `${formattedAmount}${symbol}`
        } else {
          return `${symbol}${formattedAmount}`
        }
      case "percentage":
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-2xl font-bold">{formatValue(current)}</p>
      </div>
      <div className="text-right">
        <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}{change.toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-gray-500">vs previous period</p>
      </div>
    </div>
  )
} 