"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Bot, 
  Settings, 
  Clock, 
  Phone, 
  Save, 
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Users,
  ShoppingCart,
  Truck,
  MapPin,
  FileText
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

interface WhatsAppConfig {
  enabled: boolean
  phone_number: string | null
  business_name: string | null
  welcome_message: string
  ai_enabled: boolean
  auto_confirm_orders: boolean
  send_order_confirmation: boolean
  send_status_updates: boolean
  business_hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  menu_display: {
    show_prices: boolean
    show_descriptions: boolean
    show_images: boolean
    group_by_category: boolean
  }
  order_settings: {
    require_name: boolean
    require_phone: boolean
    require_address: boolean
    allow_special_instructions: boolean
    pickup_enabled: boolean
    delivery_enabled: boolean
    min_order_amount: number
    delivery_fee: number
  }
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

export function WhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    enabled: false,
    phone_number: null,
    business_name: null,
    welcome_message: "Hello! Welcome to our restaurant. How can I help you?",
    ai_enabled: true,
    auto_confirm_orders: false,
    send_order_confirmation: true,
    send_status_updates: true,
    business_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    menu_display: {
      show_prices: true,
      show_descriptions: true,
      show_images: false,
      group_by_category: true
    },
    order_settings: {
      require_name: true,
      require_phone: true,
      require_address: false,
      allow_special_instructions: true,
      pickup_enabled: true,
      delivery_enabled: false,
      min_order_amount: 0,
      delivery_fee: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const { restaurantId: userRestaurantId } = await getCurrentUserRestaurant()
      
      if (!userRestaurantId) {
                 toast({
           title: "Error",
           description: "Restaurant not found",
           variant: "destructive"
         })
        return
      }

      setRestaurantId(userRestaurantId)

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('whatsapp_config')
        .eq('id', userRestaurantId)
        .single()

      if (error) {
        console.error('Error fetching WhatsApp config:', error)
        return
      }

      if (restaurant?.whatsapp_config) {
        setConfig(restaurant.whatsapp_config)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
             toast({
         title: "Error",
         description: "Error loading configuration",
         variant: "destructive"
       })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!restaurantId) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          whatsapp_config: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId)

      if (error) {
        throw error
      }

             toast({
         title: "Configuration saved",
         description: "WhatsApp configuration has been saved successfully",
       })
    } catch (error) {
      console.error('Error saving config:', error)
             toast({
         title: "Error",
         description: "Error saving configuration",
         variant: "destructive"
       })
    } finally {
      setSaving(false)
    }
  }

  const copyWebhookUrl = () => {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook/${restaurantId}`
    navigator.clipboard.writeText(webhookUrl)
         toast({
       title: "URL copied",
       description: "Webhook URL has been copied to clipboard",
     })
  }

  const updateBusinessHours = (day: string, field: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
                     <CardTitle className="flex items-center gap-2">
             <MessageSquare className="h-5 w-5" />
             WhatsApp Configuration
           </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuración Principal */}
      <Card>
        <CardHeader>
                     <CardTitle className="flex items-center gap-2">
             <MessageSquare className="h-5 w-5" />
             WhatsApp Business Configuration
           </CardTitle>
           <CardDescription>
             Configure your WhatsApp Business integration with AI bot to automatically receive orders
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado General */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                             <div>
                 <p className="font-medium">WhatsApp Status</p>
                 <p className="text-sm text-gray-600">
                   {config.enabled ? 'Enabled' : 'Disabled'}
                 </p>
               </div>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {/* Información Básica */}
          <div className="space-y-4">
                         <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                                 <Label htmlFor="phone_number">WhatsApp Number *</Label>
                <Input
                  id="phone_number"
                  value={config.phone_number || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+1234567890"
                  disabled={!config.enabled}
                />
                                 <p className="text-xs text-gray-500 mt-1">
                   Verified WhatsApp Business number
                 </p>
              </div>
              
              <div>
                                 <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={config.business_name || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, business_name: e.target.value }))}
                                     placeholder="Your restaurant name"
                  disabled={!config.enabled}
                />
              </div>
            </div>

            <div>
                             <Label htmlFor="welcome_message">Welcome Message</Label>
              <Textarea
                id="welcome_message"
                value={config.welcome_message}
                onChange={(e) => setConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                                 placeholder="Message that customers will see when starting a conversation"
                rows={3}
                disabled={!config.enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Configuración de IA */}
          <div className="space-y-4">
                         <h3 className="text-lg font-medium flex items-center gap-2">
               <Bot className="h-5 w-5" />
               AI Configuration
             </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-500" />
                  <div>
                                       <p className="font-medium">AI Bot with DeepSeek</p>
                   <p className="text-sm text-gray-600">
                     The bot uses AI to understand orders and answer questions
                   </p>
                  </div>
                </div>
                <Switch
                  checked={config.ai_enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ai_enabled: checked }))}
                  disabled={!config.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                                       <p className="font-medium">Auto Confirmation</p>
                   <p className="text-sm text-gray-600">
                     Automatically confirm orders without manual intervention
                   </p>
                  </div>
                </div>
                <Switch
                  checked={config.auto_confirm_orders}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_confirm_orders: checked }))}
                  disabled={!config.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                                       <p className="font-medium">Order Confirmation</p>
                   <p className="text-sm text-gray-600">
                     Send automatic confirmation when an order is received
                   </p>
                  </div>
                </div>
                <Switch
                  checked={config.send_order_confirmation}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, send_order_confirmation: checked }))}
                  disabled={!config.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div>
                                       <p className="font-medium">Status Updates</p>
                   <p className="text-sm text-gray-600">
                     Notify order status changes to the customer
                   </p>
                  </div>
                </div>
                <Switch
                  checked={config.send_status_updates}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, send_status_updates: checked }))}
                  disabled={!config.enabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Horarios de Atención */}
          <div className="space-y-4">
                         <h3 className="text-lg font-medium flex items-center gap-2">
               <Clock className="h-5 w-5" />
               Business Hours
             </h3>
            
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-20">
                    <p className="font-medium">{day.label}</p>
                  </div>
                  
                  <Switch
                    checked={!config.business_hours[day.key].closed}
                    onCheckedChange={(checked) => updateBusinessHours(day.key, 'closed', !checked)}
                    disabled={!config.enabled}
                  />
                  
                  {!config.business_hours[day.key].closed && (
                    <>
                      <Input
                        type="time"
                        value={config.business_hours[day.key].open}
                        onChange={(e) => updateBusinessHours(day.key, 'open', e.target.value)}
                        className="w-24"
                        disabled={!config.enabled}
                      />
                      <span className="text-gray-500">a</span>
                      <Input
                        type="time"
                        value={config.business_hours[day.key].close}
                        onChange={(e) => updateBusinessHours(day.key, 'close', e.target.value)}
                        className="w-24"
                        disabled={!config.enabled}
                      />
                    </>
                  )}
                  
                                     {config.business_hours[day.key].closed && (
                     <span className="text-gray-500">Closed</span>
                   )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Configuración de Pedidos */}
          <div className="space-y-4">
                         <h3 className="text-lg font-medium flex items-center gap-2">
               <ShoppingCart className="h-5 w-5" />
               Order Settings
             </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                   <Label>Pickup</Label>
                  <Switch
                    checked={config.order_settings.pickup_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      order_settings: { ...prev.order_settings, pickup_enabled: checked }
                    }))}
                    disabled={!config.enabled}
                  />
                </div>
                
                                 <div className="flex items-center justify-between">
                   <Label>Delivery</Label>
                  <Switch
                    checked={config.order_settings.delivery_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      order_settings: { ...prev.order_settings, delivery_enabled: checked }
                    }))}
                    disabled={!config.enabled}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                                 <div>
                   <Label htmlFor="min_order">Minimum Order ($)</Label>
                  <Input
                    id="min_order"
                    type="number"
                    value={config.order_settings.min_order_amount}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      order_settings: { ...prev.order_settings, min_order_amount: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                    disabled={!config.enabled}
                  />
                </div>
                
                                 <div>
                   <Label htmlFor="delivery_fee">Delivery Fee ($)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    value={config.order_settings.delivery_fee}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      order_settings: { ...prev.order_settings, delivery_fee: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                    disabled={!config.enabled || !config.order_settings.delivery_enabled}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información de Webhook */}
          {config.enabled && restaurantId && (
            <div className="space-y-4">
                           <h3 className="text-lg font-medium flex items-center gap-2">
               <Settings className="h-5 w-5" />
               Webhook Configuration
             </h3>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                                     <p className="font-medium text-blue-900">Webhook URL</p>
                </div>
                                 <p className="text-sm text-blue-700 mb-3">
                   Configure this URL in your WhatsApp Business application to receive messages:
                 </p>
                
                <div className="flex items-center gap-2">
                  <Input
                    value={`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook/${restaurantId}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyWebhookUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3">
                         <Button
               variant="outline"
               onClick={fetchConfig}
               disabled={saving}
             >
               Cancel
             </Button>
            <Button
              onClick={saveConfig}
              disabled={saving || !config.enabled}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                     Saving...
                </>
              ) : (
                                 <>
                   <Save className="h-4 w-4 mr-2" />
                   Save Configuration
                 </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
