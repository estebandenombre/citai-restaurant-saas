import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { VideoModal } from "@/components/video-modal"
import TawkToScript from "@/components/tawk-to-script"
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

export default function HomePage() {
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
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-[#7C3AED] transition-colors font-medium">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-[#7C3AED] transition-colors font-medium">
              Reviews
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-[#7C3AED] transition-colors font-medium">
              Sign In
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                Get Started Free
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
                🚀 Now Live on Product Hunt
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Restaurant Management Software
              <span className="block bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] bg-clip-text text-transparent">
                That Actually Works
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your restaurant with Tably's comprehensive SaaS platform. Accept online orders, manage reservations, track kitchen tickets, and get AI-powered insights to boost revenue and streamline operations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-lg px-8 py-4">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <VideoModal videoId="623Cw28jD8o" title="Tably Restaurant Management Demo">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:text-gray-900 text-lg px-8 py-4 font-medium">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </VideoModal>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-blue-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4 text-purple-500" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by 500+ Restaurants Worldwide</h2>
            <p className="text-gray-600">Join restaurants that have transformed their operations with Tably</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7C3AED] mb-2">500+</div>
              <div className="text-sm text-gray-600">Active Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#D64DD2] mb-2">50K+</div>
              <div className="text-sm text-gray-600">Orders Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF6B6B] mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4B0082] mb-2">4.9★</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
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
              All-in-One Restaurant SaaS
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Restaurant Management Software</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From online ordering and reservations to kitchen management and AI analytics, Tably provides everything you need to run your restaurant efficiently and profitably.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Online Ordering System</CardTitle>
                <CardDescription>
                  Accept online orders, track status in real-time, and manage your kitchen workflow seamlessly with our restaurant POS system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Real-time order tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Kitchen display system</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Payment processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Restaurant Reservation System</CardTitle>
                <CardDescription>
                  Manage your table bookings, optimize seating capacity, and streamline your restaurant reservation system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Online booking system</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Table management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Waitlist management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Digital Menu Management</CardTitle>
                <CardDescription>
                  Create and manage your digital menu with categories, pricing, and real-time availability updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Digital menu builder</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Category organization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Pricing management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Inventory Management Software</CardTitle>
                <CardDescription>
                  Track your stock levels, manage inventory efficiently, and get automated alerts for low stock with our restaurant inventory management software.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Stock level tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Low stock alerts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Supplier management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI Restaurant Analytics</CardTitle>
                <CardDescription>
                  Get AI-powered insights into your restaurant's performance, trends, and actionable recommendations to boost revenue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Sales analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Customer insights</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Performance reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Restaurant Staff Management</CardTitle>
                <CardDescription>
                  Manage your team schedules, roles, and permissions effectively with our comprehensive restaurant management software.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Employee scheduling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Role-based access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Performance tracking</span>
                  </li>
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
                See It In Action
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Restaurant Management Dashboard That Actually Works
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Tably's intuitive restaurant management software interface makes running your restaurant effortless. Everything you need is just one click away.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Mobile-responsive design</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Real-time updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Cloud-based sync</span>
                </div>
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
              Customer Love
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of restaurant owners who have transformed their business with Tably
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Tably has completely transformed how we run our restaurant. The order management is seamless, and the analytics help us make better decisions. Our revenue increased by 40% in just 3 months!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Owner, Dragon Wok</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "The reservation system is a game-changer. We've reduced no-shows by 60% and our staff can focus on providing excellent service instead of managing bookings manually."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Miguel Rodriguez</div>
                    <div className="text-sm text-gray-600">Manager, La Casa</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Setup was incredibly easy - we were up and running in under 10 minutes. The inventory management has saved us thousands in waste, and the customer support is outstanding."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">E</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Emma Thompson</div>
                    <div className="text-sm text-gray-600">Chef, Fresh Bites</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <DollarSign className="w-4 h-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-white border-2 border-gray-200 hover:border-[#7C3AED] transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">$29</div>
                <div className="text-gray-600">per month</div>
                <CardDescription className="text-gray-600">
                  Perfect for small restaurants just getting started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Up to 5 staff members</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Basic order management</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Reservation system</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Menu management</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-white border-2 border-[#7C3AED] relative shadow-xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#7C3AED] text-white border-0">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Professional</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">$79</div>
                <div className="text-gray-600">per month</div>
                <CardDescription className="text-gray-600">
                  Everything you need to run a successful restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Unlimited staff members</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Advanced order management</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Inventory management</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Analytics & reporting</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">API access</span>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#D64DD2] hover:from-[#6B21A8] hover:to-[#C2185B] text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white border-2 border-gray-200 hover:border-[#7C3AED] transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">$199</div>
                <div className="text-gray-600">per month</div>
                <CardDescription className="text-gray-600">
                  For restaurant chains and large operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Multi-location support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Custom integrations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">24/7 phone support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Custom training</span>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    Contact Sales
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
            Ready to Transform Your Restaurant with AI-Powered Software?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join 500+ restaurants that have already streamlined their operations with Tably's restaurant management software. Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-gray-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-lg px-8 py-4">
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
                         <VideoModal videoId="623Cw28jD8o" title="Tably Restaurant Management Demo">
                           <Button size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white hover:text-[#7C3AED] text-lg px-8 py-4 font-medium transition-all duration-300">
                             <Play className="w-5 h-5 mr-2" />
                             Watch Demo
                           </Button>
                         </VideoModal>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4" />
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4" />
              <span>24/7 support</span> 
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
                The restaurant management platform that actually works. Streamline your operations, boost your revenue, and delight your customers.
              </p>
            </div>
            
            {/* Product Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Demo</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">API</Link></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Help Center</Link></li>
                <li><a href="mailto:info@tably.digital" className="hover:text-white transition-colors text-sm md:text-base block py-1">Contact Us</a></li>
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Status</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Training</Link></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-sm md:text-base block py-1">Careers</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors text-sm md:text-base block py-1">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors text-sm md:text-base block py-1">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm md:text-base text-center md:text-left">
                &copy; 2024 Tably. All rights reserved. Made with ❤️ for restaurant owners.
              </p>
              <div className="flex items-center space-x-4 text-gray-400">
                <a href="mailto:info@tably.digital" className="hover:text-white transition-colors text-sm">
                  info@tably.digital
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
