"use client"

import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  ChefHat, 
  Utensils, 
  Heart,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Calendar
} from "lucide-react"
import Image from "next/image"
import { useEffect, useState, use } from "react"
import SimpleCart from "@/components/restaurant/simple-cart"
import MenuItem from "@/components/restaurant/menu-item"
import ReservationForm from "@/components/restaurant/reservation-form"
import { Footer } from "@/components/ui/footer"

async function getRestaurant(slug: string) {
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !restaurant) {
    return null
  }

  return restaurant
}

async function getMenuItems(restaurantId: string) {
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      menu_items (*)
    `)
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("display_order")



  return categories || []
}

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await getRestaurant(resolvedParams.slug)
        if (!restaurantData) {
          notFound()
        }
        setRestaurant(restaurantData)
        
        const categoriesData = await getMenuItems(restaurantData.id)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching restaurant data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    notFound()
  }

  const themeColors = restaurant.theme_colors || { primary: "#2563eb", secondary: "#64748b" }
  
  // Helper function to build social media URLs
  const buildSocialMediaUrl = (platform: string, handle: string) => {
    if (!handle || handle === '') return ''
    
    // If it's already a full URL, return it as is
    if (handle.startsWith('http://') || handle.startsWith('https://')) {
      return handle
    }
    
    // Remove @ symbol if present and clean the handle
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle
    
    // Remove any leading/trailing whitespace
    const trimmedHandle = cleanHandle.trim()
    
    // If handle is empty after cleaning, return empty string
    if (!trimmedHandle) return ''
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        return `https://www.facebook.com/${trimmedHandle}`
      case 'instagram':
        return `https://www.instagram.com/${trimmedHandle}`
      case 'twitter':
        return `https://x.com/${trimmedHandle}`
      case 'tiktok':
        return `https://www.tiktok.com/@${trimmedHandle}`
      default:
        return handle
    }
  }
  
  // Create dynamic styles based on theme colors
  const dynamicStyles = {
    primary: {
      backgroundColor: themeColors.primary,
      color: '#ffffff',
      borderColor: themeColors.primary,
    },
    secondary: {
      backgroundColor: themeColors.secondary,
      color: '#ffffff',
      borderColor: themeColors.secondary,
    },
    primaryText: {
      color: themeColors.primary,
    },
    secondaryText: {
      color: themeColors.secondary,
    },
    primaryBorder: {
      borderColor: themeColors.primary,
    },
    secondaryBorder: {
      borderColor: themeColors.secondary,
    },
    primaryHover: {
      backgroundColor: themeColors.primary,
      color: '#ffffff',
    },
    secondaryHover: {
      backgroundColor: themeColors.secondary,
      color: '#ffffff',
    }
  }

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToContact = () => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToReservations = () => {
    document.getElementById('reservations-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {restaurant.logo_url && (
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              )}
              <span className="text-xl font-bold text-slate-900">{restaurant.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={scrollToMenu} className="hidden sm:flex text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                Menu
              </Button>
              <Button variant="ghost" onClick={scrollToContact} className="hidden sm:flex text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                Contact
              </Button>
              <Button 
                onClick={scrollToMenu} 
                className="text-white hover:scale-105 transition-all duration-300"
                style={dynamicStyles.primary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColors.primary;
                }}
              >
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {restaurant.cover_image_url ? (
            <Image
              src={restaurant.cover_image_url}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <Image
              src="/back_restaurant.png"
              alt="Restaurant background"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          {/* Logo */}
          {restaurant.logo_url && (
            <div className="mb-8 animate-fade-in">
              <div className="relative">
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={120}
                  height={120}
                  className="mx-auto rounded-2xl border-4 border-white/20 shadow-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
              </div>
            </div>
          )}
          
          {/* Restaurant Name */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up">
            {restaurant.name}
          </h1>
          
          {/* Cuisine Type */}
          {restaurant.cuisine_type && (
            <Badge className="bg-white/20 backdrop-blur-sm text-white text-lg px-8 py-3 mb-8 border border-white/30 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {restaurant.cuisine_type}
            </Badge>
          )}
          
          {/* Description */}
            {restaurant.description && (
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {restaurant.description}
            </p>
            )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
              style={dynamicStyles.primary}
              onClick={scrollToMenu}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary;
              }}
            >
              <Utensils className="mr-3 h-6 w-6" />
              Explore Menu
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              className="text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
              style={dynamicStyles.secondary}
              onClick={scrollToReservations}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.secondary;
              }}
            >
              <Calendar className="mr-3 h-6 w-6" />
              Make Reservation
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
              onClick={scrollToContact}
            >
              <Phone className="mr-3 h-6 w-6" />
              Contact Us
            </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>



      {/* Menu Section */}
      <section id="menu-section" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div 
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6 text-white font-medium"
              style={{ backgroundColor: `${themeColors.primary}20` }}
            >
              <Sparkles className="h-5 w-5" style={{ color: themeColors.primary }} />
              <span style={{ color: themeColors.primary }}>Our Menu</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Culinary Excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover our carefully crafted dishes, each prepared with passion and the finest ingredients
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Menu Coming Soon</h3>
              <p className="text-slate-600 text-lg">We're working on adding our delicious items to the menu.</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {categories.map((category: any, index: number) => (
                <div key={category.id} className="mb-20">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{category.name}</h3>
                    {category.description && (
                      <p className="text-slate-600 text-lg max-w-2xl mx-auto">{category.description}</p>
                    )}
      </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.menu_items
                      ?.filter((item: any) => item.is_available)
                      ?.sort((a: any, b: any) => a.display_order - b.display_order)
                      ?.map((item: any) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          restaurantId={restaurant.id}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reservations Section */}
      <section id="reservations-section" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Book Your Table
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Experience our exceptional service and exquisite cuisine. Reserve your table today.
            </p>
            <ReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16 px-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Visit Us Today</h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                We'd love to see you! Come experience our delicious food and warm hospitality in a welcoming atmosphere.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 px-4">
              {/* Contact Info */}
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Get in Touch</h3>
                
                <div className="space-y-4 md:space-y-6">
                  {restaurant.address && (
                    <div className="flex items-start space-x-3 md:space-x-4 p-4 md:p-6 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-sm">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base md:text-lg mb-1">Address</p>
                        <p className="text-slate-300 leading-relaxed text-sm md:text-base break-words">{restaurant.address}</p>
                      </div>
                    </div>
                  )}

                  {restaurant.phone && (
                    <div className="flex items-start space-x-3 md:space-x-4 p-4 md:p-6 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-sm">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base md:text-lg mb-1">Phone</p>
                        <p className="text-slate-300 text-sm md:text-base break-words">{restaurant.phone}</p>
                      </div>
                    </div>
                  )}

                  {restaurant.email && (
                    <div className="flex items-start space-x-3 md:space-x-4 p-4 md:p-6 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-sm">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base md:text-lg mb-1">Email</p>
                        <p className="text-slate-300 text-sm md:text-base break-words">{restaurant.email}</p>
                      </div>
                    </div>
                  )}

                  {restaurant.website && (
                    <div className="flex items-start space-x-3 md:space-x-4 p-4 md:p-6 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-sm">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Globe className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base md:text-lg mb-1">Website</p>
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm md:text-base break-all"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media & Opening Hours */}
              <div className="space-y-6 md:space-y-8">
                {/* Social Media */}
                {restaurant.social_media && Object.entries(restaurant.social_media).some(([platform, url]) => url && url !== '') && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Follow Us</h3>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      {Object.entries(restaurant.social_media)
                        .filter(([platform, url]) => url && url !== '')
                        .map(([platform, url]) => {
                          const getIcon = (platform: string) => {
                            switch (platform.toLowerCase()) {
                              case 'instagram': return <Instagram className="h-5 w-5 md:h-6 md:w-6" />
                              case 'facebook': return <Facebook className="h-5 w-5 md:h-6 md:w-6" />
                              case 'twitter': return <Twitter className="h-5 w-5 md:h-6 md:w-6" />
                              case 'tiktok': return <Youtube className="h-5 w-5 md:h-6 md:w-6" />
                              default: return null
                            }
                          }
                          
                          const socialUrl = buildSocialMediaUrl(platform, url as string)
                          
                          // Only render if we have a valid URL
                          if (!socialUrl) return null
                          
                          return (
                            <a
                              key={platform}
                              href={socialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 p-3 md:p-4 bg-white/10 rounded-lg md:rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                              title={`Follow us on ${platform}`}
                            >
                              {getIcon(platform)}
                              <span className="capitalize font-medium text-sm md:text-base">{platform}</span>
                            </a>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Opening Hours */}
                {restaurant.opening_hours && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8">Opening Hours</h3>
                    <div className="space-y-3 md:space-y-4">
                      {Object.entries(restaurant.opening_hours).map(([day, hours]) => {
                        const hoursObj = hours as { open: string; close: string }
                        return (
                          <div key={day} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 md:py-4 border-b border-white/20 last:border-b-0 gap-1 sm:gap-0">
                            <span className="capitalize font-semibold text-base md:text-lg">{day}</span>
                            <span className="text-slate-300 text-sm md:text-base sm:text-lg">{hoursObj.open} - {hoursObj.close}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer 
        variant="restaurant"
        restaurantName={restaurant.name}
        restaurantDescription={restaurant.description}
        socialMedia={restaurant.social_media}
      />

      {/* Shopping Cart */}
      <SimpleCart restaurantId={restaurant.id} />
    </div>
  )
}
