import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface TrialStatus {
  isTrial: boolean
  isExpired: boolean
  daysRemaining: number
  trialEnd: Date
}

export function useTrialStatus() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrialStatus() {
      try {
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('No authenticated user')
          return
        }

        // Get user from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('created_at')
          .eq('email', user.email)
          .single()

        if (userError || !userData) {
          setError('User not found in database')
          return
        }

        // Calculate trial status based on created_at
        const trialDays = 14
        const trialStart = new Date(userData.created_at)
        const trialEnd = new Date(trialStart.getTime() + (trialDays * 24 * 60 * 60 * 1000))
        const now = new Date()
        
        const isExpired = now > trialEnd
        const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))

        setTrialStatus({
          isTrial: true, // All users are on trial
          isExpired,
          daysRemaining,
          trialEnd
        })

      } catch (err) {
        console.error('Error fetching trial status:', err)
        setError('Failed to fetch trial status')
      } finally {
        setLoading(false)
      }
    }

    fetchTrialStatus()
  }, [])

  return { trialStatus, loading, error }
}


