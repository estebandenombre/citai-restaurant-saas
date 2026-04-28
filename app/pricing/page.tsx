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
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Plans
            </p>
            <div className="mx-auto h-10 max-w-sm animate-pulse rounded bg-muted" />
            <div className="mx-auto mt-4 h-4 max-w-md animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="px-6 py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse border-border/80">
                <CardHeader>
                  <div className="mb-2 h-6 w-1/2 rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-8 w-full rounded bg-muted" />
                    <div className="space-y-2">
                      {[...Array(6)].map((_, j) => (
                        <div key={j} className="h-4 w-3/4 rounded bg-muted" />
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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-8 sm:py-20">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Tariff
          </p>
          <h1 className="font-display text-4xl font-medium tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Honest <span className="italic">monthly</span> pricing
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            No commission on orders. Change plan when your floor changes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border border-border bg-background px-3 py-1.5">14-day trial</span>
            <span className="rounded-full border border-border bg-background px-3 py-1.5">0% on orders</span>
            <span className="rounded-full border border-border bg-background px-3 py-1.5">Cancel anytime</span>
          </div>
          {subscriptionStatus && (
            <p className="mt-6 font-mono text-xs uppercase tracking-wider text-foreground">
              Current: {subscriptionStatus.plan_name}
              {subscriptionStatus.is_trial && ` · ${subscriptionStatus.days_remaining}d trial`}
            </p>
          )}
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
                className={`group relative border transition-shadow hover:shadow-md ${
                  isPopular
                    ? "ring-1 ring-foreground/15 shadow-md"
                    : "border-border/80"
                } ${isCurrentPlan ? "border-foreground/30 shadow-sm" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <Badge className="border-border bg-foreground px-3 py-1.5 text-[10px] font-mono text-background">
                      <Crown className="mr-1.5 h-3.5 w-3.5" />
                      Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-3">
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Current
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.name === "free-trial-plan" && <Sparkles className="h-5 w-5 text-foreground/70" />}
                    {plan.name === "starter-plan" && <Zap className="h-5 w-5 text-foreground/70" />}
                    {plan.name === "growth-plan" && <Crown className="h-5 w-5 text-foreground/70" />}
                    {plan.name === "multi-plan" && <Building2 className="h-5 w-5 text-foreground/70" />}
                    {plan.display_name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Price */}
                  <div className="text-center">
                    <div className="mb-2 font-display text-4xl font-medium tabular-nums">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{plan.billing_cycle === 'trial' ? 'trial' : 'month'}
                      </span>
                    </div>
                    {plan.trial_days > 0 && (
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {plan.trial_days}-day trial
                      </p>
                    )}
                    {plan.name === "starter-plan" && (
                      <p className="mt-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                        No setup fees · simple pricing
                      </p>
                    )}
                    {plan.name === "growth-plan" && (
                      <p className="mt-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                        Most teams land here
                      </p>
                    )}
                    {plan.name === "multi-plan" && (
                      <p className="mt-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                        Chains & multi-kitchen
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 rounded-xl border border-border/70 bg-muted/25 p-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
                        <Users className="h-4 w-4 text-foreground/70" />
                      </div>
                      <span className="font-medium">Up to {plan.max_users} team member{plan.max_users > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
                        <Building2 className="h-4 w-4 text-foreground/70" />
                      </div>
                      <span className="font-medium">Up to {plan.max_restaurants} location{plan.max_restaurants > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
                        <BarChart3 className="h-4 w-4 text-foreground/70" />
                      </div>
                      <span className="font-medium tabular-nums">
                        {plan.max_orders_per_month.toLocaleString()} orders/mo
                      </span>
                    </div>
                  </div>

                  {/* Feature List - Grouped by enabled/disabled */}
                  <div className="space-y-4">
                    {/* Enabled Features */}
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Check className="h-4 w-4" />
                        Included
                      </h4>
                      <div className="space-y-2 pl-6">
                        {Object.entries(plan.features)
                          .filter(([_, enabled]) => enabled)
                          .map(([feature, _]) => (
                            <div key={feature} className="flex items-center gap-3 text-sm">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="font-medium text-foreground">{getFeatureName(feature)}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Disabled Features */}
                    {Object.entries(plan.features).some(([_, enabled]) => !enabled) && (
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border border-border">
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                          </div>
                          Not included
                        </h4>
                        <div className="space-y-2 pl-6">
                          {Object.entries(plan.features)
                            .filter(([_, enabled]) => !enabled)
                            .map(([feature, _]) => (
                              <div key={feature} className="flex items-center gap-3 text-sm">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border">
                                  <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                </div>
                                <span className="text-muted-foreground">{getFeatureName(feature)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled variant="secondary">
                      Current plan
                    </Button>
                  ) : plan.name === "free-trial-plan" ? (
                    <Button className="w-full" disabled variant="secondary">
                      Trial
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? "default" : "outline"}
                      className="w-full"
                      onClick={() => openContactModal(plan.name)}
                      disabled={loading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Contact to upgrade
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-medium tracking-[-0.02em]">Why Tably</h2>
            <p className="mt-2 text-muted-foreground">Built for people on the floor, not for slide decks.</p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                <Zap className="h-7 w-7 text-foreground/75" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-medium">Fast setup</h3>
              <p className="text-sm text-muted-foreground">Live the same day — no consultants on site.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                <BarChart3 className="h-7 w-7 text-foreground/75" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-medium">Clear numbers</h3>
              <p className="text-sm text-muted-foreground">One place for covers, revenue and prep.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                <MessageSquare className="h-7 w-7 text-foreground/75" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-lg font-medium">Human support</h3>
              <p className="text-sm text-muted-foreground">Real people when service is on the line.</p>
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
            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/80">
              <CardContent className="pt-8 pb-8">
                <div className="text-amber-400 mb-6 text-xl">★★★★★</div>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  "Tably's AI insights helped us increase our average order value by 25%. The analytics are game-changing!"
                </p>
                <div className="font-semibold text-base">Maria Rodriguez</div>
                <div className="text-sm text-muted-foreground">El Sabor Mexicano</div>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/80">
              <CardContent className="pt-8 pb-8">
                <div className="text-amber-400 mb-6 text-xl">★★★★★</div>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  "Setup was incredibly easy. We were processing orders within 30 minutes. No more phone chaos!"
                </p>
                <div className="font-semibold text-base">David Chen</div>
                <div className="text-sm text-muted-foreground">Wok & Roll</div>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/80">
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
            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/80">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                  <Globe className="h-7 w-7 text-foreground/75" strokeWidth={1.5} />
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

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/80">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                  <MessageSquare className="h-7 w-7 text-foreground/75" strokeWidth={1.5} />
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

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/80">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                  <ShoppingCart className="h-7 w-7 text-foreground/75" strokeWidth={1.5} />
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

            <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/80">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                  <Printer className="h-7 w-7 text-foreground/75" strokeWidth={1.5} />
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

        <div className="mx-auto mt-20 max-w-3xl text-center">
          <Card className="border-border/90 bg-foreground text-background">
            <CardContent className="px-8 py-12">
              <h2 className="font-display text-3xl font-medium tracking-[-0.02em]">
                Next step: talk to us
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-background/80">
                No pressure — we answer questions about your floor, your menu, and your team.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90"
                  onClick={() => openContactModal("growth-plan")}
                >
                  Request upgrade
                </Button>
                <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10">
                  Book a call
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4 font-mono text-xs text-background/70">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  14-day trial
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  No card to start
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
