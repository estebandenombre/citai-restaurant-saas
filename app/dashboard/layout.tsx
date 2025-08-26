"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { AIChat } from "@/components/ai-chat/ai-chat"
import { TrialExpiredBanner, TrialExpiredCard } from "@/components/subscription/trial-expired-banner"
import { useSubscription } from "@/hooks/use-subscription"
import { AuthGuard } from "@/components/auth/auth-guard"
import { supabase } from "@/lib/supabase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const { isTrialExpired, loading } = useSubscription()


  return (
    <AuthGuard>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
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
