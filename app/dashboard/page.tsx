"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ShoppingCart, 
  DollarSign, 
  Package, 
  AlertCircle, 
  BarChart3,
  TargetIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  ChefHat,
  Utensils,
  Receipt,
  Settings,
  Bell,
  User,
  ArrowRight,
  Play,
  Pause,
  CheckCircle,
  Circle,
  Eye,
  FileText,
  Zap,
  ArrowUpRight,
  Menu as MenuIcon,
  Cog,
  TrendingUp as TrendingUpIcon,
  BarChart,
  CreditCard,
  PieChart,
  Activity,
  Star,
  Zap as ZapIcon,
  ArrowUp,
  ArrowDown,
  LayoutDashboard
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import CompletionCelebration from "@/components/onboarding/completion-celebration"
import OnboardingTour from "@/components/onboarding/onboarding-tour"
import { useOnboarding } from "@/hooks/use-onboarding"
import Link from "next/link"
import { Loading } from "@/components/ui/loading"
import { FormattedPrice } from "@/components/ui/formatted-price"
import { useI18n } from "@/components/i18n/i18n-provider"
import type { LucideIcon } from "lucide-react"

type DashboardActivity =
  | {
      kind: "order"
      orderId: string
      amount: number
      status: string
      at: string
      icon: LucideIcon
    }
  | {
      kind: "reservation"
      customer: string
      reservationDate: string
      at: string
      icon: LucideIcon
    }

export default function DashboardPage() {
  const { t, intlLocale } = useI18n()
  const [user, setUser] = useState<any>(null)
  const { isOnboardingOpen, openOnboarding, closeOnboarding, completeOnboarding } = useOnboarding()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockCount: 0,
    totalMenuItems: 0,
    totalReservations: 0,
    todayReservations: 0,
    totalStaff: 0,
    averageOrderValue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    topSellingItems: 0,
    customerSatisfaction: 0,
    totalCategories: 0,
    totalInventoryItems: 0,
    orderCompletionRate: 0,
    inventoryUtilization: 0,
    revenueChange: 0,
    orderChange: 0,
    reservationChange: 0,
    staffChange: 0
  })
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([])
  const [menuItemsData, setMenuItemsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get the authenticated user and their restaurant
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
        
        const { restaurantId, restaurant: userRestaurant } = await getCurrentUserRestaurant()
        setRestaurant(userRestaurant)

        // Fetch today's orders
        const today = new Date().toISOString().split("T")[0]
        const { data: todayOrdersData } = await supabase
          .from("orders")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .gte("created_at", today)

        // Fetch yesterday's orders for comparison
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const { data: yesterdayOrdersData } = await supabase
          .from("orders")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .gte("created_at", yesterday)
          .lt("created_at", today)

        // Fetch menu items
        const { data: menuItemsData } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", restaurantId)

        setMenuItemsData(menuItemsData || [])

        // Fetch inventory items
        const { data: inventoryData } = await supabase
          .from("inventory_items")
          .select("*")
          .eq("restaurant_id", restaurantId)

        // Fetch reservations
        const { data: reservationsData } = await supabase
          .from("reservations")
          .select("*")
          .eq("restaurant_id", restaurantId)

        // Fetch staff
        const { data: staffData } = await supabase
          .from("staff_shifts")
          .select("*")
          .eq("restaurant_id", restaurantId)

        // Calculate stats
        const todayOrders = todayOrdersData?.length || 0
        const yesterdayOrders = yesterdayOrdersData?.length || 0
        const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const yesterdayRevenue = yesterdayOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const pendingOrders = todayOrdersData?.filter(order => order.status === 'pending').length || 0
        const completedOrders = todayOrdersData?.filter(order => order.status === 'completed').length || 0
        const lowStockItems = inventoryData?.filter(item => (item.quantity || 0) < (item.min_quantity || 5)).length || 0
        const totalMenuItems = menuItemsData?.length || 0
        const totalReservations = reservationsData?.length || 0
        const todayReservations = reservationsData?.filter(res => res.reservation_date === today).length || 0
        const totalStaff = staffData?.length || 0
        const averageOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0
        const orderCompletionRate = todayOrders > 0 ? (completedOrders / todayOrders) * 100 : 0
        const inventoryUtilization = (inventoryData?.length || 0) > 0 ? ((inventoryData?.length || 0) - lowStockItems) / (inventoryData?.length || 1) * 100 : 100

        // Calculate weekly and monthly revenue
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

        const { data: weeklyOrdersData } = await supabase
          .from("orders")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .gte("created_at", weekAgo)

        const { data: monthlyOrdersData } = await supabase
          .from("orders")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .gte("created_at", monthAgo)

        const weeklyRevenue = weeklyOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const monthlyRevenue = monthlyOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        // Calculate changes
        const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
        const orderChange = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0

        setStats({
          todayOrders,
          todayRevenue,
          pendingOrders,
          completedOrders,
          lowStockCount: lowStockItems,
          totalMenuItems,
          totalReservations,
          todayReservations,
          totalStaff,
          averageOrderValue,
          weeklyRevenue,
          monthlyRevenue,
          topSellingItems: 0,
          customerSatisfaction: 0,
          totalCategories: 0,
          totalInventoryItems: inventoryData?.length || 0,
          orderCompletionRate,
          inventoryUtilization,
          revenueChange,
          orderChange,
          reservationChange: 0,
          staffChange: 0
        })

        const activity: DashboardActivity[] = []
        const recentOrders = todayOrdersData?.slice(0, 3) || []
        recentOrders.forEach((order) => {
          const oid = (order as { order_number?: string | number; id: string }).order_number
          activity.push({
            kind: "order",
            orderId: String(oid ?? order.id),
            amount: order.total_amount || 0,
            status: String(order.status),
            at: order.created_at,
            icon: Receipt,
          })
        })

        const recentReservations = reservationsData?.slice(0, 2) || []
        recentReservations.forEach((reservation) => {
          activity.push({
            kind: "reservation",
            customer: reservation.customer_name,
            reservationDate: reservation.reservation_date,
            at: reservation.created_at,
            icon: Calendar,
          })
        })

        setRecentActivity(
          activity
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            .slice(0, 5)
        )

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <Loading text={t("common.loadingDashboard")} />
  }

    return (
    <div className="space-y-8">
      {/* Minimalist Header */}
      <div className="rounded-2xl border border-border/90 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50">
              <LayoutDashboard className="h-5 w-5 text-foreground/80" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-foreground">
                {t("dashboard.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {restaurant?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 font-mono text-sm tabular-nums text-muted-foreground">
              {new Date().toLocaleDateString(intlLocale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              —{" "}
              {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString(intlLocale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Metric */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.todaysRevenue")}</p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  <FormattedPrice amount={stats.todayRevenue} restaurantId={restaurant?.id} />
                </p>
                <div className="flex items-center mt-2">
                  {stats.revenueChange >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-foreground" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stats.revenueChange >= 0 ? 'text-foreground' : 'text-destructive'
                  }`}>
                    {Math.abs(stats.revenueChange).toFixed(1)}%
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">{t("common.vsYesterday")}</span>
                </div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border">
                <DollarSign className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Metric */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.metrics.orders")}</p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{stats.todayOrders}</p>
                <div className="flex items-center mt-2">
                  {stats.orderChange >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-foreground" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stats.orderChange >= 0 ? 'text-foreground' : 'text-destructive'
                  }`}>
                    {Math.abs(stats.orderChange).toFixed(1)}%
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">{t("common.vsYesterday")}</span>
                </div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border">
                <ShoppingCart className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.averageOrderValue")}
                </p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  <FormattedPrice amount={stats.averageOrderValue} restaurantId={restaurant?.id} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("dashboard.completedToday", { n: stats.completedOrders })}
                </p>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border">
                <BarChart3 className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.pendingOrders")}
                </p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{stats.pendingOrders}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("dashboard.completionRate", {
                    n: Number(stats.orderCompletionRate.toFixed(0)),
                  })}
                </p>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border">
                <Clock className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Analytics */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t("dashboard.revenueAnalytics")}
                </CardTitle>
                <CardDescription>{t("dashboard.revenueAnalyticsDesc")}</CardDescription>
              </div>
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("dashboard.thisWeek")}</span>
                <span className="text-lg font-semibold text-foreground">
                  <FormattedPrice amount={stats.weeklyRevenue} restaurantId={restaurant?.id} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("dashboard.thisMonth")}</span>
                <span className="text-lg font-semibold text-foreground">
                  <FormattedPrice amount={stats.monthlyRevenue} restaurantId={restaurant?.id} />
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("dashboard.revenueGrowth")}</span>
                <span className={`font-medium ${
                  stats.revenueChange >= 0 ? 'text-foreground' : 'text-destructive'
                }`}>
                  {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(Math.abs(stats.revenueChange), 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Operations Overview */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t("dashboard.menuOverview")}
                </CardTitle>
                <CardDescription>{t("dashboard.menuOverviewDesc")}</CardDescription>
              </div>
              <Link href="/dashboard/menu">
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("dashboard.totalItems")}</span>
                  <span className="text-lg font-semibold text-foreground">{stats.totalMenuItems}</span>
                </div>
                <Progress value={Math.min((stats.totalMenuItems / 100) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("dashboard.categories")}</span>
                  <span className="text-lg font-semibold text-foreground">{stats.totalCategories}</span>
                </div>
                <Progress value={Math.min((stats.totalCategories / 10) * 100, 100)} className="h-2" />
              </div>
            </div>
            
            {/* Menu Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{t("dashboard.recentItems")}</span>
                <span className="text-xs text-muted-foreground">
                  {t("dashboard.itemsTotal", { n: stats.totalMenuItems })}
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {menuItemsData?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-xl border border-border/60">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-600/80" />
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <FormattedPrice amount={item.price} restaurantId={restaurant?.id} />
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono normal-case tracking-normal">
                      {item.category || t("dashboard.generalCategory")}
                    </Badge>
                    </div>
                ))}
                {(!menuItemsData || menuItemsData.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">{t("dashboard.noMenuItems")}</p>
                  </div>
              )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t("dashboard.recentActivity")}
                </CardTitle>
                <CardDescription>{t("dashboard.recentActivityDesc")}</CardDescription>
              </div>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((row, index) => {
                  const Icon = row.icon
                  const title =
                    row.kind === "order"
                      ? t("dashboard.orderTitle", { id: row.orderId })
                      : t("dashboard.reservationTitle")
                  const timeLabel = new Date(row.at).toLocaleTimeString(intlLocale)
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          row.kind === "order"
                            ? "border border-border bg-card"
                            : "border border-border/70 bg-muted/50"
                        }`}
                      >
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.kind === "order" ? (
                            <>
                              <FormattedPrice
                                amount={row.amount}
                                restaurantId={restaurant?.id}
                              />{" "}
                              — {row.status}
                            </>
                          ) : (
                            <>
                              {row.customer} —{" "}
                              {new Date(row.reservationDate).toLocaleDateString(intlLocale)}
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground/80">{timeLabel}</span>
                    </div>
                  )
                })
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">{t("dashboard.noRecentActivity")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Reservations */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t("dashboard.reservationsCard")}
                </CardTitle>
                <CardDescription>{t("dashboard.reservationsDesc")}</CardDescription>
              </div>
              <Link href="/dashboard/reservations">
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("common.today")}</span>
                <span className="text-2xl font-bold text-foreground">{stats.todayReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("common.total")}</span>
                <span className="text-lg font-semibold text-foreground">{stats.totalReservations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t("dashboard.staff")}
                </CardTitle>
                <CardDescription>{t("dashboard.teamOverview")}</CardDescription>
              </div>
              <Link href="/dashboard/staff">
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("dashboard.activeStaff")}</span>
                <span className="text-2xl font-bold text-foreground">{stats.totalStaff}</span>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(stats.totalStaff, 4) }, (_, i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-border">
                    <AvatarFallback className="text-xs bg-muted text-foreground">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {stats.totalStaff > 4 && (
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full border border-border">
                    <span className="text-xs font-medium text-foreground">+{stats.totalStaff - 4}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              {t("dashboard.quickActions")}
            </CardTitle>
            <CardDescription>{t("dashboard.quickActionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/orders">
                <Button variant="outline" className="w-full justify-start hover:bg-muted/60 transition-colors">
                  <Receipt className="h-4 w-4 mr-2 text-foreground" />
                  {t("dashboard.viewOrders")}
                </Button>
              </Link>
              <Link href="/dashboard/menu">
                <Button variant="outline" className="w-full justify-start hover:bg-muted/60 transition-colors">
                  <MenuIcon className="h-4 w-4 mr-2 text-foreground" />
                  {t("dashboard.manageMenu")}
                </Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button variant="outline" className="w-full justify-start hover:bg-muted/60 transition-colors">
                  <Package className="h-4 w-4 mr-2 text-foreground" />
                  {t("dashboard.checkInventory")}
                </Button>
              </Link>

            </div>
          </CardContent>
        </Card>

      </div>

      {/* Onboarding Tour */}
      <OnboardingTour isOpen={isOnboardingOpen} onClose={closeOnboarding} onComplete={completeOnboarding} />

      {/* Completion Celebration */}
      <CompletionCelebration
        isVisible={false} 
        onClose={() => {}} 
        restaurantName={restaurant?.name || "your restaurant"} 
      />
    </div>
  )
}
