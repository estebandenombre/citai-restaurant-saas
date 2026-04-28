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
  Utensils, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Receipt,
  Globe,
  LogOut,
  Crown,
  Clock,
} from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { LocaleSwitcher } from "@/components/locale-switcher"

import type { LucideIcon } from "lucide-react"

const navigation: { href: string; icon: LucideIcon; messageKey: string }[] = [
  { messageKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { messageKey: "orders", href: "/dashboard/orders", icon: Receipt },
  { messageKey: "menu", href: "/dashboard/menu", icon: Utensils },
  { messageKey: "inventory", href: "/dashboard/inventory", icon: PackageCheck },
  { messageKey: "reservations", href: "/dashboard/reservations", icon: Calendar },
  { messageKey: "staff", href: "/dashboard/staff", icon: Users },
  { messageKey: "analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { messageKey: "websitePreview", href: "/dashboard/website-preview", icon: Globe },
]

interface SidebarProps {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ sidebarCollapsed, setSidebarCollapsed }: SidebarProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null)
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null)
  const [restaurantName, setRestaurantName] = useState<string>("")
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
              email: userData.email || user.email || 'info@tably.digital'
            })
          } else {
            // Fallback to auth user data
            setUserInfo({
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
              email: user.email || 'info@tably.digital'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
        setUserInfo({
          name: 'Usuario',
          email: 'info@tably.digital'
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
              .select('slug, name')
              .eq('id', userData.restaurant_id)
              .single()

            if (restaurant?.slug) {
              setRestaurantSlug(restaurant.slug)
              setRestaurantName(restaurant.name || "")
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
        <div className="h-full bg-card border-r border-border">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center">
                <img 
                    src="/tably_logo_completo.png"
                  alt="Tably" 
                  className="h-6 w-auto object-contain"
                />
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <div className="px-2.5 py-3 flex flex-col h-full">
            {/* Main Menu Section */}
            <LocaleSwitcher collapsed={sidebarCollapsed} className="mb-3" />

            {!sidebarCollapsed && (
              <div className="mb-4">
                <h3 className="mb-2 px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  {t("nav.mainMenu")}
                </h3>
              </div>
            )}

            <nav className="mb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                const label = t(`nav.items.${item.messageKey}` as const)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-center lg:justify-start space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-muted text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center justify-center w-6 h-6">
                      <Icon className="h-5 w-5" />
                    </div>
                    {!sidebarCollapsed && <span className="text-sm">{label}</span>}
                  </Link>
                )
              })}
            </nav>

            {/* General Section */}
            {!sidebarCollapsed && (
              <div className="mb-4">
                <h3 className="mb-2 px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  {t("nav.general")}
                </h3>
              </div>
            )}
            <div className="space-y-1 mb-6">
              <Link
                href="/dashboard/settings"
                className="w-full justify-center lg:justify-start text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl px-3 py-2.5 flex items-center"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <Settings className="h-5 w-5" />
                </div>
                {!sidebarCollapsed && <span className="ml-3 text-sm">{t("nav.settings")}</span>}
              </Link>
              
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-center lg:justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-3 py-2.5 flex items-center"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <LogOut className="h-5 w-5" />
                </div>
                {!sidebarCollapsed && <span className="ml-3 text-sm">{t("nav.logout")}</span>}
              </Button>
            </div>
            
            {/* Spacer to push user info to bottom */}
            <div className="flex-1" />
            
            {/* User Info Section */}
            <div className="p-4 border-t border-border bg-card">
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-foreground text-background text-sm font-medium">
                      {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarCollapsed && trialStatus && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 rounded-full border-2 border-card bg-emerald-600" />
                    </div>
                  )}
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{userInfo?.name || 'Usuario'}</p>
                      <p className="text-xs text-muted-foreground truncate mb-2">{userInfo?.email || 'info@tably.digital'}</p>
                      
                      {/* Trial Status Badge */}
                      <div className="mb-3">
                        {trialLoading ? (
                          <div className="animate-pulse bg-muted h-6 rounded-md w-20" />
                        ) : trialStatus ? (
                          <div 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => router.push('/pricing')}
                          >
                            {trialStatus.isExpired ? (
                              <Badge variant="destructive" className="text-xs">
                                <Clock className="mr-1 h-3 w-3" />
                                {t("nav.trialExpired")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="mr-1 h-3 w-3" />
                                {t("nav.daysLeft", { n: trialStatus.daysRemaining })}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {t("nav.freeTrial")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Update Plan Button */}
                {!sidebarCollapsed && (
                  <Button
                    onClick={() => router.push('/pricing')}
                    className="w-full text-xs font-medium py-2 px-3 rounded-xl"
                  >
                    <Crown className="mr-2 h-3 w-3" />
                    {t("nav.updatePlan")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
} 