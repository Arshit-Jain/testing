import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import axios from "axios"

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("authToken"); // Get token from localStorage
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/status`, {
        headers: token
          ? { Authorization: `Bearer ${token}` } // Attach token
          : undefined,
        withCredentials: true, // optional if backend uses cookies
      });
      return response.data;
    } catch (err) {
      console.error("Auth check failed", err);
      throw err;
    }
  };


  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])


  const login = (userData, token) => {
    if (!userData) return
    console.log('🔐 useAuth: Logging in manually:', userData)
    if (token) localStorage.setItem('authToken', token) // store JWT
    setUser(userData)
    setIsAuthenticated(true)
  }


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
    checkAuthStatus
  }
}