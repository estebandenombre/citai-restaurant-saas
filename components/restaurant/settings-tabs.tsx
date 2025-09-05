"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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
  Send,
  Image as ImageIcon,
  Store,
  Building2,
  Truck,
  Calendar,
  FileText,
  Globe,
  Palette,
  Bell,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RestaurantConfig } from "./restaurant-config"
import { ImageConfig } from "./image-config"

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

interface SettingsTabsProps {
  settings: OrderSettings
  setSettings: (settings: OrderSettings) => void
  restaurant: any
  logoUrl: string | null
  coverImageUrl: string | null
  onLogoChange: (url: string | null) => void
  onCoverImageChange: (url: string | null) => void
  saving: boolean
  onSave: () => void
}

export function SettingsTabs({
  settings,
  setSettings,
  restaurant,
  logoUrl,
  coverImageUrl,
  onLogoChange,
  onCoverImageChange,
  saving,
  onSave
}: SettingsTabsProps) {
  const { toast } = useToast()

  // Helper function to get active order types count
  const getActiveOrderTypes = () => {
    let count = 0
    if (settings.pickup_enabled) count++
    if (settings.delivery_enabled) count++
    if (settings.table_service_enabled) count++
    return count
  }

  // Helper function to get required customer fields count
  const getRequiredFieldsCount = () => {
    let count = 0
    if (settings.require_name) count++
    if (settings.require_phone) count++
    if (settings.require_email) count++
    if (settings.require_table_number) count++
    if (settings.require_pickup_time) count++
    if (settings.require_address) count++
    return count
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-14">
          <TabsTrigger value="general" className="flex flex-col items-center gap-1 py-2">
            <Building2 className="h-5 w-5" />
            <span className="text-xs">General</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {getActiveOrderTypes() > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {getActiveOrderTypes()}
                </Badge>
              )}
            </div>
            <span className="text-xs">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex flex-col items-center gap-1 py-2">
            <div className="relative">
              <User className="h-5 w-5" />
              {getRequiredFieldsCount() > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {getRequiredFieldsCount()}
                </Badge>
              )}
            </div>
            <span className="text-xs">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col items-center gap-1 py-2">
            <Palette className="h-5 w-5" />
            <span className="text-xs">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RestaurantConfig />
            
            {/* Quick Stats Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Settings className="h-5 w-5" />
                  <span>Quick Overview</span>
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Current configuration summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{getActiveOrderTypes()}</div>
                    <div className="text-sm text-blue-700">Order Types</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{getRequiredFieldsCount()}</div>
                    <div className="text-sm text-blue-700">Required Fields</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Orders Enabled</span>
                    <Badge variant={settings.order_enabled ? "default" : "secondary"}>
                      {settings.order_enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Email Confirmations</span>
                    <Badge variant={settings.send_confirmation_email ? "default" : "secondary"}>
                      {settings.send_confirmation_email ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Tax Collection</span>
                    <Badge variant={settings.tax_enabled ? "default" : "secondary"}>
                      {settings.tax_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Settings Tab */}
        <TabsContent value="orders" className="space-y-6 mt-6">
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-green-600" />
                        <Label className="text-base font-medium">Pickup Orders</Label>
                      </div>
                      <p className="text-sm text-slate-500">Customers pick up at counter</p>
                    </div>
                    <Switch
                      checked={settings.pickup_enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, pickup_enabled: checked })}
                      disabled={!settings.order_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <Label className="text-base font-medium">Delivery Orders</Label>
                      </div>
                      <p className="text-sm text-slate-500">Deliver to customer address</p>
                    </div>
                    <Switch
                      checked={settings.delivery_enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, delivery_enabled: checked })}
                      disabled={!settings.order_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4 text-purple-600" />
                        <Label className="text-base font-medium">Table Service</Label>
                      </div>
                      <p className="text-sm text-slate-500">Waiters serve at tables</p>
                    </div>
                    <Switch
                      checked={settings.table_service_enabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, table_service_enabled: checked })}
                      disabled={!settings.order_enabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Processing</span>
                </CardTitle>
                <CardDescription>
                  Configure how orders are handled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <Label className="text-base font-medium">Auto-confirm Orders</Label>
                    </div>
                    <p className="text-sm text-slate-500">Automatically confirm new orders</p>
                  </div>
                  <Switch
                    checked={settings.auto_confirm_orders}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_confirm_orders: checked })}
                    disabled={!settings.order_enabled}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <Label className="text-base font-medium">Special Instructions</Label>
                    </div>
                    <p className="text-sm text-slate-500">Allow customers to add notes</p>
                  </div>
                  <Switch
                    checked={settings.allow_special_instructions}
                    onCheckedChange={(checked) => setSettings({ ...settings, allow_special_instructions: checked })}
                    disabled={!settings.order_enabled}
                  />
                </div>

                {/* Pickup Time Settings */}
                {settings.pickup_enabled && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <Label className="text-sm font-medium text-green-800">Pickup Time Settings</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-green-700">Max Advance (hours)</Label>
                        <Input
                          type="number"
                          value={settings.max_pickup_advance_hours}
                          onChange={(e) => setSettings({ ...settings, max_pickup_advance_hours: parseInt(e.target.value) || 24 })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-green-700">Min Advance (minutes)</Label>
                        <Input
                          type="number"
                          value={settings.min_pickup_advance_minutes}
                          onChange={(e) => setSettings({ ...settings, min_pickup_advance_minutes: parseInt(e.target.value) || 30 })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Settings Tab */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <Label className="text-base font-medium">Name</Label>
                      </div>
                      <p className="text-sm text-slate-500">Customer's full name</p>
                    </div>
                    <Switch
                      checked={settings.require_name}
                      onCheckedChange={(checked) => setSettings({ ...settings, require_name: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <Label className="text-base font-medium">Phone Number</Label>
                      </div>
                      <p className="text-sm text-slate-500">Contact number</p>
                    </div>
                    <Switch
                      checked={settings.require_phone}
                      onCheckedChange={(checked) => setSettings({ ...settings, require_phone: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <Label className="text-base font-medium">Email</Label>
                        {settings.require_email && settings.send_confirmation_email && (
                          <Badge variant="secondary" className="text-xs">
                            <Send className="h-3 w-3 mr-1" />
                            Auto confirmation
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">Email address</p>
                    </div>
                    <Switch
                      checked={settings.require_email}
                      onCheckedChange={(checked) => {
                        const newSettings = { ...settings, require_email: checked }
                        if (!checked) {
                          newSettings.send_confirmation_email = false
                        } else {
                          newSettings.send_confirmation_email = true
                        }
                        setSettings(newSettings)
                      }}
                    />
                  </div>

                  {/* Email confirmation option - only show when email is enabled */}
                  {settings.require_email && (
                    <div className="flex items-center justify-between pl-6 border-l-2 border-purple-200 bg-purple-50 p-3 rounded-r-lg animate-in slide-in-from-left-2 duration-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4 text-purple-600" />
                          <Label className="text-sm font-medium text-purple-900">Send confirmation email</Label>
                        </div>
                        <p className="text-xs text-purple-700">
                          {settings.send_confirmation_email 
                            ? "Automatic email when order is created" 
                            : "Customers will provide email but no confirmation will be sent"
                          }
                        </p>
                      </div>
                      <Switch
                        checked={settings.send_confirmation_email}
                        onCheckedChange={(checked) => setSettings({ ...settings, send_confirmation_email: checked })}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4 text-orange-600" />
                        <Label className="text-base font-medium">Table Number</Label>
                      </div>
                      <p className="text-sm text-slate-500">For table service</p>
                    </div>
                    <Switch
                      checked={settings.require_table_number}
                      onCheckedChange={(checked) => setSettings({ ...settings, require_table_number: checked })}
                      disabled={!settings.table_service_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <Label className="text-base font-medium">Pickup Time</Label>
                      </div>
                      <p className="text-sm text-slate-500">When to pick up order</p>
                    </div>
                    <Switch
                      checked={settings.require_pickup_time}
                      onCheckedChange={(checked) => setSettings({ ...settings, require_pickup_time: checked })}
                      disabled={!settings.pickup_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <Label className="text-base font-medium">Delivery Address</Label>
                      </div>
                      <p className="text-sm text-slate-500">For delivery orders</p>
                    </div>
                    <Switch
                      checked={settings.require_address}
                      onCheckedChange={(checked) => setSettings({ ...settings, require_address: checked })}
                      disabled={!settings.delivery_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <Label className="text-base font-medium">Special Instructions</Label>
                      </div>
                      <p className="text-sm text-slate-500">Additional notes</p>
                    </div>
                    <Switch
                      checked={settings.allow_special_instructions}
                      onCheckedChange={(checked) => setSettings({ ...settings, allow_special_instructions: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax & Currency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Tax & Currency</span>
                </CardTitle>
                <CardDescription>
                  Configure tax and currency settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      <Label className="text-base font-medium">Enable Tax</Label>
                    </div>
                    <p className="text-sm text-slate-500">Add tax to orders</p>
                  </div>
                  <Switch
                    checked={settings.tax_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, tax_enabled: checked })}
                  />
                </div>

                {settings.tax_enabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-red-200 bg-red-50 p-4 rounded-r-lg">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-red-800">Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={settings.tax_rate}
                        onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max="100"
                        className="border-red-300 focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-red-800">Tax Name</Label>
                      <Input
                        value={settings.tax_name}
                        onChange={(e) => setSettings({ ...settings, tax_name: e.target.value })}
                        placeholder="Tax"
                        className="border-red-300 focus:border-red-500"
                      />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Currency Code</Label>
                    <Input
                      value={settings.currency_code}
                      onChange={(e) => setSettings({ ...settings, currency_code: e.target.value })}
                      placeholder="USD"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Currency Symbol</Label>
                    <Input
                      value={settings.currency_symbol}
                      onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                      placeholder="$"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Currency Position</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.currency_position === 'before' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings({ ...settings, currency_position: 'before' })}
                      >
                        Before ($10)
                      </Button>
                      <Button
                        variant={settings.currency_position === 'after' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings({ ...settings, currency_position: 'after' })}
                      >
                        After (10€)
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Appearance Settings Tab */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          {restaurant && (
            <ImageConfig
              logoUrl={logoUrl}
              coverImageUrl={coverImageUrl}
              onLogoChange={onLogoChange}
              onCoverImageChange={onCoverImageChange}
              restaurantId={restaurant.id}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Save Button - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 mt-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {saving ? "Saving changes..." : "Unsaved changes"}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
