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
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Palette
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { getCurrentUserRestaurant } from '@/lib/auth-utils'

interface RestaurantConfig {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  cover_image_url: string | null
  cuisine_type: string | null
  opening_hours: any
  social_media: any
  theme_colors: any
  currency_config: any
  is_active: boolean
  printer_config: any
}

export function RestaurantConfig() {
  const [restaurant, setRestaurant] = useState<RestaurantConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    cuisine_type: '',
    is_active: true,
    theme_colors: {
      primary: '#2563eb',
      secondary: '#64748b'
    },
    opening_hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
         social_media: {
       facebook: '',
       instagram: '',
       twitter: '',
       tiktok: ''
     },
     currency_config: {
       currency: 'USD',
       position: 'before'
     },
     printer_config: {
      enabled: false,
      auto_cut: true,
      print_logo: true,
      printer_ip: null,
      footer_text: "Thank you for your order!",
      header_text: null,
      paper_width: 80,
      printer_name: null,
      printer_port: 9100,
      printer_type: "thermal"
    }
  })

  useEffect(() => {
    fetchRestaurantData()
  }, [])

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      const { restaurant: userRestaurant } = await getCurrentUserRestaurant()
      
      if (userRestaurant) {
        setRestaurant(userRestaurant)
        setFormData({
          name: userRestaurant.name || '',
          description: userRestaurant.description || '',
          address: userRestaurant.address || '',
          phone: userRestaurant.phone || '',
          email: userRestaurant.email || '',
          website: userRestaurant.website || '',
          cuisine_type: userRestaurant.cuisine_type || '',
          is_active: userRestaurant.is_active ?? true,
          theme_colors: userRestaurant.theme_colors || { primary: '#2563eb', secondary: '#64748b' },
          opening_hours: userRestaurant.opening_hours || {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '09:00', close: '17:00', closed: true }
          },
                     social_media: userRestaurant.social_media || {
             facebook: '',
             instagram: '',
             twitter: '',
             tiktok: ''
           },
                       currency_config: userRestaurant.currency_config || {
              currency: 'USD',
              position: 'before'
            },
           printer_config: userRestaurant.printer_config || {
            enabled: false,
            auto_cut: true,
            print_logo: true,
            printer_ip: null,
            footer_text: "Thank you for your order!",
            header_text: null,
            paper_width: 80,
            printer_name: null,
            printer_port: 9100,
            printer_type: "thermal"
          }
        })
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
      toast({
        title: "Error loading restaurant data",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  const updateOpeningHours = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }))
  }

  const updateSocialMedia = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }))
  }

  const updateThemeColors = (color: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      theme_colors: {
        ...prev.theme_colors,
        [color]: value
      }
    }))
  }

  // Predefined currency configurations
  const currencyOptions = [
    { code: 'USD', symbol: '$', name: 'US Dollar', example: '$1,234.56' },
    { code: 'EUR', symbol: '€', name: 'Euro', example: '1.234,56€' },
    { code: 'GBP', symbol: '£', name: 'British Pound', example: '£1,234.56' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', example: '¥1,234' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', example: 'C$1,234.56' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', example: 'A$1,234.56' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', example: 'CHF 1,234.56' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', example: '¥1,234.56' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso', example: '$1,234.56' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', example: 'R$ 1.234,56' }
  ]

  const updateCurrencyConfig = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      currency_config: {
        ...prev.currency_config,
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Restaurant Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Restaurant Configuration
        </CardTitle>
        <CardDescription>
          Manage your restaurant's basic information and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Restaurant name"
              />
            </div>
            
            <div>
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Input
                id="cuisine_type"
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                placeholder="e.g., Italian, Mexican, Asian"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your restaurant"
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://your-restaurant.com"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Media</h3>
          <p className="text-sm text-slate-500">Add your social media profiles to help customers find you online</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
                             <Input
                 id="facebook"
                 value={formData.social_media.facebook}
                 onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                 placeholder="urbanbistro or https://facebook.com/urbanbistro"
               />
            </div>
            
            <div>
              <Label htmlFor="instagram">Instagram</Label>
                             <Input
                 id="instagram"
                 value={formData.social_media.instagram}
                 onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                 placeholder="@urbanbistro or https://instagram.com/urbanbistro"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="twitter">Twitter</Label>
                             <Input
                 id="twitter"
                 value={formData.social_media.twitter}
                 onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                 placeholder="@tablydigital or https://x.com/tablydigital"
               />
            </div>
            
            <div>
              <Label htmlFor="tiktok">TikTok</Label>
                             <Input
                 id="tiktok"
                 value={formData.social_media.tiktok}
                 onChange={(e) => updateSocialMedia('tiktok', e.target.value)}
                 placeholder="@urbanbistro or https://tiktok.com/@urbanbistro"
               />
            </div>
          </div>
        </div>

        <Separator />

        {/* Theme Colors */}
         <div className="space-y-4">
           <h3 className="text-lg font-medium">Theme Colors</h3>
           <p className="text-sm text-slate-500">Click on the color squares to open the color picker, or type the hex code directly</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <Label htmlFor="primary_color">Primary Color</Label>
               <div className="flex gap-2 items-center">
                 <input
                   type="color"
                   id="primary_color"
                   value={formData.theme_colors.primary}
                   onChange={(e) => updateThemeColors('primary', e.target.value)}
                   className="w-12 h-12 rounded border cursor-pointer hover:scale-105 transition-transform"
                   title="Select primary color"
                   style={{
                     backgroundColor: formData.theme_colors.primary,
                     border: '2px solid #e5e7eb'
                   }}
                 />
                 <Input
                   value={formData.theme_colors.primary}
                   onChange={(e) => updateThemeColors('primary', e.target.value)}
                   placeholder="#2563eb"
                   className="flex-1"
                 />
                 <div 
                   className="w-10 h-10 rounded border"
                   style={{ backgroundColor: formData.theme_colors.primary }}
                 />
               </div>
             </div>
             
             <div>
               <Label htmlFor="secondary_color">Secondary Color</Label>
               <div className="flex gap-2 items-center">
                 <input
                   type="color"
                   id="secondary_color"
                   value={formData.theme_colors.secondary}
                   onChange={(e) => updateThemeColors('secondary', e.target.value)}
                   className="w-12 h-12 rounded border cursor-pointer hover:scale-105 transition-transform"
                   title="Select secondary color"
                   style={{
                     backgroundColor: formData.theme_colors.secondary,
                     border: '2px solid #e5e7eb'
                   }}
                 />
                 <Input
                   value={formData.theme_colors.secondary}
                   onChange={(e) => updateThemeColors('secondary', e.target.value)}
                   placeholder="#64748b"
                   className="flex-1"
                 />
                 <div 
                   className="w-10 h-10 rounded border"
                   style={{ backgroundColor: formData.theme_colors.secondary }}
                 />
               </div>
             </div>
           </div>
         </div>

        <Separator />

        {/* Currency Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Currency Configuration</h3>
          <p className="text-sm text-slate-500">Select your restaurant's currency and how you want to display prices</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={formData.currency_config.currency}
                onChange={(e) => updateCurrencyConfig('currency', e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name} ({option.symbol}) - {option.example}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Select the currency you want to use for your menu prices
              </p>
            </div>
            
            <div>
              <Label htmlFor="position">Symbol Position</Label>
              <select
                id="position"
                value={formData.currency_config.position}
                onChange={(e) => updateCurrencyConfig('position', e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="before">Before amount ($100)</option>
                <option value="after">After amount (100€)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Choose where to place the currency symbol relative to the amount
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-lg p-4">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="mt-2 text-lg font-semibold text-slate-700">
              {(() => {
                const selectedCurrency = currencyOptions.find(c => c.code === formData.currency_config.currency)
                if (!selectedCurrency) return '$100.00'
                
                const amount = '1,234.56'
                if (formData.currency_config.position === 'before') {
                  return `${selectedCurrency.symbol}${amount}`
                } else {
                  return `${amount}${selectedCurrency.symbol}`
                }
              })()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              This is how your prices will appear to customers
            </p>
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Restaurant Status</Label>
            <p className="text-sm text-slate-500">Enable or disable your restaurant</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>


      </CardContent>
    </Card>
  )
}
