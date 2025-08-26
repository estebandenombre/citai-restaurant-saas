import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check if user has completed onboarding from public.users table
          const { data: userData } = await supabase
            .from("users")
            .select("has_completed_onboarding")
            .eq("email", user.email)
            .single()

          const completed = userData?.has_completed_onboarding || false
          setHasCompletedOnboarding(completed)

          // If user hasn't completed onboarding, show tutorial automatically
          if (!completed) {
            setIsOnboardingOpen(true)
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
        setHasCompletedOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  const completeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Update user record to mark onboarding as completed in public.users table
        await supabase
          .from("users")
          .update({ has_completed_onboarding: true })
          .eq("email", user.email)

        setHasCompletedOnboarding(true)
        setIsOnboardingOpen(false)
        
        // Show celebration
        setShowCelebration(true)
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const openOnboarding = () => {
    setIsOnboardingOpen(true)
  }

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  const closeCelebration = () => {
    setShowCelebration(false)
  }

  return {
    hasCompletedOnboarding,
    isOnboardingOpen,
    showCelebration,
    completeOnboarding,
    openOnboarding,
    closeOnboarding,
    closeCelebration
  }
} 