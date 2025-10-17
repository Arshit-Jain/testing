import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

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


  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])


  const login = (userData) => {
    if (!userData) return
    console.log('🔐 useAuth: Logging in manually:', userData)
    setUser(userData)
    setIsAuthenticated(true)
  }


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
    checkAuthStatus
  }
}