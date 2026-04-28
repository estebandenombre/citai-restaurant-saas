"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RestaurantConfig } from "@/components/restaurant/restaurant-config"
import { ImageConfig } from "@/components/restaurant/image-config"
import { SettingsTabs } from "@/components/restaurant/settings-tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Table,
  Package,
  CheckCircle,
  AlertCircle,
  Save,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/ui/page-header"
import { useI18n } from "@/components/i18n/i18n-provider"

interface OrderSettings {
  order_enabled: boolean
  pickup_enabled: boolean
  delivery_enabled: boolean
  table_service_enabled: boolean
  require_name: boolean
  require_phone: boolean
  require_email: boolean
  send_confirmation_email: boolean
  require_table_number: boolean
  require_pickup_time: boolean
  require_address: boolean
  require_notes: boolean
  pickup_time_slots: string[]
  max_pickup_advance_hours: number
  min_pickup_advance_minutes: number
  auto_confirm_orders: boolean
  allow_special_instructions: boolean
  tax_enabled: boolean
  tax_rate: number
  tax_name: string
  currency_code: string
  currency_symbol: string
  currency_position: 'before' | 'after'
}

export default function SettingsPage() {
  const { t } = useI18n()
  const [saving, setSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [useDatabase, setUseDatabase] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Default settings
  const [settings, setSettings] = useState<OrderSettings>({
    order_enabled: true,
    pickup_enabled: true,
    delivery_enabled: false,
    table_service_enabled: false,
    require_name: true,
    require_phone: true,
    require_email: false,
    send_confirmation_email: false,
    require_table_number: false,
    require_pickup_time: false,
    require_address: false,
    require_notes: false,
    pickup_time_slots: [],
    max_pickup_advance_hours: 24,
    min_pickup_advance_minutes: 30,
    auto_confirm_orders: false,
    allow_special_instructions: true,
    tax_enabled: false,
    tax_rate: 0,
    tax_name: "Tax",
    currency_code: "USD",
    currency_symbol: "$",
    currency_position: "before",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get restaurant info
        const { restaurant: restaurantData, restaurantId } = await getCurrentUserRestaurant()
        
        if (restaurantData && restaurantId) {
          setRestaurant(restaurantData)
          setRestaurantId(restaurantId)
          console.log('Restaurant found:', restaurantData)
          
          // Try to load settings from database first
          const { data: dbSettings, error: dbError } = await supabase
            .from('order_settings')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .single()

          if (!dbError && dbSettings) {
            console.log('Settings loaded from database:', dbSettings)
            setSettings((prev) => ({
              ...prev,
              ...dbSettings,
            }))
            setUseDatabase(true)
          } else {
            console.log('No database settings found, checking localStorage')
            // Fallback to localStorage
            const savedSettings = localStorage.getItem('orderSettings')
            if (savedSettings) {
              setSettings(JSON.parse(savedSettings))
            }
          }

          // Load restaurant images
          if (restaurantData && typeof restaurantData === 'object' && 'logo_url' in restaurantData) {
            setLogoUrl(restaurantData.logo_url as string)
          }
          if (restaurantData && typeof restaurantData === 'object' && 'cover_image_url' in restaurantData) {
            setCoverImageUrl(restaurantData.cover_image_url as string)
          }
        } else {
          console.log('No restaurant found, using localStorage settings')
          // No restaurant found, use localStorage
          const savedSettings = localStorage.getItem('orderSettings')
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (restaurantId) {
        console.log('Saving settings to database for restaurant:', restaurantId)
        console.log('Settings to save:', settings)
        console.log('Restaurant object:', restaurant)
        
        // Save settings robustly (works whether a row already exists or not).
        const payload = {
          ...settings,
          updated_at: new Date().toISOString(),
        }
        const { data: existingRows, error: existingError } = await supabase
          .from("order_settings")
          .select("id")
          .eq("restaurant_id", restaurantId)
          .limit(1)

        if (existingError) {
          throw existingError
        }

        if (existingRows && existingRows.length > 0) {
          const { error: updateError } = await supabase
            .from("order_settings")
            .update(payload)
            .eq("id", existingRows[0].id)

          if (updateError) throw updateError
        } else {
          const { error: insertError } = await supabase
            .from("order_settings")
            .insert({
              restaurant_id: restaurantId,
              ...payload,
            })

          if (insertError) throw insertError
        }

        console.log('Settings saved successfully to database')
        setUseDatabase(true)
        toast({
          title: t("settings.saveSuccessDb"),
          description: t("settings.saveSuccessDbDesc"),
        })
      } else {
        console.log('No restaurant ID, saving to localStorage')
        // Save to localStorage as fallback
        localStorage.setItem('orderSettings', JSON.stringify(settings))
        
        toast({
          title: "Settings saved to local storage",
          description: "Your order settings have been saved locally.",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      const message = error instanceof Error ? error.message : t("settings.saveErrorDesc")
      toast({
        title: t("settings.saveError"),
        description: `${t("settings.saveErrorDesc")} ${message}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addTimeSlot = () => {
    setSettings({
      ...settings,
      pickup_time_slots: [...settings.pickup_time_slots, ""]
    })
  }

  const removeTimeSlot = (index: number) => {
    setSettings({
      ...settings,
      pickup_time_slots: settings.pickup_time_slots.filter((_, i) => i !== index)
    })
  }

  const updateTimeSlot = (index: number, value: string) => {
    setSettings({
      ...settings,
      pickup_time_slots: settings.pickup_time_slots.map((slot, i) => i === index ? value : slot)
    })
  }

  const handleLogoChange = (url: string | null) => {
    setLogoUrl(url)
  }

  const handleCoverImageChange = (url: string | null) => {
    setCoverImageUrl(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-lg" />
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title={t("settings.pageTitle")}
        description={t("settings.pageDescription")}
        icon={Settings}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Settings Tabs */}
        <SettingsTabs
          settings={settings}
          setSettings={setSettings}
          restaurant={restaurant}
          logoUrl={logoUrl}
          coverImageUrl={coverImageUrl}
          onLogoChange={handleLogoChange}
          onCoverImageChange={handleCoverImageChange}
          saving={saving}
          onSave={handleSave}
        />
      </div>
    </div>
  )
} 