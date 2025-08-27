"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { AIChat } from "@/components/ai-chat/ai-chat"
import { TrialExpiredBanner, TrialExpiredCard } from "@/components/subscription/trial-expired-banner"
import { useSubscription } from "@/hooks/use-subscription"
import { AuthGuard } from "@/components/auth/auth-guard"
import { supabase } from "@/lib/supabase"
import Script from "next/script"

// Declare Tawk_API types
declare global {
  interface Window {
    Tawk_API?: {
      hideWidget: () => void
    }
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const { isTrialExpired, loading } = useSubscription()

  useEffect(() => {
    // Hide Tawk.to widget if it exists
    const hideTawkWidget = () => {
      if (typeof window !== 'undefined' && window.Tawk_API) {
        window.Tawk_API.hideWidget()
      }
    }

    // Try to hide immediately
    hideTawkWidget()
    
    // Also try after a short delay to ensure Tawk is loaded
    const timer = setTimeout(hideTawkWidget, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthGuard>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
          {/* Hide Tawk.to widget script */}
          <Script
            id="hide-tawk-widget"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof Tawk_API !== 'undefined') {
                  Tawk_API.hideWidget();
                }
                // Also hide any existing Tawk elements
                const tawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"]');
                tawkElements.forEach(el => {
                  if (el.style) {
                    el.style.display = 'none';
                  }
                });
              `,
            }}
          />
          
          {/* Show trial expired banner if trial has expired */}
          {!loading && isTrialExpired && (
            <TrialExpiredBanner />
          )}
          
          <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
          <MainContent sidebarCollapsed={sidebarCollapsed}>{children}</MainContent>
          <AIChat isOpen={aiChatOpen} onToggle={() => setAiChatOpen(!aiChatOpen)} />
        </div>
      </ThemeProvider>
    </AuthGuard>
  )
}

function MainContent({ 
  children, 
  sidebarCollapsed 
}: { 
  children: React.ReactNode
  sidebarCollapsed: boolean
}) {
  const { isTrialExpired, loading } = useSubscription()
  
  return (
    <div className={`transition-all duration-300 ease-in-out min-h-screen ${
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    }`}>
      <main className="flex-1">
        <div className="p-8">
          {/* Show trial expired card if trial has expired */}
          {!loading && isTrialExpired ? (
            <div className="max-w-2xl mx-auto mt-8">
              <TrialExpiredCard />
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  )
}
