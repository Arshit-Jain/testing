import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Login from '../components/Login'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'

const LoginPage = () => {
  const { isAuthenticated, login, checkingAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [additionalCheck, setAdditionalCheck] = useState(true)

  // Additional check after OAuth redirect
  useEffect(() => {
    const checkAuthAfterOAuth = async () => {
      try {
        console.log('=== LoginPage: Starting auth check ===')
        console.log('Current URL:', window.location.href)
        console.log('Search params:', Object.fromEntries(searchParams.entries()))
        
        // Check if there's an error from OAuth
        const error = searchParams.get('error')
        if (error) {
          console.error('OAuth error:', error)
          setAdditionalCheck(false)
          return
        }

        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check authentication status
        console.log('=== LoginPage: Calling checkAuthStatus ===')
        const data = await authAPI.checkAuthStatus()
        console.log('=== LoginPage: Auth check result ===', data)
        
        if (data.authenticated && data.user) {
          console.log('=== LoginPage: User is authenticated! ===', data.user)
          login(data.user)
          // Use a small delay before navigation
          setTimeout(() => {
            navigate('/chat', { replace: true })
          }, 100)
        } else {
          console.log('=== LoginPage: User NOT authenticated ===')
        }
      } catch (error) {
        console.error('=== LoginPage: Auth check error ===', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
      } finally {
        setAdditionalCheck(false)
      }
    }

    // Wait for initial auth check from useAuth to complete
    if (!checkingAuth && !isAuthenticated) {
      checkAuthAfterOAuth()
    } else if (!checkingAuth && isAuthenticated) {
      setAdditionalCheck(false)
    }
  }, [checkingAuth, isAuthenticated])

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('=== LoginPage: isAuthenticated is true, redirecting to /chat ===')
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = (userData) => {
    console.log('=== LoginPage: Manual login ===', userData)
    login(userData)
    navigate('/chat', { replace: true })
  }

  const handleSwitchToRegister = () => {
    navigate('/new-account', { replace: true })
  }

  // Show loading while checking
  if (checkingAuth || additionalCheck) {
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