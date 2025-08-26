"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Check, Crown, Sparkles, MessageSquare, BarChart3, Download, Building2, Users, Zap, Mail } from 'lucide-react'
import { SubscriptionService, SubscriptionPlan } from '@/lib/subscription-service'
import { UpgradeRequestService } from '@/lib/upgrade-request-service'
import { useSubscription } from '@/hooks/use-subscription'
import { useToast } from '@/hooks/use-toast'

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [contactMessage, setContactMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const { subscriptionStatus } = useSubscription()
  const { toast } = useToast()

  const handleUpgradeRequest = async () => {
    try {
      setSendingMessage(true)
      
      // Create upgrade request in database
      await UpgradeRequestService.createUpgradeRequest({
        requestedPlan: selectedPlan,
        message: contactMessage.trim() || undefined
      })

      toast({
        title: "Request Sent",
        description: "Your upgrade request has been sent. We'll contact you soon!",
      })

      setContactModalOpen(false)
      setContactMessage('')
      setSelectedPlan('')
    } catch (error) {
      console.error('Error sending upgrade request:', error)
      toast({
        title: "Error",
        description: "Failed to send upgrade request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const openContactModal = (planName: string) => {
    setSelectedPlan(planName)
    setContactModalOpen(true)
  }

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const subscriptionPlans = await SubscriptionService.getSubscriptionPlans()
        setPlans(subscriptionPlans)
      } catch (error) {
        console.error('Error loading plans:', error)
        toast({
          title: "Error loading plans",
          description: "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [toast])

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'ai_chat':
        return <MessageSquare className="h-4 w-4" />
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />
      case 'export':
        return <Download className="h-4 w-4" />
      case 'multi_restaurant':
        return <Building2 className="h-4 w-4" />
      default:
        return <Check className="h-4 w-4" />
    }
  }

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'ai_chat':
        return 'AI Chat Assistant'
      case 'analytics':
        return 'Advanced Analytics'
      case 'export':
        return 'Data Export'
      case 'multi_restaurant':
        return 'Multi-Restaurant Management'
      case 'menu_management':
        return 'Menu Management'
      case 'order_management':
        return 'Order Management'
      default:
        return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-white border-b border-gray-200">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative px-6 py-16 sm:px-8 sm:py-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
                <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Subscription Plans</span>
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Choose Your
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {" "}Plan
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Select the perfect plan for your restaurant. Start with a free trial and upgrade as you grow.
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                    <div className="space-y-2">
                      {[...Array(6)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded w-3/4"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-16 sm:px-8 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
              <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">Subscription Plans</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}Plan
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Select the perfect plan for your restaurant. Start with a free trial and upgrade as you grow.
            </p>
            
            {/* Current Plan Indicator */}
            {subscriptionStatus && (
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-green-50 border border-green-200">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">
                  Current Plan: {subscriptionStatus.plan_name}
                  {subscriptionStatus.is_trial && ` (${subscriptionStatus.days_remaining} days left)`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = subscriptionStatus?.plan_name === plan.display_name
            const isPopular = plan.name === 'pro'
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${isCurrentPlan ? 'border-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-3">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      <Check className="h-3 w-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.name === 'free_trial' && <Sparkles className="h-5 w-5 text-blue-500" />}
                    {plan.name === 'starter' && <Zap className="h-5 w-5 text-green-500" />}
                    {plan.name === 'pro' && <Crown className="h-5 w-5 text-yellow-500" />}
                    {plan.name === 'multi' && <Building2 className="h-5 w-5 text-purple-500" />}
                    {plan.display_name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.billing_cycle === 'trial' ? 'trial' : 'month'}
                      </span>
                    </div>
                    {plan.trial_days > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.trial_days}-day free trial
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Up to {plan.max_users} team members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Up to {plan.max_restaurants} restaurant{plan.max_restaurants > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span>Up to {plan.max_orders_per_month.toLocaleString()} orders/month</span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2">
                    {Object.entries(plan.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        {enabled ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={enabled ? '' : 'text-muted-foreground'}>
                          {getFeatureName(feature)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {isCurrentPlan ? (
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.name === 'free_trial' ? (
                    <Button
                      className="w-full"
                      disabled
                    >
                      Start Trial
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => openContactModal(plan.name)}
                      disabled={loading}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact to Upgrade
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Contact Modal */}
        <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Request Plan Upgrade
              </DialogTitle>
              <DialogDescription>
                Contact us to upgrade to the {selectedPlan} plan. We'll get back to you within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message (Optional)
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your needs or any questions you have..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setContactModalOpen(false)}
                disabled={sendingMessage}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpgradeRequest}
                disabled={sendingMessage}
              >
                {sendingMessage ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions About Restaurant Management Software</h2>
            <p className="text-muted-foreground">
              Everything you need to know about Tably's restaurant SaaS platform and subscription plans
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What is restaurant management software?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Restaurant management software like Tably is an all-in-one SaaS platform that helps restaurants manage online ordering, reservations, inventory, staff, and analytics. It streamlines operations and boosts revenue.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does online ordering work with Tably?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tably's online ordering system allows customers to place orders directly through your restaurant's website. Orders are automatically sent to your kitchen display system, and you can track everything in real-time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my restaurant management plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your restaurant SaaS plan at any time. Please contact our support team at info@tably.digital to make changes to your plan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens after my free trial ends?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  After your 14-day free trial, you'll need to upgrade to a paid restaurant management software plan. Your account remains active with limited features until you upgrade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I upgrade my restaurant software plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simply click "Contact to Upgrade" on any plan and send us a message. We'll process your restaurant management software upgrade request within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel my restaurant SaaS subscription anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! You can cancel your restaurant management software subscription at any time by contacting our support team at info@tably.digital.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
