'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { VideoModal } from "@/components/video-modal"
// Language selector temporarily disabled
// import { LanguageSelector } from "@/components/ui/language-selector"
import TawkToScript from "@/components/tawk-to-script"
import { useTranslations } from "@/hooks/use-translations"
import { 
  ArrowRight, 
  Play, 
  Check, 
  Star, 
  Users,  
  Zap, 
  Shield, 
  Clock, 
  TrendingUp,
  BarChart3,
  ShoppingCart,
  Calendar,
  ChefHat,
  Package,
  Settings,
  Grid,
  Sparkles,
  Target,
  Award,
  MessageCircle,
  ThumbsUp,
  Coffee,
  Utensils,
  Receipt,
  ArrowUpRight,
  CheckCircle,
  Headphones,
  Globe,
  Smartphone,
  CreditCard,
  DollarSign,
  Timer,
  Rocket,
  Flame,
  Heart
} from "lucide-react"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { t, locale, isReady } = useTranslations()
  const [translations, setTranslations] = useState<any>(null)

  useEffect(() => {
    const loadTranslations = async () => {
      if (isReady) {
        const trans = await import(`../src/locales/${locale}/common.json`)
        setTranslations(trans.default)
      }
    }
    loadTranslations()
  }, [locale, isReady])

  if (!translations) {
    return <div>Loading...</div>
  }

  const getTranslation = (key: string, fallback?: string) => {
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }

    return typeof value === 'string' ? value : fallback || key
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-coral-50/30">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 py-0 flex items-center justify-between">
          <div>
            <Logo size="xl" />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-[#7C3AED] transition-colors font-medium">
              {getTranslation('navigation.features')}
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-[#7C3AED] transition-colors font-medium">
              {getTranslation('navigation.pricing')}
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-[#7C3AED] transition-colors font-medium">
              {getTranslation('navigation.reviews')}
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-[#7C3AED] transition-colors font-medium">
              {getTranslation('navigation.signIn')}
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {/* Language selector temporarily disabled */}
            {/* <LanguageSelector /> */}
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                {getTranslation('navigation.getStartedFree')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Product Hunt Launch */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#7C3AED]/20 to-[#D64DD2]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#FF6B6B]/20 to-[#7C3AED]/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Product Hunt Badge */}
            <div className="flex justify-center mb-8">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium border-0 shadow-lg">
                <Flame className="w-4 h-4 mr-2" />
                {getTranslation('hero.productHuntBadge')}
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {getTranslation('hero.mainHeadline')}
              <span className="block bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] bg-clip-text text-transparent">
                {getTranslation('hero.mainHeadlineHighlight')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {getTranslation('hero.subheadline')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-lg px-8 py-4">
                  <Rocket className="w-5 h-5 mr-2" />
                  {getTranslation('hero.startFreeTrial')}
                </Button>
              </Link>
              <VideoModal videoId="623Cw28jD8o" title="Tably Restaurant Management Demo">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:text-gray-900 text-lg px-8 py-4 font-medium">
                  <Play className="w-5 h-5 mr-2" />
                  {getTranslation('hero.watchDemo')}
                </Button>
              </VideoModal>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{getTranslation('hero.trustIndicators.noCreditCard')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-blue-500" />
                <span>{getTranslation('hero.trustIndicators.setupIn5Minutes')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4 text-purple-500" />
                <span>{getTranslation('hero.trustIndicators.support24_7')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{getTranslation('socialProof.title')}</h2>
            <p className="text-gray-600">{getTranslation('socialProof.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7C3AED] mb-2">500+</div>
              <div className="text-sm text-gray-600">{getTranslation('socialProof.stats.activeRestaurants')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D64DD2] mb-2">50K+</div>
              <div className="text-sm text-gray-600">{getTranslation('socialProof.stats.ordersProcessed')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF6B6B] mb-2">99.9%</div>
              <div className="text-sm text-gray-600">{getTranslation('socialProof.stats.uptime')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4B0082] mb-2">4.9★</div>
              <div className="text-sm text-gray-600">{getTranslation('socialProof.stats.customerRating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              {getTranslation('features.badge')}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{getTranslation('features.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getTranslation('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{getTranslation('features.cards.onlineOrdering.title')}</CardTitle>
                <CardDescription>
                  {getTranslation('features.cards.onlineOrdering.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {getTranslation('features.cards.onlineOrdering.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{getTranslation('features.cards.reservations.title')}</CardTitle>
                <CardDescription>
                  {getTranslation('features.cards.reservations.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {getTranslation('features.cards.reservations.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{getTranslation('features.cards.menuManagement.title')}</CardTitle>
                <CardDescription>
                  {getTranslation('features.cards.menuManagement.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {getTranslation('features.cards.menuManagement.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{getTranslation('features.cards.inventory.title')}</CardTitle>
                <CardDescription>
                  {getTranslation('features.cards.inventory.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {getTranslation('features.cards.inventory.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{getTranslation('features.cards.analytics.title')}</CardTitle>
                <CardDescription>
                  {getTranslation('features.cards.analytics.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {getTranslation('features.cards.analytics.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{getTranslation('features.cards.staffManagement.title')}</CardTitle>
                <CardDescription>
                  {getTranslation('features.cards.staffManagement.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {getTranslation('features.cards.staffManagement.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
                <Play className="w-4 h-4 mr-2" />
                {getTranslation('demo.badge')}
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {getTranslation('demo.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {getTranslation('demo.subtitle')}
              </p>
              <div className="space-y-4">
                {getTranslation('demo.features').map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Tably Dashboard</div>
                  <div className="w-6"></div>
                </div>
                
                {/* Dashboard Layout */}
                <div className="flex h-96">
                  {/* Sidebar */}
                  <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
                    {/* Logo */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">T</span>
                        </div>
                        <span className="text-lg font-bold text-[#7C3AED]">Tably</span>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                      {[
                        { name: "Overview", icon: "grid", active: true },
                        { name: "Orders", icon: "shopping-cart" },
                        { name: "Reservations", icon: "calendar" },
                        { name: "Menu", icon: "chef-hat" },
                        { name: "Inventory", icon: "package" },
                        { name: "Staff", icon: "users" },
                        { name: "Analytics", icon: "bar-chart" },
                        { name: "Settings", icon: "settings" }
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          item.active ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'
                        }`}>
                          <div className="w-4 h-4">
                            {item.icon === 'grid' && <Grid className="w-4 h-4" />}
                            {item.icon === 'shopping-cart' && <ShoppingCart className="w-4 h-4" />}
                            {item.icon === 'calendar' && <Calendar className="w-4 h-4" />}
                            {item.icon === 'chef-hat' && <ChefHat className="w-4 h-4" />}
                            {item.icon === 'package' && <Package className="w-4 h-4" />}
                            {item.icon === 'users' && <Users className="w-4 h-4" />}
                            {item.icon === 'bar-chart' && <BarChart3 className="w-4 h-4" />}
                            {item.icon === 'settings' && <Settings className="w-4 h-4" />}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      ))}
                    </nav>
                    
                    {/* User Info */}
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#7C3AED] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">E</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">Esteban Ortiz</div>
                          <div className="text-xs text-gray-500 truncate">Bella Vista Restaurant</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 p-6 bg-gray-50">
                    {/* Header */}
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
                      <p className="text-gray-600">
                        Welcome back, <span className="text-blue-600 font-medium">Esteban Ortiz</span> 👋 Here's what's happening at <span className="text-green-600 font-medium">Bella Vista Restaurant</span> today.
                      </p>
                    </div>
                    
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">47</div>
                        <div className="text-xs text-gray-600">Today's Orders</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">$2,847</div>
                        <div className="text-xs text-gray-600">Today's Revenue</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">4.9★</div>
                        <div className="text-xs text-gray-600">Customer Rating</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">23</div>
                        <div className="text-xs text-gray-600">Active Reservations</div>
                      </div>
                    </div>
                    
                    {/* Recent Orders */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                          <p className="text-sm text-gray-500">Latest orders from Bella Vista Restaurant</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { id: "ORD-20241201-001", name: "Esteban Ortiz", time: "21:14:06", amount: "$17.28", status: "served" },
                          { id: "ORD-20241201-002", name: "Esteban Ortiz vicente", time: "11:50:18", amount: "$13.17", status: "served" },
                          { id: "ORD-20241201-003", name: "Esteban Ortiz", time: "22:37:12", amount: "$26.46", status: "served" }
                        ].map((order, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{order.id}</div>
                              <div className="text-xs text-gray-500">{order.name} • {order.time}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                {order.status}
                              </Badge>
                              <div className="text-sm font-medium text-gray-900">{order.amount}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
              <Heart className="w-4 h-4 mr-2" />
              {getTranslation('testimonials.badge')}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{getTranslation('testimonials.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getTranslation('testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {getTranslation('testimonials.testimonials').map((testimonial: any, index: number) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.author.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <DollarSign className="w-4 h-4 mr-2" />
              {getTranslation('pricing.badge')}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{getTranslation('pricing.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getTranslation('pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-white border-2 border-gray-200 hover:border-[#7C3AED] transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{getTranslation('pricing.plans.starter.name')}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">{getTranslation('pricing.plans.starter.price')}</div>
                <div className="text-gray-600">{getTranslation('pricing.plans.starter.period')}</div>
                <CardDescription className="text-gray-600">
                  {getTranslation('pricing.plans.starter.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {getTranslation('pricing.plans.starter.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    {getTranslation('pricing.plans.starter.cta')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-white border-2 border-[#7C3AED] relative shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#7C3AED] text-white border-0">
                  {getTranslation('pricing.plans.professional.badge')}
                </Badge>
              </div>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{getTranslation('pricing.plans.professional.name')}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">{getTranslation('pricing.plans.professional.price')}</div>
                <div className="text-gray-600">{getTranslation('pricing.plans.professional.period')}</div>
                <CardDescription className="text-gray-600">
                  {getTranslation('pricing.plans.professional.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {getTranslation('pricing.plans.professional.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white">
                    {getTranslation('pricing.plans.professional.cta')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white border-2 border-gray-200 hover:border-[#7C3AED] transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{getTranslation('pricing.plans.enterprise.name')}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">{getTranslation('pricing.plans.enterprise.price')}</div>
                <div className="text-gray-600">{getTranslation('pricing.plans.enterprise.period')}</div>
                <CardDescription className="text-gray-600">
                  {getTranslation('pricing.plans.enterprise.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {getTranslation('pricing.plans.enterprise.features').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    {getTranslation('pricing.plans.enterprise.cta')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#7C3AED] to-[#D64DD2]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {getTranslation('cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {getTranslation('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-gray-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-lg px-8 py-4">
                <Rocket className="w-5 h-5 mr-2" />
                {getTranslation('cta.startFreeTrial')}
              </Button>
            </Link>
            <VideoModal videoId="623Cw28jD8o" title="Tably Restaurant Management Demo">
              <Button size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white hover:text-[#7C3AED] text-lg px-8 py-4 font-medium transition-all duration-300">
                <Play className="w-5 h-5 mr-2" />
                {getTranslation('cta.watchDemo')}
              </Button>
            </VideoModal>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{getTranslation('cta.trustIndicators.noCreditCard')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4" />
              <span>{getTranslation('cta.trustIndicators.setupIn5Minutes')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4" />
              <span>{getTranslation('cta.trustIndicators.support24_7')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Company Info - Full width on mobile */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Logo size="lg" />
              <p className="text-gray-400 mt-4 text-sm md:text-base leading-relaxed">
                {getTranslation('footer.description')}
              </p>
            </div>
            
            {/* Product Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">{getTranslation('footer.sections.product.title')}</h3>
              <ul className="space-y-3 text-gray-400">
                {getTranslation('footer.sections.product.links').map((link: string, index: number) => (
                  <li key={index}>
                    <Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">{getTranslation('footer.sections.support.title')}</h3>
              <ul className="space-y-3 text-gray-400">
                {getTranslation('footer.sections.support.links').map((link: string, index: number) => (
                  <li key={index}>
                    <Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">{getTranslation('footer.sections.company.title')}</h3>
              <ul className="space-y-3 text-gray-400">
                {getTranslation('footer.sections.company.links').map((link: string, index: number) => (
                  <li key={index}>
                    <Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm md:text-base text-center md:text-left">
                {getTranslation('footer.copyright')}
              </p>
              <div className="flex items-center space-x-4 text-gray-400">
                <a href="mailto:info@tably.digital" className="hover:text-white transition-colors text-sm">
                  {getTranslation('footer.email')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <TawkToScript />
    </div>
  )
}
