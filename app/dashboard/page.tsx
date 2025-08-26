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
  LayoutDashboard,
  Download
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import CompletionCelebration from "@/components/onboarding/completion-celebration"
import OnboardingTour from "@/components/onboarding/onboarding-tour"
import { useOnboarding } from "@/hooks/use-onboarding"
import Link from "next/link"
import { Loading } from "@/components/ui/loading"
import { FormattedPrice } from "@/components/ui/formatted-price"

export default function DashboardPage() {
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
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [menuItemsData, setMenuItemsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

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

        // Set up recent activity
        const activity: any[] = []

        // Add recent orders
        const recentOrders = todayOrdersData?.slice(0, 3) || []
        recentOrders.forEach((order) => {
          activity.push({
            type: "order",
            title: `Order #${order.id}`,
            description: `$${order.total_amount || 0} - ${order.status}`,
            color: "blue",
            time: new Date(order.created_at).toLocaleTimeString(),
            icon: Receipt
          })
        })

        // Add recent reservations
        const recentReservations = reservationsData?.slice(0, 2) || []
        recentReservations.forEach((reservation) => {
          activity.push({
            type: "reservation",
            title: `Reservation`,
            description: `${reservation.customer_name} - ${new Date(reservation.reservation_date).toLocaleDateString()}`,
            color: "green",
            time: new Date(reservation.created_at).toLocaleTimeString(),
            icon: Calendar
          })
        })

        setRecentActivity(activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5))

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <Loading text="Loading dashboard..." />
  }

    return (
    <div className="space-y-8">
      {/* Minimalist Header */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm">
                Welcome back to {restaurant?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} - {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Metric */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  <FormattedPrice amount={stats.todayRevenue} restaurantId={restaurant?.id} />
                </p>
                <div className="flex items-center mt-2">
                  {stats.revenueChange >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(stats.revenueChange).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Metric */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayOrders}</p>
                <div className="flex items-center mt-2">
                  {stats.orderChange >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    stats.orderChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(stats.orderChange).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  <FormattedPrice amount={stats.averageOrderValue} restaurantId={restaurant?.id} />
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.completedOrders} completed today
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.orderCompletionRate.toFixed(0)}% completion rate
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Analytics */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Revenue Analytics</CardTitle>
                <CardDescription>Weekly and monthly performance</CardDescription>
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
                <span className="text-sm text-gray-600">This Week</span>
                <span className="text-lg font-semibold text-green-600">
                  <FormattedPrice amount={stats.weeklyRevenue} restaurantId={restaurant?.id} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-lg font-semibold text-green-600">
                  <FormattedPrice amount={stats.monthlyRevenue} restaurantId={restaurant?.id} />
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Revenue Growth</span>
                <span className={`font-medium ${
                  stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
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
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Menu Overview</CardTitle>
                <CardDescription>Current menu items and categories</CardDescription>
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
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.totalMenuItems}</span>
                </div>
                <Progress value={Math.min((stats.totalMenuItems / 100) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categories</span>
                  <span className="text-lg font-semibold text-purple-600">{stats.totalCategories}</span>
                </div>
                <Progress value={Math.min((stats.totalCategories / 10) * 100, 100)} className="h-2" />
              </div>
            </div>
            
            {/* Menu Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Recent Items</span>
                <span className="text-xs text-gray-500">{stats.totalMenuItems} total</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {menuItemsData?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          <FormattedPrice amount={item.price} restaurantId={restaurant?.id} />
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      {item.category || 'General'}
                    </Badge>
                    </div>
                ))}
                {(!menuItemsData || menuItemsData.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No menu items yet</p>
                  </div>
              )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                <CardDescription>Latest orders and reservations</CardDescription>
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
                recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          activity.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {activity.time}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Reservations */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Reservations</CardTitle>
                <CardDescription>Today's bookings</CardDescription>
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
                <span className="text-sm text-gray-600">Today</span>
                <span className="text-2xl font-bold text-teal-600">{stats.todayReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-semibold text-teal-600">{stats.totalReservations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Staff</CardTitle>
                <CardDescription>Team overview</CardDescription>
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
                <span className="text-sm text-gray-600">Active Staff</span>
                <span className="text-2xl font-bold text-indigo-600">{stats.totalStaff}</span>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(stats.totalStaff, 4) }, (_, i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-indigo-200">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {stats.totalStaff > 4 && (
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
                    <span className="text-xs font-medium text-indigo-700">+{stats.totalStaff - 4}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/orders">
                <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <Receipt className="h-4 w-4 mr-2 text-blue-600" />
                  View Orders
                </Button>
              </Link>
              <Link href="/dashboard/menu">
                <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 transition-colors">
                  <MenuIcon className="h-4 w-4 mr-2 text-purple-600" />
                  Manage Menu
                </Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button variant="outline" className="w-full justify-start hover:bg-orange-50 hover:border-orange-200 transition-colors">
                  <Package className="h-4 w-4 mr-2 text-orange-600" />
                  Check Inventory
                </Button>
              </Link>
              <Link href={`/r/${restaurant?.slug || restaurant?.id}`}>
                <Button variant="outline" className="w-full justify-start hover:bg-teal-50 hover:border-teal-200 transition-colors">
                  <Eye className="h-4 w-4 mr-2 text-teal-600" />
                  View Landing Page
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
