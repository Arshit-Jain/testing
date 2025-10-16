import { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authAPI.checkAuthStatus()
        
        if (data.authenticated) {
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
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
    logout
  }
}
