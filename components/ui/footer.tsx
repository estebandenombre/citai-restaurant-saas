"use client"

import Link from "next/link"
import { Logo } from "@/components/ui/logo"

interface FooterProps {
  variant?: "default" | "restaurant" | "simple"
  restaurantName?: string
  restaurantDescription?: string
  socialMedia?: Record<string, string>
}

export function Footer({ 
  variant = "default", 
  restaurantName, 
  restaurantDescription,
  socialMedia 
}: FooterProps) {
  if (variant === "simple") {
    return (
      <footer className="relative z-10 px-4 md:px-6 py-8 md:py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-4 md:mb-6">
            <img src="/tably_logo.png" alt="Tably" className="h-6 md:h-8 w-auto brightness-0 invert" />
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            © 2024 Tably. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    )
  }

  if (variant === "restaurant") {
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

    return (
      <footer className="bg-black text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Restaurant Info */}
            <div className="text-center mb-8 md:mb-12">
              <h3 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">{restaurantName}</h3>
              <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4">
                {restaurantDescription || "Delicious food, great service, unforgettable experiences"}
              </p>
            </div>

            {/* Social Media */}
            {socialMedia && Object.keys(socialMedia).length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 md:mb-12 px-4">
                {Object.entries(socialMedia)
                  .filter(([platform, url]) => url && url !== '')
                  .map(([platform, url]) => {
                    const socialUrl = buildSocialMediaUrl(platform, url as string)
                    
                    // Only render if we have a valid URL
                    if (!socialUrl) return null
                    
                    return (
                      <a
                        key={platform}
                        href={socialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                        title={`Follow us on ${platform}`}
                      >
                        <span className="text-sm md:text-base capitalize">{platform}</span>
                      </a>
                    )
                  })}
              </div>
            )}

            {/* Bottom Section */}
            <div className="border-t border-slate-800 pt-6 md:pt-8 text-center">
              <p className="text-slate-500 text-sm md:text-base px-4">
                Powered by <span className="text-blue-400 font-semibold">Tably</span> Restaurant Management Platform
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Default footer
  return (
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
  )
}
