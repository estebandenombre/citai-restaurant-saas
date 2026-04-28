"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Calendar,
  PieChart,
  Activity,
  Target,
  Award,
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts"
import { PerformanceInsights } from "@/components/analytics/performance-insights"
import { ExportReport, QuickExport } from "@/components/analytics/export-report"
import { ExportGate } from "@/components/subscription/feature-gate"
import { Skeleton } from "@/components/ui/skeleton"
import { Loading } from "@/components/ui/loading"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { useRestaurantCurrency } from "@/hooks/use-restaurant-currency"
import { useI18n } from "@/components/i18n/i18n-provider"


interface AnalyticsData {
  revenue: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    growth: number
  }
  orders: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    growth: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  topItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  salesByDay: Array<{
    date: string
    revenue: number
    orders: number
  }>
  salesByHour: Array<{
    hour: string
    revenue: number
    orders: number
  }>
  categoryPerformance: Array<{
    category: string
    revenue: number
    orders: number
  }>
}

export default function AnalyticsPage() {
  const { locale, intlLocale } = useI18n()
  const tx =
    locale === "es-ES"
      ? {
          loading: "Cargando analitica...",
          errLoad: "Error al cargar los datos de analitica",
          title: "Analitica",
          subtitle: "Sigue el rendimiento e insights de tu restaurante",
          timeRange: "Seleccionar rango",
          today: "Hoy",
          last7: "Ultimos 7 dias",
          last30: "Ultimos 30 dias",
          last90: "Ultimos 90 dias",
          todayRevenue: "Ingresos de hoy",
          totalRevenue: "Ingresos totales",
          todayOrders: "Pedidos de hoy",
          totalOrders: "Pedidos totales",
          customers: "Clientes",
          avgOrderValue: "Ticket medio",
          fromYesterday: "vs ayer",
          fromPrevWeek: "vs semana anterior",
          fromPrevMonth: "vs mes anterior",
          fromPrev90: "vs 90 dias anteriores",
          fromPrevPeriod: "vs periodo anterior",
          newThisMonth: "nuevos este mes",
          perOrder: "por pedido",
          tabs: {
            revenue: "Tendencia de ingresos",
            orders: "Tendencia de pedidos",
            hourly: "Analisis por hora",
            categories: "Rendimiento por categoria",
          },
          hourlyRevenueToday: "Ingresos por hora de hoy",
          dailyRevenueLast7: "Ingresos diarios de los ultimos 7 dias",
          hourlyOrdersToday: "Pedidos por hora de hoy",
          dailyOrdersLast7: "Pedidos diarios de los ultimos 7 dias",
          hourlySales: "Analisis de ventas por hora",
          revenueByHour: "Ingresos por hora del dia",
          categoryPerformance: "Rendimiento por categoria",
          revenueByCategory: "Ingresos por categoria del menu",
          topItems: "Productos top",
          topItemsDesc: "Productos mas vendidos por ingresos",
          ordersWord: "pedidos",
          avgWord: "media",
          dataSummary: "Resumen de datos",
          metricsOverview: "Resumen de metricas clave",
          exportSuccess: "Exportacion completada",
          exportFailed: "La exportacion ha fallado",
          quickExportCompleted: "Exportacion rapida completada",
          quickExportFailed: "La exportacion rapida ha fallado",
          pleaseTry: "Intentalo de nuevo.",
        }
      : {
          loading: "Loading analytics...",
          errLoad: "Error loading analytics data",
          title: "Analytics",
          subtitle: "Track your restaurant's performance and insights",
          timeRange: "Select time range",
          today: "Today",
          last7: "Last 7 days",
          last30: "Last 30 days",
          last90: "Last 90 days",
          todayRevenue: "Today's Revenue",
          totalRevenue: "Total Revenue",
          todayOrders: "Today's Orders",
          totalOrders: "Total Orders",
          customers: "Customers",
          avgOrderValue: "Avg Order Value",
          fromYesterday: "from yesterday",
          fromPrevWeek: "from previous week",
          fromPrevMonth: "from previous month",
          fromPrev90: "from previous 90 days",
          fromPrevPeriod: "from previous period",
          newThisMonth: "new this month",
          perOrder: "per order",
          tabs: {
            revenue: "Revenue Trends",
            orders: "Order Trends",
            hourly: "Hourly Analysis",
            categories: "Category Performance",
          },
          hourlyRevenueToday: "Hourly revenue for today",
          dailyRevenueLast7: "Daily revenue over the last 7 days",
          hourlyOrdersToday: "Hourly orders for today",
          dailyOrdersLast7: "Daily orders over the last 7 days",
          hourlySales: "Hourly Sales Analysis",
          revenueByHour: "Revenue by hour of the day",
          categoryPerformance: "Category Performance",
          revenueByCategory: "Revenue by menu category",
          topItems: "Top Performing Items",
          topItemsDesc: "Best selling menu items by revenue",
          ordersWord: "orders",
          avgWord: "avg",
          dataSummary: "Data Summary",
          metricsOverview: "Key metrics overview",
          exportSuccess: "Export completed successfully",
          exportFailed: "Export failed",
          quickExportCompleted: "Quick export completed",
          quickExportFailed: "Quick export failed",
          pleaseTry: "Please try again.",
        }

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [restaurant, setRestaurant] = useState<any>(null)
  const [ordersData, setOrdersData] = useState<any[]>([])
  const { toast } = useToast()
  const { currencyConfig } = useRestaurantCurrency(restaurant?.id)

  // Function to format currency based on restaurant configuration
  const formatCurrency = (amount: number, decimals: number = 2): string => {
    if (!currencyConfig) {
      return `$${amount.toLocaleString()}`
    }

    const formattedAmount = amount.toLocaleString(intlLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    const symbol = getCurrencySymbol(currencyConfig.currency)
    
    if (currencyConfig.position === 'after') {
      return `${formattedAmount}${symbol}`
    } else {
      return `${symbol}${formattedAmount}`
    }
  }

  // Function to get currency symbol
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

  const handleExport = async (format: string, dateRange: { from: Date; to: Date }, options: any) => {
    try {
      if (!analyticsData || !restaurant) {
        throw new Error('Analytics data or restaurant information not available')
      }

      console.log(`Exporting ${format} report from ${dateRange.from} to ${dateRange.to}`, options)
      
      // Import the export service dynamically to avoid SSR issues
      const { ExportService } = await import('@/lib/export-service')
      
      const restaurantInfo = {
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website,
        currencyConfig: currencyConfig || undefined
      }

      let blob: Blob
      
      switch (format) {
        case 'pdf':
          blob = ExportService.exportToPDF(analyticsData, restaurantInfo, dateRange, options)
          break
        case 'excel':
          blob = await ExportService.exportToExcel(analyticsData, restaurantInfo, dateRange, options)
          break
        case 'csv':
          blob = ExportService.exportToCSV(analyticsData, restaurantInfo, dateRange, options)
          break
        case 'json':
          blob = ExportService.exportToJSON(analyticsData, restaurantInfo, dateRange, options)
          break
        default:
          throw new Error(`Unsupported format: ${format}`)
      }

      // Generate filename and download
      const filename = ExportService.generateFilename(format, restaurant.name, dateRange)
      ExportService.downloadFile(blob, filename)
      
      toast({
        title: tx.exportSuccess,
        description: `${format.toUpperCase()} report has been downloaded as "${filename}"`,
      })
      
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: tx.exportFailed,
        description: error instanceof Error ? error.message : tx.pleaseTry,
        variant: "destructive",
      })
    }
  }

  const handleQuickExport = async (period: string) => {
    try {
      if (!analyticsData || !restaurant) {
        throw new Error('Analytics data or restaurant information not available')
      }

      console.log(`Quick export for period: ${period}`)
      
      let dateRange = { from: new Date(), to: new Date() }
      
      // Calculate date range based on period
      const now = new Date()
      switch (period) {
        case 'today':
          dateRange.from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          dateRange.to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
          break
        case 'week':
          dateRange.from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateRange.to = now
          break
        case 'month':
          dateRange.from = new Date(now.getFullYear(), now.getMonth(), 1)
          dateRange.to = now
          break
        case '30d':
          dateRange.from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          dateRange.to = now
          break
        case '90d':
          dateRange.from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          dateRange.to = now
          break
        default:
          dateRange.from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateRange.to = now
      }

      // Import the export service dynamically to avoid SSR issues
      const { ExportService } = await import('@/lib/export-service')
      
      const restaurantInfo = {
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website,
        currencyConfig: currencyConfig || undefined
      }

      // Default options for quick export
      const options = {
        includeCharts: true,
        includeRawData: true,
        includeInsights: true,
        includeTopItems: true,
        includeHourlyData: false,
        includeCustomerData: false
      }

      // Generate PDF by default for quick exports
      const blob = await ExportService.exportToPDF(analyticsData, restaurantInfo, dateRange, options)
      
      // Generate filename and download
      const filename = ExportService.generateFilename('pdf', restaurant.name, dateRange)
      ExportService.downloadFile(blob, filename)
      
      toast({
        title: tx.quickExportCompleted,
        description: `PDF report for ${period} has been downloaded as "${filename}"`,
      })
      
    } catch (error) {
      console.error('Quick export error:', error)
      toast({
        title: tx.quickExportFailed,
        description: error instanceof Error ? error.message : tx.pleaseTry,
        variant: "destructive",
      })
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])



  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const { restaurantId, restaurant: userRestaurant } = await getCurrentUserRestaurant()
      setRestaurant(userRestaurant)

      if (!restaurantId) {
        console.error("No restaurant ID found")
        return
      }

      const now = new Date()
      
      // First, let's check if we have any orders to determine if dates are in the future
      const { data: sampleOrders } = await supabase
        .from("orders")
        .select("created_at")
        .eq("restaurant_id", restaurantId)
        .limit(1)
        .order("created_at", { ascending: false })
      
      let hasFutureDates = false
      if (sampleOrders && sampleOrders.length > 0) {
        const firstOrderDate = new Date(sampleOrders[0].created_at)
        hasFutureDates = firstOrderDate.getFullYear() > now.getFullYear()
      }
      
      // Adjust dates if we detect future dates
      let today, weekAgo, monthAgo, startDate
      
      if (hasFutureDates) {
        // If dates are in 2025, treat them as 2024
        const adjustedNow = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        today = new Date(adjustedNow.getFullYear(), adjustedNow.getMonth(), adjustedNow.getDate())
        weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        // Normal dates
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      // Determine the start date based on time range
      startDate = monthAgo // Default to last 30 days for fetching
      if (timeRange === "today") {
        startDate = today
      } else if (timeRange === "7d") {
        startDate = weekAgo
      } else if (timeRange === "90d") {
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      }

      // Fetch orders with order items and menu items
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            menu_items (
              id,
              name,
              price,
              category_id
            )
          )
        `)
        .eq("restaurant_id", restaurantId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true })

      // Customers data will be derived from orders since customers table doesn't exist
      const customersData: any[] = []



      if (ordersError) {
        console.error("Error fetching orders:", ordersError)
        return
      }

      // Fetch categories for better analysis
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("restaurant_id", restaurantId)

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError)
      }

      // Normalize order dates if they are in the future
      let normalizedOrdersData = ordersData || []
      if (hasFutureDates && normalizedOrdersData.length > 0) {
        normalizedOrdersData = normalizedOrdersData.map(order => ({
          ...order,
          created_at: order.created_at.replace('2025-', '2024-'),
          updated_at: order.updated_at ? order.updated_at.replace('2025-', '2024-') : order.updated_at
        }))
      }

      // Process data with real information
      const processedData = processAnalyticsData(normalizedOrdersData, categories || [], customersData || [])
      setAnalyticsData(processedData)
      setOrdersData(normalizedOrdersData)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (ordersData: any[], categories: any[], customersData: any[]): AnalyticsData => {
    const now = new Date()
    
    // Check if orders have future dates (indicating a date issue in the database)
    let hasFutureDates = false
    if (ordersData.length > 0) {
      const firstOrderDate = new Date(ordersData[0].created_at)
      hasFutureDates = firstOrderDate.getFullYear() > now.getFullYear()
    }
    
    // Adjust dates if we detect future dates (treat 2025 as 2024)
    let today, weekAgo, monthAgo, previousWeekAgo, yesterday
    
          if (hasFutureDates) {
        // If dates are in 2025, treat them as 2024
        const adjustedNow = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        today = new Date(adjustedNow.getFullYear(), adjustedNow.getMonth(), adjustedNow.getDate())
        weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousWeekAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
        yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      } else {
        // Normal dates
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousWeekAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
        yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      }

    // Determine which orders to display based on time range
    let displayOrders = []
    let comparisonOrders = []
    let comparisonPeriod = ""
    let startDate: Date
    let comparisonStartDate: Date

    if (timeRange === "today") {
      startDate = today
      comparisonStartDate = yesterday
      displayOrders = ordersData.filter(order => 
        new Date(order.created_at) >= today
      )
      comparisonOrders = ordersData.filter(order => 
        new Date(order.created_at) >= yesterday && new Date(order.created_at) < today
      )
      comparisonPeriod = "yesterday"
      

    } else if (timeRange === "7d") {
      startDate = weekAgo
      comparisonStartDate = previousWeekAgo
      displayOrders = ordersData.filter(order => 
        new Date(order.created_at) >= weekAgo
      )
      comparisonOrders = ordersData.filter(order => 
        new Date(order.created_at) >= previousWeekAgo && new Date(order.created_at) < weekAgo
      )
      comparisonPeriod = "previous week"
    } else if (timeRange === "30d") {
      startDate = monthAgo
      comparisonStartDate = new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000)
      displayOrders = ordersData.filter(order => 
        new Date(order.created_at) >= monthAgo
      )
      // Compare with previous 30 days
      const previousMonthAgo = new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000)
      comparisonOrders = ordersData.filter(order => 
        new Date(order.created_at) >= previousMonthAgo && new Date(order.created_at) < monthAgo
      )
      comparisonPeriod = "previous month"
    } else if (timeRange === "90d") {
      const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      startDate = ninetyDaysAgo
      comparisonStartDate = new Date(ninetyDaysAgo.getTime() - 90 * 24 * 60 * 60 * 1000)
      displayOrders = ordersData.filter(order => 
        new Date(order.created_at) >= ninetyDaysAgo
      )
      // Compare with previous 90 days
      const previousNinetyDaysAgo = new Date(ninetyDaysAgo.getTime() - 90 * 24 * 60 * 60 * 1000)
      comparisonOrders = ordersData.filter(order => 
        new Date(order.created_at) >= previousNinetyDaysAgo && new Date(order.created_at) < ninetyDaysAgo
      )
      comparisonPeriod = "previous 90 days"
    } else {
      // Default to all data
      startDate = new Date(0) // Beginning of time
      comparisonStartDate = new Date(0)
      displayOrders = ordersData
      comparisonOrders = []
      comparisonPeriod = "no comparison"
    }

    // Calculate revenue and orders for display period
    const displayRevenue = displayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const displayOrderCount = displayOrders.length

    // Calculate revenue and orders for comparison period
    const comparisonRevenue = comparisonOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const comparisonOrderCount = comparisonOrders.length

    // Calculate growth percentages
    const revenueGrowth = comparisonRevenue > 0 ? ((displayRevenue - comparisonRevenue) / comparisonRevenue) * 100 : 0
    const ordersGrowth = comparisonOrderCount > 0 ? ((displayOrderCount - comparisonOrderCount) / comparisonOrderCount) * 100 : 0

    // Calculate additional metrics for different periods (for internal use)
    const todayOrders = ordersData.filter(order => 
      new Date(order.created_at) >= today
    )
    const weekOrders = ordersData.filter(order => 
      new Date(order.created_at) >= weekAgo
    )
    const monthOrders = ordersData.filter(order => 
      new Date(order.created_at) >= monthAgo
    )

    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const weekRevenue = weekOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

    // Generate sales by day data for the last 7 days, or hourly data for today
    const salesByDay = []
    if (timeRange === "today") {
      // For today, show hourly data
      for (let hour = 0; hour < 24; hour++) {
        const hourOrders = displayOrders.filter(order => {
          const orderHour = new Date(order.created_at).getHours()
          const orderDate = new Date(order.created_at)
          return orderHour === hour && orderDate.toDateString() === today.toDateString()
        })
        salesByDay.push({
          date: `${hour}:00`,
          revenue: hourOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
          orders: hourOrders.length
        })
      }
    } else {
      // For other time ranges, show daily data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        const dayOrders = displayOrders.filter(order => {
          const orderDate = new Date(order.created_at)
          return orderDate.toDateString() === date.toDateString()
        })
        salesByDay.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
          orders: dayOrders.length
        })
      }
    }

    // Generate sales by hour data (only for display period)
    const salesByHour = []
    for (let hour = 0; hour < 24; hour++) {
      const hourOrders = displayOrders.filter(order => {
        const orderHour = new Date(order.created_at).getHours()
        return orderHour === hour
      })
      salesByHour.push({
        hour: `${hour}:00`,
        revenue: hourOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        orders: hourOrders.length
      })
    }

    // Calculate top items from real order data (only for display period)
    const itemStats = new Map()
    
    displayOrders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach((item: any) => {
          if (item.menu_items) {
            const itemId = item.menu_items.id
            const itemName = item.menu_items.name
            const itemPrice = item.menu_items.price || 0
            const quantity = item.quantity || 0
            const totalItemRevenue = (itemPrice * quantity)

            if (itemStats.has(itemId)) {
              const existing = itemStats.get(itemId)
              existing.quantity += quantity
              existing.revenue += totalItemRevenue
            } else {
              itemStats.set(itemId, {
                name: itemName,
                quantity: quantity,
                revenue: totalItemRevenue
              })
            }
          }
        })
      }
    })

    const topItems = Array.from(itemStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate category performance from real data (only for display period)
    const categoryStats = new Map()
    
    displayOrders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach((item: any) => {
          if (item.menu_items && item.menu_items.category_id) {
            const categoryId = item.menu_items.category_id
            const category = categories.find(cat => cat.id === categoryId)
            const categoryName = category ? category.name : 'Uncategorized'
            const itemPrice = item.menu_items.price || 0
            const quantity = item.quantity || 0
            const totalItemRevenue = (itemPrice * quantity)

            if (categoryStats.has(categoryId)) {
              const existing = categoryStats.get(categoryId)
              existing.revenue += totalItemRevenue
              existing.orders += 1
            } else {
              categoryStats.set(categoryId, {
                category: categoryName,
                revenue: totalItemRevenue,
                orders: 1
              })
            }
          }
        })
      }
    })

    const categoryPerformance = Array.from(categoryStats.values())
      .sort((a, b) => b.revenue - a.revenue)

    // Calculate customers from orders data since customers table doesn't exist
    const uniqueCustomerEmails = new Set()
    const customerOrderCount = new Map()
    
    // Count orders per customer in display period
    displayOrders.forEach(order => {
      if (order.customer_email) {
        uniqueCustomerEmails.add(order.customer_email)
        const count = customerOrderCount.get(order.customer_email) || 0
        customerOrderCount.set(order.customer_email, count + 1)
      }
    })

    // Count orders per customer in comparison period (for growth calculation)
    comparisonOrders.forEach(order => {
      if (order.customer_email) {
        const count = customerOrderCount.get(order.customer_email) || 0
        customerOrderCount.set(order.customer_email, count + 1)
      }
    })

    const displayCustomers = Array.from(uniqueCustomerEmails).map(email => ({ email }))
    const newCustomers = Array.from(customerOrderCount.values()).filter(count => count === 1).length
    const returningCustomers = Array.from(customerOrderCount.values()).filter(count => count > 1).length
    
    // Calculate growth based on unique emails in comparison period
    const comparisonEmails = new Set()
    comparisonOrders.forEach(order => {
      if (order.customer_email) {
        comparisonEmails.add(order.customer_email)
      }
    })
    
    const customerGrowth = comparisonEmails.size > 0 
      ? ((uniqueCustomerEmails.size - comparisonEmails.size) / comparisonEmails.size) * 100 
      : 0



    return {
      revenue: {
        total: displayRevenue,
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue,
        growth: revenueGrowth
      },
      orders: {
        total: displayOrderCount,
        today: todayOrders.length,
        thisWeek: weekOrders.length,
        thisMonth: monthOrders.length,
        growth: ordersGrowth
      },
      customers: {
        total: displayCustomers.length,
        new: newCustomers,
        returning: returningCustomers
      },
      topItems,
      salesByDay,
      salesByHour,
      categoryPerformance
    }
  }

  if (loading) {
    return <Loading text={tx.loading} />
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">{tx.errLoad}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Minimalist Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-rose-50 border border-rose-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {tx.title}
              </h1>
              <p className="text-gray-500 text-sm">
                {tx.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 border border-gray-200 rounded-lg">
                <SelectValue placeholder={tx.timeRange} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{tx.today}</SelectItem>
                <SelectItem value="7d">{tx.last7}</SelectItem>
                <SelectItem value="30d">{tx.last30}</SelectItem>
                <SelectItem value="90d">{tx.last90}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {timeRange === "today" ? tx.todayRevenue : tx.totalRevenue}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.total)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={analyticsData.revenue.growth >= 0 ? "text-green-600" : "text-red-600"}>
                {analyticsData.revenue.growth >= 0 ? "+" : ""}{analyticsData.revenue.growth.toFixed(1)}%
              </span>{" "}
              {timeRange === "today" ? tx.fromYesterday :
               timeRange === "7d" ? tx.fromPrevWeek :
               timeRange === "30d" ? tx.fromPrevMonth :
               timeRange === "90d" ? tx.fromPrev90 : tx.fromPrevPeriod}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {timeRange === "today" ? tx.todayOrders : tx.totalOrders}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.orders.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className={analyticsData.orders.growth >= 0 ? "text-green-600" : "text-red-600"}>
                {analyticsData.orders.growth >= 0 ? "+" : ""}{analyticsData.orders.growth.toFixed(1)}%
              </span>{" "}
              {timeRange === "today" ? tx.fromYesterday :
               timeRange === "7d" ? tx.fromPrevWeek :
               timeRange === "30d" ? tx.fromPrevMonth :
               timeRange === "90d" ? tx.fromPrev90 : tx.fromPrevPeriod}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.customers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.customers.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.customers.new} {tx.newThisMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tx.avgOrderValue}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                                {formatCurrency(analyticsData.orders.total > 0 ? (analyticsData.revenue.total / analyticsData.orders.total) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {tx.perOrder}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">{tx.tabs.revenue}</TabsTrigger>
          <TabsTrigger value="orders">{tx.tabs.orders}</TabsTrigger>
          <TabsTrigger value="hourly">{tx.tabs.hourly}</TabsTrigger>
          <TabsTrigger value="categories">{tx.tabs.categories}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tx.tabs.revenue}</CardTitle>
              <CardDescription>
                {timeRange === "today" ? tx.hourlyRevenueToday : tx.dailyRevenueLast7}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tx.tabs.orders}</CardTitle>
              <CardDescription>
                {timeRange === "today" ? tx.hourlyOrdersToday : tx.dailyOrdersLast7}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tx.hourlySales}</CardTitle>
              <CardDescription>{tx.revenueByHour}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.salesByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tx.categoryPerformance}</CardTitle>
              <CardDescription>{tx.revenueByCategory}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.categoryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {analyticsData.categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle>{tx.topItems}</CardTitle>
          <CardDescription>{tx.topItemsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {tx.ordersWord}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.revenue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.revenue / item.quantity)} {tx.avgWord}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
                    <PerformanceInsights analyticsData={analyticsData} currencyConfig={currencyConfig || undefined} />

      {/* Export Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <ExportReport onExport={handleExport} />
        <div className="space-y-4">
          <QuickExport onQuickExport={handleQuickExport} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tx.dataSummary}</CardTitle>
            <CardDescription>{tx.metricsOverview}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{analyticsData.orders.total}</p>
                <p className="text-sm text-gray-600">
                  {timeRange === "today" ? tx.todayOrders : tx.totalOrders}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.revenue.total)}</p>
                <p className="text-sm text-gray-600">
                  {timeRange === "today" ? tx.todayRevenue : tx.totalRevenue}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold font-mono tabular-nums text-foreground">
                  {analyticsData.customers.total}
                </p>
                <p className="text-sm text-gray-600">{tx.customers}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(analyticsData.orders.total > 0 ? (analyticsData.revenue.total / analyticsData.orders.total) : 0)}
                </p>
                <p className="text-sm text-gray-600">{tx.avgOrderValue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
      </div>
  )
} 