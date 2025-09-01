import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export function useSession() {
  const supabase = createClient()

  const checkAndRefreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
      })
      
      const data = await response.json()
      
      if (data.needsRefresh) {
        // Refresh the session
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
        })
        
        if (!refreshResponse.ok) {
          // Session refresh failed, redirect to login
          window.location.href = '/auth/login'
        }
      }
    } catch (error) {
      console.error('Session check error:', error)
    }
  }, [])

  useEffect(() => {
    // Check session on mount
    checkAndRefreshSession()

    // Set up interval to check session every 4 minutes
    const interval = setInterval(checkAndRefreshSession, 4 * 60 * 1000)

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully')
        } else if (event === 'SIGNED_OUT') {
          window.location.href = '/auth/login'
        }
      }
    )

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [supabase, checkAndRefreshSession])
}