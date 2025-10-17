import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Login from '../components/Login'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'

const LoginPage = () => {
  const { isAuthenticated, login, checkingAuth, checkAuthStatus } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [additionalCheck, setAdditionalCheck] = useState(false)

  // Check for OAuth redirect and verify authentication
  useEffect(() => {
    const checkAuthAfterOAuth = async () => {
      const oauthSuccess = searchParams.get('oauth')
      const error = searchParams.get('error')
      
      if (error) {
        console.error('OAuth error:', error, searchParams.get('message'))
        setAdditionalCheck(false)
        return
      }

      if (oauthSuccess === 'success') {
        console.log('=== OAuth success detected, checking auth status ===')
        setAdditionalCheck(true)
        
        // Wait a bit longer for session cookies to propagate
        await new Promise(resolve => setTimeout(resolve, 1000))

        try {
          // Force a fresh auth check
          await checkAuthStatus()
          
          // Give it another moment
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Check again
          const data = await authAPI.checkAuthStatus()
          console.log('=== Auth check result after OAuth ===', data)
          
          if (data.authenticated && data.user) {
            console.log('=== User authenticated via OAuth! ===', data.user)
            login(data.user)
            
            // Clean URL and redirect
            window.history.replaceState({}, '', '/login')
            setTimeout(() => {
              navigate('/chat', { replace: true })
            }, 100)
          } else {
            console.log('=== Auth check failed after OAuth ===')
            // Clear the oauth parameter
            window.history.replaceState({}, '', '/login')
          }
        } catch (error) {
          console.error('=== Auth check error ===', error)
        } finally {
          setAdditionalCheck(false)
        }
      }
    }

    if (!checkingAuth) {
      checkAuthAfterOAuth()
    }
  }, [searchParams, checkingAuth])

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('=== User is authenticated, redirecting to /chat ===')
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = (userData) => {
    console.log('=== Manual login ===', userData)
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
        width: '100%',
        background: 'linear-gradient(135deg, #F5F5F0 0%, #E6D8C3 50%, #C2A68C 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#2D2D2D' }}>
            {additionalCheck ? 'Completing Google sign in...' : 'Checking authentication...'}
          </p>
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