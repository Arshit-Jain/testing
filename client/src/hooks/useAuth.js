import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // ✅ Wrap in useCallback so React won't re-run effect unnecessarily
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 useAuth: Checking authentication status...')
      const response = await authAPI.checkAuthStatus()

      if (response?.authenticated && response?.user) {
        console.log('✅ useAuth: Authenticated user found:', response.user)
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        console.log('🚫 useAuth: Not authenticated')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ useAuth: Auth check failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }, [])

  // ✅ Check authentication only once on mount
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // ✅ Login manually after OAuth or form login
  const login = (userData) => {
    if (!userData) return
    console.log('🔐 useAuth: Logging in manually:', userData)
    setUser(userData)
    setIsAuthenticated(true)
  }

  // ✅ Logout, clear cookies and state
  const logout = async () => {
    try {
      console.log('🚪 useAuth: Logging out...')
      await authAPI.logout()
    } catch (error) {
      console.error('❌ useAuth: Logout failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return {
    user,
    isAuthenticated,
    checkingAuth,
    login,
    logout,
    checkAuthStatus, // ✅ optional re-check trigger for other components
  }
}