"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useTrialStatus } from "@/hooks/use-trial-status"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Utensils, 
  Calendar, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Printer,
  Menu, 
  X,
  ChefHat,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Bot,
  PackageCheck,
  Receipt,
  Globe,
  LogOut,
  Crown,
  Clock
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "from-blue-500 to-indigo-600" },
  { name: "Orders", href: "/dashboard/orders", icon: Receipt, color: "from-green-500 to-emerald-600" },
  { name: "Menu", href: "/dashboard/menu", icon: Utensils, color: "from-orange-500 to-red-600" },
  { name: "Inventory", href: "/dashboard/inventory", icon: PackageCheck, color: "from-purple-500 to-pink-600" },
  { name: "Reservations", href: "/dashboard/reservations", icon: Calendar, color: "from-indigo-500 to-purple-600" },
  { name: "Staff", href: "/dashboard/staff", icon: Users, color: "from-teal-500 to-cyan-600" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "from-yellow-500 to-orange-600" },
]

interface SidebarProps {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ sidebarCollapsed, setSidebarCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null)
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null)
  const { trialStatus, loading: trialLoading } = useTrialStatus()


  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Get user info from public.users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('first_name, last_name, email')
            .eq('email', user.email)
            .single()

          if (userData) {
            setUserInfo({
              name: `${userData.first_name} ${userData.last_name}`.trim() || user.email?.split('@')[0] || 'Usuario',
              email: userData.email || user.email || 'usuario@tably.com'
            })
          } else {
            // Fallback to auth user data
            setUserInfo({
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
              email: user.email || 'usuario@tably.com'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
        setUserInfo({
          name: 'Usuario',
          email: 'usuario@tably.com'
        })
      }
    }



    const getRestaurantInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Get the restaurant info for the current user from public.users table
          const { data: userData } = await supabase
            .from('users')
            .select('restaurant_id')
            .eq('email', user.email)
            .single()

          if (userData?.restaurant_id) {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('slug')
              .eq('id', userData.restaurant_id)
              .single()

            if (restaurant?.slug) {
              setRestaurantSlug(restaurant.slug)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant info:', error)
      }
    }

    getUserInfo()
    getRestaurantInfo()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }



  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Sidebar Background */}
        <div className="h-full bg-white border-r border-gray-100 shadow-sm">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center">
                <img 
                    src="/tably_logo_completo.png"
                  alt="Tably" 
                  className="h-8 w-auto object-contain"
                />
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <div className="px-3 py-4">
            {/* Main Menu Section */}
            {!sidebarCollapsed && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  Main Menu
                </h3>
              </div>
            )}
            
            <nav className="space-y-1 mb-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-center lg:justify-start space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-gradient-to-r text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } ${isActive ? item.color : ''} ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center justify-center w-6 h-6">
                      <Icon className="h-5 w-5" />
                    </div>
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white space-y-3">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-gray-900 text-white text-sm font-medium">
                  {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {sidebarCollapsed && trialStatus && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{userInfo?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500 truncate mb-2">{userInfo?.email || 'usuario@tably.com'}</p>
                  
                  {/* Trial Status Badge */}
                  <div className="mb-3">
                    {trialLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 rounded-md w-20" />
                    ) : trialStatus ? (
                      <div 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => router.push('/pricing')}
                      >
                        {trialStatus.isExpired ? (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Trial Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {trialStatus.daysRemaining} days left
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Free Trial
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-center lg:justify-start text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 flex items-center"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <LogOut className="h-4 w-4" />
                </div>
                {!sidebarCollapsed && <span className="ml-2">Logout</span>}
              </Button>
            </div>
          </div>

          {/* Other Section */}
          <div className="absolute bottom-40 left-0 right-0 px-3">
            
              <Link
                href="/dashboard/settings"
                className="w-full justify-center lg:justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-3 flex items-center"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <Settings className="h-5 w-5" />
                </div>
                {!sidebarCollapsed && <span className="ml-3">Settings</span>}
              </Link>
              <Link
                href="/dashboard/settings/printer"
                className="w-full justify-center lg:justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-3 flex items-center"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <Printer className="h-5 w-5" />
                </div>
                {!sidebarCollapsed && <span className="ml-3">Printer</span>}
              </Link>

              {restaurantSlug && (
                <a
                  href={`/r/${restaurantSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full justify-center lg:justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-3 flex items-center"
                >
                  <div className="flex items-center justify-center w-6 h-6">
                    <Globe className="h-5 w-5" />
                  </div>
                  {!sidebarCollapsed && <span className="ml-3">View Website</span>}
                </a>
              )}

            </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl pointer-events-none z-30" />
      <div className="fixed top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl pointer-events-none z-30" />
      <div className="fixed bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-3xl pointer-events-none z-30" />
    </>
  )
} 