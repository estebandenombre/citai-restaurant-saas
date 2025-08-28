"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  DollarSign,
  Apple,
  Settings,
  CheckCircle,
  AlertCircle,
  Save,
  ExternalLink,
  Shield,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUserRestaurant } from "@/lib/auth-utils"
import { PaymentService, PaymentSettings } from "@/lib/payment-service"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/ui/page-header"



export default function PaymentSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [deletingKeys, setDeletingKeys] = useState<string | null>(null)
  const [clearingAllKeys, setClearingAllKeys] = useState(false)
  const [refreshingSettings, setRefreshingSettings] = useState(false)
  const { toast } = useToast()
  
  // Default payment settings
  const [settings, setSettings] = useState<PaymentSettings>(PaymentService.getDefaultPaymentSettings())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get restaurant info
        const { restaurant: userRestaurant } = await getCurrentUserRestaurant()
        setRestaurant(userRestaurant)

        if (userRestaurant?.id) {
          // Fetch payment settings from database
          const paymentSettings = await PaymentService.getPaymentSettings(userRestaurant.id)
          
          if (paymentSettings) {
            setSettings(paymentSettings)
          }
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error)
        toast({
          title: "Error",
          description: "Failed to load payment settings.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      if (!restaurant?.id) {
        throw new Error('Restaurant not found')
      }

      // Validate settings before saving
      const validation = PaymentService.validatePaymentSettings(settings)
      if (!validation.valid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        })
        return
      }

      // Auto-validate enabled gateways if they have credentials but haven't been tested
      const gatewaysToValidate = Object.entries(settings.gateways)
        .filter(([_, gateway]) => gateway.enabled && gateway.public_key && gateway.secret_key && !gateway.setup_complete)
      
      if (gatewaysToValidate.length > 0) {
        toast({
          title: "Validating Credentials",
          description: "Testing payment gateway connections before saving...",
        })
        
        for (const [gatewayId, gateway] of gatewaysToValidate) {
          try {
            if (gatewayId === 'stripe') {
              const result = await PaymentService.testStripeConnection(
                gateway.public_key!,
                gateway.secret_key!,
                gateway.test_mode
              )
              if (result.success) {
                updateGateway(gatewayId, { setup_complete: true })
              }
            } else if (gatewayId === 'paypal') {
              const result = await PaymentService.testPayPalConnection(
                gateway.public_key!,
                gateway.secret_key!,
                gateway.test_mode
              )
              if (result.success) {
                updateGateway(gatewayId, { setup_complete: true })
              }
            }
          } catch (error) {
            console.error(`Error validating ${gatewayId}:`, error)
          }
        }
      }

      // Save to database
      const success = await PaymentService.savePaymentSettings(restaurant.id, settings)
      
      if (!success) {
        throw new Error('Failed to save payment settings')
      }

      toast({
        title: "Success",
        description: "Payment settings saved successfully.",
      })
    } catch (error) {
      console.error('Error saving payment settings:', error)
      toast({
        title: "Error",
        description: "Failed to save payment settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateGateway = (gatewayId: string, updates: Partial<PaymentGateway>) => {
    setSettings(prev => ({
      ...prev,
      gateways: {
        ...prev.gateways,
        [gatewayId]: {
          ...prev.gateways[gatewayId as keyof typeof prev.gateways],
          ...updates,
          // Reset setup_complete when credentials change
          ...(updates.public_key || updates.secret_key ? { setup_complete: false } : {})
        }
      }
    }))
  }

  const getGatewayStatus = (gateway: any) => {
    if (!gateway.enabled) return { status: 'disabled', label: 'Disabled', color: 'gray' }
    if (!gateway.setup_complete) return { status: 'incomplete', label: 'Setup Required', color: 'yellow' }
    return { status: 'active', label: 'Active', color: 'green' }
  }

  const handleTestConnection = async (gatewayId: string) => {
    console.log('handleTestConnection called with gatewayId:', gatewayId)
    console.log('Current testingConnection state:', testingConnection)
    try {
      setTestingConnection(gatewayId)
      const gateway = settings.gateways[gatewayId as keyof typeof settings.gateways]
      console.log('Gateway config:', gateway)
      
      // Validate that keys are provided
      if (!gateway.public_key || !gateway.secret_key) {
        console.log('Missing credentials detected')
        toast({
          title: "Missing Credentials",
          description: `Please enter your ${gateway.name} credentials before testing the connection.`,
          variant: "destructive",
        })
        return
      }
      
      if (gatewayId === 'stripe') {
        console.log('Testing Stripe connection...')
        const result = await PaymentService.testStripeConnection(
          gateway.public_key,
          gateway.secret_key,
          gateway.test_mode
        )
        console.log('Stripe test result:', result)
        
        toast({
          title: result.success ? "✅ Connection Successful" : "❌ Connection Failed",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        
        // Update setup_complete status if connection is successful
        if (result.success) {
          updateGateway(gatewayId, { setup_complete: true })
        }
      } else if (gatewayId === 'paypal') {
        const result = await PaymentService.testPayPalConnection(
          gateway.public_key,
          gateway.secret_key,
          gateway.test_mode
        )
        
        toast({
          title: result.success ? "✅ Connection Successful" : "❌ Connection Failed",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
        
        // Update setup_complete status if connection is successful
        if (result.success) {
          updateGateway(gatewayId, { setup_complete: true })
        }
      }
    } catch (error) {
      console.error('Test connection error:', error)
      toast({
        title: "❌ Test Failed",
        description: "An unexpected error occurred while testing the connection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTestingConnection(null)
    }
  }

  const handleDeleteKeys = async (gatewayId: string) => {
    try {
      setDeletingKeys(gatewayId)
      const gateway = settings.gateways[gatewayId as keyof typeof settings.gateways]
      
      // Check if gateway has keys to delete
      if (!gateway.public_key && !gateway.secret_key) {
        toast({
          title: "No Keys to Delete",
          description: `No payment keys found for ${gateway.name}.`,
          variant: "destructive",
        })
        return
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to delete the payment keys for ${gateway.name}? This action cannot be undone and will disable the gateway.`
      )

      if (!confirmed) {
        return
      }

      // Call API to delete keys
      const response = await fetch('/api/payments/delete-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gatewayId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete payment keys')
      }

      // Reload payment settings from database to ensure sync
      if (restaurant?.id) {
        setRefreshingSettings(true)
        try {
          const updatedSettings = await PaymentService.getPaymentSettings(restaurant.id)
          if (updatedSettings) {
            setSettings(updatedSettings)
          }
        } finally {
          setRefreshingSettings(false)
        }
      }

      toast({
        title: "✅ Keys Deleted",
        description: `Payment keys for ${gateway.name} have been deleted successfully.`,
      })

    } catch (error) {
      console.error('Error deleting payment keys:', error)
      toast({
        title: "❌ Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete payment keys.",
        variant: "destructive",
      })
    } finally {
      setDeletingKeys(null)
    }
  }

  const handleClearAllKeys = async () => {
    try {
      setClearingAllKeys(true)
      
      // Check if any gateway has keys
      const hasKeys = Object.values(settings.gateways).some(
        gateway => gateway.public_key || gateway.secret_key
      )

      if (!hasKeys) {
        toast({
          title: "No Keys to Clear",
          description: "No payment keys found to clear.",
          variant: "destructive",
        })
        return
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to clear ALL payment keys? This action cannot be undone and will disable all payment gateways."
      )

      if (!confirmed) {
        return
      }

      // Use the payment service to clear all keys
      const result = await PaymentService.clearAllPaymentKeys(restaurant.id)

      if (result.success) {
        // Reload payment settings from database to ensure sync
        if (restaurant?.id) {
          setRefreshingSettings(true)
          try {
            const updatedSettings = await PaymentService.getPaymentSettings(restaurant.id)
            if (updatedSettings) {
              setSettings(updatedSettings)
            }
          } finally {
            setRefreshingSettings(false)
          }
        }

        toast({
          title: "✅ All Keys Cleared",
          description: "All payment keys have been cleared successfully.",
        })
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      console.error('Error clearing all payment keys:', error)
      toast({
        title: "❌ Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear payment keys.",
        variant: "destructive",
      })
    } finally {
      setClearingAllKeys(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Payment Settings"
          description="Configure payment gateways and payment methods for your restaurant"
          icon={CreditCard}
        />
        <div className="grid gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  // Show refreshing indicator
  if (refreshingSettings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Payment Settings"
            description="Configure payment gateways and payment methods for your restaurant"
            icon={CreditCard}
          />
          <Button 
            variant="destructive" 
            size="sm"
            disabled={true}
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            Updating...
          </Button>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            <span>Updating payment settings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Payment Settings"
          description="Configure payment gateways and payment methods for your restaurant"
          icon={CreditCard}
        />
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleClearAllKeys}
          disabled={clearingAllKeys}
        >
          {clearingAllKeys ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Keys
            </>
          )}
        </Button>
      </div>

      {/* General Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            General Payment Settings
          </CardTitle>
          <CardDescription>
            Configure basic payment options for your restaurant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to pay online with cards
                </p>
              </div>
              <Switch
                checked={settings.payments_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, payments_enabled: checked }))}
                disabled={refreshingSettings}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Require Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Require payment before order confirmation
                </p>
              </div>
              <Switch
                checked={settings.require_payment}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_payment: checked }))}
                disabled={!settings.payments_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Allow Cash Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Accept cash payments on pickup/delivery
                </p>
              </div>
              <Switch
                checked={settings.allow_cash}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_cash: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Auto Capture Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically capture payments when orders are confirmed
                </p>
              </div>
              <Switch
                checked={settings.auto_capture}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_capture: checked }))}
                disabled={!settings.payments_enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Gateways
          </CardTitle>
          <CardDescription>
            Configure payment processors to accept online payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stripe" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stripe" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Stripe
              </TabsTrigger>
              <TabsTrigger value="paypal" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                PayPal
              </TabsTrigger>
              <TabsTrigger value="apple_pay" className="flex items-center gap-2">
                <Apple className="h-4 w-4" />
                Apple Pay
              </TabsTrigger>
            </TabsList>

            {/* Stripe Configuration */}
            <TabsContent value="stripe" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Stripe Payment Gateway</h3>
                  <p className="text-sm text-muted-foreground">
                    Accept credit cards, Apple Pay, and Google Pay
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getGatewayStatus(settings.gateways.stripe).status === 'active' ? 'default' : 'secondary'}>
                    {getGatewayStatus(settings.gateways.stripe).label}
                  </Badge>
                  <Switch
                    checked={settings.gateways.stripe.enabled}
                    onCheckedChange={(checked) => updateGateway('stripe', { enabled: checked })}
                    disabled={refreshingSettings}
                  />
                </div>
              </div>

              {settings.gateways.stripe.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Test Mode</Label>
                    <Switch
                      checked={settings.gateways.stripe.test_mode}
                      onCheckedChange={(checked) => updateGateway('stripe', { test_mode: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Publishable Key</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets ? "text" : "password"}
                          placeholder="pk_test_..."
                          value={settings.gateways.stripe.public_key}
                          onChange={(e) => updateGateway('stripe', { public_key: e.target.value })}
                          disabled={refreshingSettings}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets ? "text" : "password"}
                          placeholder="sk_test_..."
                          value={settings.gateways.stripe.secret_key}
                          onChange={(e) => updateGateway('stripe', { secret_key: e.target.value })}
                          disabled={refreshingSettings}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowSecrets(!showSecrets)}
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Processing fee: {settings.gateways.stripe.processing_fee}% + $0.30 per transaction</span>
                  </div>

                  {settings.gateways.stripe.setup_complete && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                      <span>✅ Credentials validated successfully</span>
                    </div>
                  )}

                                     <div className="flex gap-2">
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                       disabled={refreshingSettings}
                     >
                       <ExternalLink className="h-4 w-4 mr-2" />
                       Get Stripe Keys
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => {
                         console.log('Test Connection button clicked for Stripe')
                         // Test simple first
                         toast({
                           title: "Test",
                           description: "Button click detected!",
                         })
                         handleTestConnection('stripe')
                       }}
                       disabled={testingConnection === 'stripe' || refreshingSettings}
                     >
                       {testingConnection === 'stripe' ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                           Testing...
                         </>
                       ) : (
                         <>
                           <Zap className="h-4 w-4 mr-2" />
                           Test Connection
                         </>
                       )}
                     </Button>
                     {(settings.gateways.stripe.public_key || settings.gateways.stripe.secret_key) && (
                       <Button 
                         variant="destructive" 
                         size="sm"
                         onClick={() => handleDeleteKeys('stripe')}
                         disabled={deletingKeys === 'stripe' || refreshingSettings}
                       >
                         {deletingKeys === 'stripe' ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                             Deleting...
                           </>
                         ) : (
                           <>
                             <Trash2 className="h-4 w-4 mr-2" />
                             Delete Keys
                           </>
                         )}
                       </Button>
                     )}
                   </div>
                </div>
              )}
            </TabsContent>

            {/* PayPal Configuration */}
            <TabsContent value="paypal" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">PayPal Payment Gateway</h3>
                  <p className="text-sm text-muted-foreground">
                    Accept PayPal and credit card payments
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getGatewayStatus(settings.gateways.paypal).status === 'active' ? 'default' : 'secondary'}>
                    {getGatewayStatus(settings.gateways.paypal).label}
                  </Badge>
                  <Switch
                    checked={settings.gateways.paypal.enabled}
                    onCheckedChange={(checked) => updateGateway('paypal', { enabled: checked })}
                    disabled={refreshingSettings}
                  />
                </div>
              </div>

              {settings.gateways.paypal.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Sandbox Mode</Label>
                    <Switch
                      checked={settings.gateways.paypal.test_mode}
                      onCheckedChange={(checked) => updateGateway('paypal', { test_mode: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client ID</Label>
                      <Input
                        type={showSecrets ? "text" : "password"}
                        placeholder="PayPal Client ID"
                        value={settings.gateways.paypal.public_key}
                        onChange={(e) => updateGateway('paypal', { public_key: e.target.value })}
                        disabled={refreshingSettings}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <Input
                        type={showSecrets ? "text" : "password"}
                        placeholder="PayPal Secret"
                        value={settings.gateways.paypal.secret_key}
                        onChange={(e) => updateGateway('paypal', { secret_key: e.target.value })}
                        disabled={refreshingSettings}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Processing fee: {settings.gateways.paypal.processing_fee}% + $0.30 per transaction</span>
                  </div>

                  {settings.gateways.paypal.setup_complete && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                      <span>✅ Credentials validated successfully</span>
                    </div>
                  )}

                                     <div className="flex gap-2">
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => window.open('https://developer.paypal.com/dashboard/', '_blank')}
                       disabled={refreshingSettings}
                     >
                       <ExternalLink className="h-4 w-4 mr-2" />
                       Get PayPal Keys
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => handleTestConnection('paypal')}
                       disabled={testingConnection === 'paypal' || refreshingSettings}
                     >
                       {testingConnection === 'paypal' ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                           Testing...
                         </>
                       ) : (
                         <>
                           <Zap className="h-4 w-4 mr-2" />
                           Test Connection
                         </>
                       )}
                     </Button>
                     {(settings.gateways.paypal.public_key || settings.gateways.paypal.secret_key) && (
                       <Button 
                         variant="destructive" 
                         size="sm"
                         onClick={() => handleDeleteKeys('paypal')}
                         disabled={deletingKeys === 'paypal' || refreshingSettings}
                       >
                         {deletingKeys === 'paypal' ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                             Deleting...
                           </>
                         ) : (
                           <>
                             <Trash2 className="h-4 w-4 mr-2" />
                             Delete Keys
                           </>
                         )}
                       </Button>
                     )}
                   </div>
                </div>
              )}
            </TabsContent>

            {/* Apple Pay Configuration */}
            <TabsContent value="apple_pay" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Apple Pay Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Accept Apple Pay payments (requires Stripe)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getGatewayStatus(settings.gateways.apple_pay).status === 'active' ? 'default' : 'secondary'}>
                    {getGatewayStatus(settings.gateways.apple_pay).label}
                  </Badge>
                  <Switch
                    checked={settings.gateways.apple_pay.enabled}
                    onCheckedChange={(checked) => updateGateway('apple_pay', { enabled: checked })}
                    disabled={!settings.gateways.stripe.enabled || refreshingSettings}
                  />
                </div>
              </div>

              {settings.gateways.apple_pay.enabled && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Apple className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900">Apple Pay Setup</h4>
                        <p className="text-sm text-blue-700">
                          Apple Pay requires additional setup with Apple Developer Account and domain verification.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Setup Guide
                          </Button>
                          <Button variant="outline" size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Verify Domain
                          </Button>
                          {(settings.gateways.apple_pay.public_key || settings.gateways.apple_pay.secret_key) && (
                                                     <Button 
                           variant="destructive" 
                           size="sm"
                           onClick={() => handleDeleteKeys('apple_pay')}
                           disabled={deletingKeys === 'apple_pay' || refreshingSettings}
                         >
                              {deletingKeys === 'apple_pay' ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Keys
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span>No additional processing fees - uses Stripe rates</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Choose which payment methods to accept
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <Label className="font-medium">Credit/Debit Cards</Label>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </div>
              <Switch
                checked={settings.allow_card}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_card: checked }))}
                disabled={!settings.payments_enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Apple className="h-5 w-5 text-black" />
                <div>
                  <Label className="font-medium">Apple Pay</Label>
                  <p className="text-sm text-muted-foreground">iPhone & Apple Watch</p>
                </div>
              </div>
              <Switch
                checked={settings.allow_apple_pay}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_apple_pay: checked }))}
                disabled={!settings.payments_enabled || !settings.gateways.apple_pay.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || refreshingSettings} className="min-w-[120px]">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
