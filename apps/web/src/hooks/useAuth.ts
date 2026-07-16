'use client'
import { useAuth as useClerkAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setAuthToken } from '@/lib/api'

export function useAuthToken() {
  const { getToken, isSignedIn } = useClerkAuth()
  useEffect(() => {
    const updateToken = async () => {
      if (isSignedIn) {
        const token = await getToken()
        setAuthToken(token)
      } else {
        setAuthToken(null)
      }
    }
    updateToken()
  }, [isSignedIn, getToken])
}

export { useClerkAuth as useAuth }
