"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RestaurantConfig } from "@/components/restaurant/restaurant-config"
import { ImageConfig } from "@/components/restaurant/image-config"
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


interface OrderSettings {
  order_enabled: boolean
  pickup_enabled: boolean
  delivery_enabled: boolean
  table_service_enabled: boolean
  require_name: boolean
  require_phone: boolean
  require_email: boolean
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
  const [saving, setSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
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
        const { restaurant: userRestaurant } = await getCurrentUserRestaurant()
        setRestaurant(userRestaurant)
        
        // Set image URLs
        setLogoUrl(userRestaurant?.logo_url || null)
        setCoverImageUrl(userRestaurant?.cover_image_url || null)

        if (userRestaurant && typeof userRestaurant === 'object' && 'id' in userRestaurant) {
          console.log('Loading settings for restaurant:', userRestaurant.id)
          
          // Try to load from database
          const { data: dbSettings, error } = await supabase
            .from("order_settings")
            .select("*")
            .eq("restaurant_id", userRestaurant.id)
            .single()

          console.log('Database query result:', { dbSettings, error })

          if (dbSettings && !error) {
            console.log('Settings loaded from database:', dbSettings)
            setSettings(dbSettings)
            setUseDatabase(true)
            toast({
              title: "Settings loaded from database",
              description: "Your order settings have been loaded from the database.",
            })
          } else {
            console.log('No database settings found, using defaults')
            // Create default settings in database
            const defaultSettings = {
              restaurant_id: userRestaurant.id,
              ...settings
            }
            
            const { data: newSettings, error: insertError } = await supabase
              .from("order_settings")
              .insert(defaultSettings)
              .select()
              .single()

            if (newSettings && !insertError) {
              console.log('Default settings created in database:', newSettings)
              setSettings(newSettings)
              setUseDatabase(true)
              toast({
                title: "Default settings created",
                description: "Default order settings have been created in the database.",
              })
            } else {
              console.log('Failed to create database settings, using localStorage')
              // Fallback to localStorage
              const savedSettings = localStorage.getItem('orderSettings')
              if (savedSettings) {
                setSettings(JSON.parse(savedSettings))
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('orderSettings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleLogoChange = async (url: string | null) => {
    if (!restaurant) return
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ logo_url: url })
        .eq('id', restaurant.id)
      
      if (error) throw error
      
      setLogoUrl(url)
      toast({
        title: "Logo updated",
        description: "Your restaurant logo has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating logo:', error)
      toast({
        title: "Error",
        description: "Failed to update logo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCoverImageChange = async (url: string | null) => {
    if (!restaurant) return
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ cover_image_url: url })
        .eq('id', restaurant.id)
      
      if (error) throw error
      
      setCoverImageUrl(url)
      toast({
        title: "Hero image updated",
        description: "Your restaurant hero image has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating hero image:', error)
      toast({
        title: "Error",
        description: "Failed to update hero image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (restaurant && typeof restaurant === 'object' && 'id' in restaurant) {
        console.log('Saving settings to database for restaurant:', restaurant.id)
        console.log('Settings to save:', settings)
        console.log('Restaurant object:', restaurant)
        
        // Prepare data for database
        const dataToSave = {
          restaurant_id: restaurant.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }
        console.log('Data to save:', dataToSave)
        
        // Save to database
        const { data, error } = await supabase
          .from("order_settings")
          .upsert(dataToSave)
          .select()

        console.log('Database save result:', { data, error })

        if (error) {
          console.error('Database save error:', error)
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw error
        }

        console.log('Settings saved successfully to database')
        setUseDatabase(true)
        toast({
          title: "Settings saved successfully",
          description: "Your order settings have been updated in the database.",
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
      toast({
        title: "Error saving settings",
        description: "Please try again.",
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



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Types Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup Settings Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-36" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            </div>

            {/* Order Processing Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-36" />
                </div>
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              </div>
            </div>

            {/* Tax Configuration Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-36" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-px w-full my-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Skeleton className="h-10 w-48 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
          </div>

          {/* Preview Card */}
          <div className="mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-1">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-3 w-24" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
            <div className="flex items-center justify-center w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg">
              <Settings className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Restaurant Settings
              </h1>
              <p className="text-gray-500 text-sm">
                Configure your restaurant's order preferences and business rules
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Configuration */}
      <RestaurantConfig />

      {/* Image Configuration */}
      {restaurant && (
        <ImageConfig
          logoUrl={logoUrl}
          coverImageUrl={coverImageUrl}
          onLogoChange={handleLogoChange}
          onCoverImageChange={handleCoverImageChange}
          restaurantId={restaurant.id}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Order Types</span>
            </CardTitle>
            <CardDescription>
              Enable or disable different order methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Enable Orders</Label>
                <p className="text-sm text-slate-500">Allow customers to place orders</p>
              </div>
              <Switch
                checked={settings.order_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, order_enabled: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Pickup Orders</Label>
                <p className="text-sm text-slate-500">Customers pick up at counter</p>
              </div>
              <Switch
                checked={settings.pickup_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, pickup_enabled: checked })}
                disabled={!settings.order_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Delivery Orders</Label>
                <p className="text-sm text-slate-500">Deliver to customer address</p>
              </div>
              <Switch
                checked={settings.delivery_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, delivery_enabled: checked })}
                disabled={!settings.order_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Table Service</Label>
                <p className="text-sm text-slate-500">Waiters serve at tables</p>
              </div>
              <Switch
                checked={settings.table_service_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, table_service_enabled: checked })}
                disabled={!settings.order_enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Customer Information</span>
            </CardTitle>
            <CardDescription>
              Choose what customer data to collect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Name</Label>
                <p className="text-sm text-slate-500">Customer's full name</p>
              </div>
              <Switch
                checked={settings.require_name}
                onCheckedChange={(checked) => setSettings({ ...settings, require_name: checked })}
                disabled={!settings.order_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Phone Number</Label>
                <p className="text-sm text-slate-500">Contact number</p>
              </div>
              <Switch
                checked={settings.require_phone}
                onCheckedChange={(checked) => setSettings({ ...settings, require_phone: checked })}
                disabled={!settings.order_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Email</Label>
                <p className="text-sm text-slate-500">Email address</p>
              </div>
              <Switch
                checked={settings.require_email}
                onCheckedChange={(checked) => setSettings({ ...settings, require_email: checked })}
                disabled={!settings.order_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Table Number</Label>
                <p className="text-sm text-slate-500">For table service</p>
              </div>
              <Switch
                checked={settings.require_table_number}
                onCheckedChange={(checked) => setSettings({ ...settings, require_table_number: checked })}
                disabled={!settings.order_enabled || !settings.table_service_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Pickup Time</Label>
                <p className="text-sm text-slate-500">When to pick up order</p>
              </div>
              <Switch
                checked={settings.require_pickup_time}
                onCheckedChange={(checked) => setSettings({ ...settings, require_pickup_time: checked })}
                disabled={!settings.order_enabled || !settings.pickup_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Delivery Address</Label>
                <p className="text-sm text-slate-500">For delivery orders</p>
              </div>
              <Switch
                checked={settings.require_address}
                onCheckedChange={(checked) => setSettings({ ...settings, require_address: checked })}
                disabled={!settings.order_enabled || !settings.delivery_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Special Instructions</Label>
                <p className="text-sm text-slate-500">Additional notes</p>
              </div>
              <Switch
                checked={settings.allow_special_instructions}
                onCheckedChange={(checked) => setSettings({ ...settings, allow_special_instructions: checked })}
                disabled={!settings.order_enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pickup Settings */}
        {settings.pickup_enabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pickup Settings</span>
              </CardTitle>
              <CardDescription>
                Configure pickup time options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Maximum Advance Hours</Label>
                <Input
                  type="number"
                  value={settings.max_pickup_advance_hours}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    max_pickup_advance_hours: parseInt(e.target.value) || 24 
                  })}
                  min="1"
                  max="168"
                />
                <p className="text-xs text-slate-500">How far in advance customers can order</p>
              </div>

              <div className="space-y-2">
                <Label>Minimum Advance Minutes</Label>
                <Input
                  type="number"
                  value={settings.min_pickup_advance_minutes}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    min_pickup_advance_minutes: parseInt(e.target.value) || 30 
                  })}
                  min="0"
                  max="120"
                />
                <p className="text-xs text-slate-500">Minimum time before pickup</p>
              </div>

              <div className="space-y-2">
                <Label>Time Slots</Label>
                <div className="space-y-2">
                  {settings.pickup_time_slots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={slot}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="w-full"
                  >
                    Add Time Slot
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Available pickup times (leave empty for any time)</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order Processing</span>
            </CardTitle>
            <CardDescription>
              Configure order confirmation and processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Auto-Confirm Orders</Label>
                <p className="text-sm text-slate-500">Automatically confirm new orders</p>
              </div>
              <Switch
                checked={settings.auto_confirm_orders}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_confirm_orders: checked })}
                disabled={!settings.order_enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Tax Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure tax settings for orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Enable Tax</Label>
                <p className="text-sm text-slate-500">Add tax to order totals</p>
              </div>
              <Switch
                checked={settings.tax_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, tax_enabled: checked })}
                disabled={!settings.order_enabled}
              />
            </div>

            {settings.tax_enabled && (
              <>
                <Separator />
                
                <div className="space-y-2">
                  <Label>Tax Name</Label>
                  <Input
                    type="text"
                    value={settings.tax_name}
                    onChange={(e) => setSettings({ ...settings, tax_name: e.target.value })}
                    placeholder="e.g., Sales Tax, VAT, GST"
                  />
                  <p className="text-xs text-slate-500">Name that will appear on receipts</p>
                </div>

                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.tax_rate}
                    onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="8.5"
                  />
                  <p className="text-xs text-slate-500">Tax rate as a percentage (e.g., 8.5 for 8.5%)</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-2">Tax Preview</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>$100.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{settings.tax_name}:</span>
                      <span>${((100 * settings.tax_rate) / 100).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium text-gray-900">
                      <span>Total:</span>
                      <span>${(100 + (100 * settings.tax_rate) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Configuration Preview</span>
          </CardTitle>
          <CardDescription>
            How your order form will appear to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant={settings.order_enabled ? "default" : "secondary"}>
                {settings.order_enabled ? "Orders Enabled" : "Orders Disabled"}
              </Badge>
              {settings.pickup_enabled && <Badge variant="outline">Pickup</Badge>}
              {settings.delivery_enabled && <Badge variant="outline">Delivery</Badge>}
              {settings.table_service_enabled && <Badge variant="outline">Table Service</Badge>}
            </div>
            
            <div className="text-sm text-slate-600">
              <p><strong>Required fields:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {settings.require_name && <li>Name</li>}
                {settings.require_phone && <li>Phone Number</li>}
                {settings.require_email && <li>Email</li>}
                {settings.require_table_number && <li>Table Number</li>}
                {settings.require_pickup_time && <li>Pickup Time</li>}
                {settings.require_address && <li>Delivery Address</li>}
                {settings.allow_special_instructions && <li>Special Instructions (optional)</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 