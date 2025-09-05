"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Check, Crown, Sparkles, MessageSquare, BarChart3, Download, Building2, Users, Zap, Mail, Globe, ShoppingCart, Printer } from 'lucide-react'
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
        return 'AI-powered insights & recommendations'
      case 'analytics':
        return 'Advanced analytics & reporting'
      case 'export':
        return 'Data export & backup'
      case 'multi_restaurant':
        return 'Multi-location management'
      case 'menu_management':
        return 'Menu & inventory management'
      case 'order_management':
        return 'Order processing & kitchen display'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/15 to-blue-400/15 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-20 sm:px-8 sm:py-24">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm mb-8">
              <Sparkles className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-semibold text-blue-700">Choose Your Perfect Plan</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Pricing That
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}Grows With You
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Start free and scale as you grow. AI-powered insights that transform your restaurant operations.
            </p>
            
            {/* Value Proposition */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-full shadow-sm">
                <Check className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-semibold text-green-700">14-day free trial</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full shadow-sm">
                <Check className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-semibold text-blue-700">0% commission</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-full shadow-sm">
                <Check className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-semibold text-purple-700">Cancel anytime</span>
              </div>
            </div>
            
            {/* Current Plan Indicator */}
            {subscriptionStatus && (
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 shadow-sm">
                <Check className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-semibold text-green-700">
                  Current Plan: {subscriptionStatus.plan_name}
                  {subscriptionStatus.is_trial && ` (${subscriptionStatus.days_remaining} days left)`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = subscriptionStatus?.plan_name === plan.display_name
            const isPopular = plan.name === 'growth-plan'
            
            return (
              <Card 
                key={plan.id} 
                className={`relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isPopular 
                    ? 'ring-2 ring-blue-500 shadow-xl scale-105 bg-gradient-to-br from-blue-50/50 to-indigo-50/50' 
                    : 'hover:ring-2 hover:ring-gray-200'
                } ${isCurrentPlan ? 'border-green-500 shadow-lg' : 'border-gray-200/50'}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 shadow-lg">
                      <Crown className="h-4 w-4 mr-2" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 shadow-lg">
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.name === 'free-trial-plan' && <Sparkles className="h-5 w-5 text-blue-500" />}
                    {plan.name === 'starter-plan' && <Zap className="h-5 w-5 text-green-500" />}
                    {plan.name === 'growth-plan' && <Crown className="h-5 w-5 text-yellow-500" />}
                    {plan.name === 'multi-plan' && <Building2 className="h-5 w-5 text-purple-500" />}
                    {plan.display_name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{plan.billing_cycle === 'trial' ? 'trial' : 'month'}
                      </span>
                    </div>
                    {plan.trial_days > 0 && (
                      <p className="text-sm text-blue-600 font-semibold mt-2">
                        {plan.trial_days}-day free trial
                      </p>
                    )}
                    {plan.name === 'starter-plan' && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                        <p className="text-sm text-green-700 font-semibold">
                          Save $10 vs competitors • No setup fees
                        </p>
                      </div>
                    )}
                    {plan.name === 'growth-plan' && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                        <p className="text-sm text-blue-700 font-semibold">
                          Most popular • Save 5+ hours/week with AI
                        </p>
                      </div>
                    )}
                    {plan.name === 'multi-plan' && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200/50">
                        <p className="text-sm text-purple-700 font-semibold">
                          Unlimited for most businesses
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Up to {plan.max_users} team member{plan.max_users > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">Up to {plan.max_restaurants} location{plan.max_restaurants > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium">{plan.max_orders_per_month.toLocaleString()} orders/month</span>
                    </div>
                  </div>

                  {/* Feature List - Grouped by enabled/disabled */}
                  <div className="space-y-4">
                    {/* Enabled Features */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Included Features
                      </h4>
                      <div className="space-y-2 pl-6">
                        {Object.entries(plan.features)
                          .filter(([_, enabled]) => enabled)
                          .map(([feature, _]) => (
                            <div key={feature} className="flex items-center gap-3 text-sm">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-green-600" />
                              </div>
                              <span className="font-medium text-green-800">
                                {getFeatureName(feature)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Disabled Features */}
                    {Object.entries(plan.features).some(([_, enabled]) => !enabled) && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          </div>
                          Not Included
                        </h4>
                        <div className="space-y-2 pl-6">
                          {Object.entries(plan.features)
                            .filter(([_, enabled]) => !enabled)
                            .map(([feature, _]) => (
                              <div key={feature} className="flex items-center gap-3 text-sm">
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                </div>
                                <span className="text-muted-foreground">
                                  {getFeatureName(feature)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {isCurrentPlan ? (
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.name === 'free-trial-plan' ? (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                      disabled
                    >
                      Start Trial
                    </Button>
                  ) : (
                    <Button
                      className={`w-full font-semibold py-3 transition-all duration-200 ${
                        isPopular 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
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

        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Why Choose Tably?</h2>
            <p className="text-muted-foreground">
              Join thousands of restaurants that trust Tably to grow their business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick Setup</h3>
              <p className="text-muted-foreground">
                Get started in minutes, not days. No complex installations or training required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Proven Results</h3>
              <p className="text-muted-foreground">
                Restaurants using Tably see an average 40% increase in online orders.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">
                Our team is here to help you succeed, whenever you need us.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real results from real restaurants
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50">
              <CardContent className="pt-8 pb-8">
                <div className="text-amber-400 mb-6 text-xl">★★★★★</div>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  "Tably's AI insights helped us increase our average order value by 25%. The analytics are game-changing!"
                </p>
                <div className="font-semibold text-base">Maria Rodriguez</div>
                <div className="text-sm text-muted-foreground">El Sabor Mexicano</div>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50">
              <CardContent className="pt-8 pb-8">
                <div className="text-amber-400 mb-6 text-xl">★★★★★</div>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  "Setup was incredibly easy. We were processing orders within 30 minutes. No more phone chaos!"
                </p>
                <div className="font-semibold text-base">David Chen</div>
                <div className="text-sm text-muted-foreground">Wok & Roll</div>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50">
              <CardContent className="pt-8 pb-8">
                <div className="text-amber-400 mb-6 text-xl">★★★★★</div>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  "Managing 3 locations used to be a nightmare. Now everything is centralized and automated."
                </p>
                <div className="font-semibold text-base">Sarah Johnson</div>
                <div className="text-sm text-muted-foreground">Fresh Bites Chain</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Premium Add-ons</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enhance your restaurant management with these powerful add-ons
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Custom Domain</CardTitle>
                <CardDescription className="text-base">Your own branded URL</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$10<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <Button variant="outline" size="lg" className="w-full font-semibold">
                  Add to Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">VIP Support 24/7</CardTitle>
                <CardDescription className="text-base">Priority phone & chat support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <Button variant="outline" size="lg" className="w-full font-semibold">
                  Add to Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Marketplace Integration</CardTitle>
                <CardDescription className="text-base">Connect with delivery platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$59<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <Button variant="outline" size="lg" className="w-full font-semibold">
                  Add to Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Printer className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Extra KDS/Printers</CardTitle>
                <CardDescription className="text-base">Additional kitchen displays</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$10<span className="text-lg font-normal text-muted-foreground">/device/month</span></div>
                <Button variant="outline" size="lg" className="w-full font-semibold">
                  Add to Plan
                </Button>
              </CardContent>
            </Card>
          </div>
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
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about Tably's pricing and features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in the 14-day free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our free trial includes menu management and order processing for 14 days with no credit card required. You can process up to 50 orders to test the system and see how it works for your restaurant.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Which plan is best for my restaurant?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <strong>Starter ($29):</strong> Perfect for food trucks and small cafés<br/>
                  <strong>Growth ($69):</strong> Ideal for restaurants with 1-2 locations<br/>
                  <strong>Multi ($149):</strong> Best for small chains with 3-5 locations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you charge commission on orders?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No! Unlike competitors, Tably charges 0% commission on orders. You keep 100% of your revenue. We only charge the monthly subscription fee.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can change your plan at any time. Contact our support team and we'll process your request within 24 hours. No long-term contracts required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does billing work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can start with our free trial and upgrade to a paid plan when you're ready. All billing is handled securely through our platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No setup fees! Your subscription starts after your 14-day free trial ends. We also offer a 30% discount for the first 3 months to help you get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-20 max-w-5xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <CardContent className="pt-12 pb-12 relative">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Restaurant?</h2>
              <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                Join thousands of restaurants that have already increased their revenue and streamlined operations with Tably.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => openContactModal('growth-plan')}
                >
                  Start Free Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg transition-all duration-300"
                >
                  Schedule Demo
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-blue-200 text-sm">
                <span className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  No credit card required
                </span>
                <span className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  14-day free trial
                </span>
                <span className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Cancel anytime
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
