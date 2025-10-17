import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // ✅ Check auth status with backend
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

  // ✅ Handle OAuth redirect token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const oauthSuccess = params.get('oauth') === 'success'

    if (token && oauthSuccess) {
      authAPI.oauthComplete(token)
        .then((data) => {
          login(data.user, data.token)
          // Remove query params from URL
          const cleanUrl = window.location.origin + window.location.pathname
          window.history.replaceState({}, '', cleanUrl)
        })
        .catch(err => console.error('❌ OAuth token verification failed:', err))
    } else {
      checkAuthStatus()
    }
  }, [checkAuthStatus])

  // ✅ Login manually (regular JWT login or OAuth)
  const login = (userData, token) => {
    if (!userData) return
    console.log('🔐 useAuth: Logging in:', userData)

    if (token) {
      localStorage.setItem('authToken', token) // store JWT
    }

    setUser(userData)
    setIsAuthenticated(true)
  }

  // ✅ Logout
  const logout = async () => {
    try {
      console.log('🚪 useAuth: Logging out...')
      await authAPI.logout()
      localStorage.removeItem('authToken') // remove JWT
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
    checkAuthStatus,
  }
}
