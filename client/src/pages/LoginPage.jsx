import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Login from '../components/Login'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [checkingOAuth, setCheckingOAuth] = useState(true)

  // Check for OAuth redirect or existing session
  useEffect(() => {
    const checkAuthAfterOAuth = async () => {
      try {
        console.log('=== LoginPage: Checking auth status after potential OAuth ===')
        
        // Check if there's an error from OAuth
        const error = searchParams.get('error')
        if (error) {
          console.error('OAuth error:', error)
          setCheckingOAuth(false)
          return
        }

        // Check authentication status
        const data = await authAPI.checkAuthStatus()
        console.log('=== LoginPage: Auth check result ===', data)
        
        if (data.authenticated && data.user) {
          console.log('=== LoginPage: User is authenticated, logging in ===', data.user)
          login(data.user)
          navigate('/chat', { replace: true })
        } else {
          console.log('=== LoginPage: User not authenticated ===')
        }
      } catch (error) {
        console.error('=== LoginPage: Auth check failed ===', error)
      } finally {
        setCheckingOAuth(false)
      }
    }

    // Only check if not already authenticated
    if (!isAuthenticated) {
      checkAuthAfterOAuth()
    } else {
      setCheckingOAuth(false)
    }
  }, []) // Run once on mount

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = (userData) => {
    login(userData)
    navigate('/chat', { replace: true })
  }

  const handleSwitchToRegister = () => {
    navigate('/new-account', { replace: true })
  }

  // Show loading while checking OAuth
  if (checkingOAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #F5F5F0 0%, #E6D8C3 50%, #C2A68C 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E6D8C3',
            borderTop: '4px solid #5D866C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#2D2D2D' }}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <Login 
      onLogin={handleLogin} 
      onSwitchToRegister={handleSwitchToRegister} 
    />
  )
}

export default LoginPage