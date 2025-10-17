import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Login from '../components/Login'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'

const LoginPage = () => {
  const { isAuthenticated, login, checkingAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [processingOAuth, setProcessingOAuth] = useState(false)
  const [oauthError, setOauthError] = useState('')

  // Debug: Log URL and params on mount
  useEffect(() => {
    console.log('=== LoginPage Mounted ===')
    console.log('Current URL:', window.location.href)
    console.log('Search params:', Object.fromEntries(searchParams.entries()))
    console.log('Token from URL:', searchParams.get('token'))
    console.log('OAuth param:', searchParams.get('oauth'))
    console.log('Error param:', searchParams.get('error'))
  }, [searchParams])

  // Handle OAuth redirect with token exchange
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const token = searchParams.get('token')
      const oauthSuccess = searchParams.get('oauth')
      const error = searchParams.get('error')
      const errorMessage = searchParams.get('message')
      
      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error, errorMessage)
        setOauthError(`Authentication failed: ${errorMessage || error}`)
        // Clean URL
        window.history.replaceState({}, '', '/login')
        return
      }

      // Handle successful OAuth with token
      if (token && oauthSuccess === 'success') {
        console.log('=== OAuth token received ===')
        console.log('Token (first 30 chars):', token.substring(0, 30) + '...')
        setProcessingOAuth(true)
        
        try {
          // Decode token using atob (works in browser)
          const decoded = JSON.parse(atob(token))
          console.log('=== Decoded token data ===', {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            timestamp: new Date(decoded.timestamp).toISOString()
          })
          
          // Exchange token for JWT
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
          console.log('=== Exchanging token for JWT ===')
          console.log('API URL:', API_BASE_URL)
          
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/oauth-complete`,
            { token },
            { 
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )
          
          console.log('=== Token exchange response ===', response.data)
          
          if (response.data.success && response.data.user && response.data.token) {
            console.log('=== OAuth JWT received successfully! ===')
            console.log('User data:', response.data.user)
            
            // Save JWT token to localStorage
            localStorage.setItem('authToken', response.data.token)
            console.log('=== JWT token saved to localStorage ===')
            
            // Log in user
            login(response.data.user)
            
            // Clean URL
            window.history.replaceState({}, '', '/login')
            
            // Small delay to ensure state updates
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Navigate to chat
            console.log('=== Navigating to /chat ===')
            navigate('/chat', { replace: true })
          } else {
            console.error('OAuth JWT creation failed:', response.data)
            setOauthError('Failed to establish session. Please try again.')
          }
        } catch (error) {
          console.error('=== OAuth token exchange failed ===', error)
          console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          })
          setOauthError('Failed to complete sign in. Please try again.')
        } finally {
          setProcessingOAuth(false)
          // Clean URL even on error
          window.history.replaceState({}, '', '/login')
        }
      } else if (oauthSuccess === 'success' && !token) {
        // OAuth succeeded but no token - this shouldn't happen
        console.error('=== OAuth success but no token received ===')
        setOauthError('Authentication incomplete. Please try again.')
        window.history.replaceState({}, '', '/login')
      }
    }

    // Only run if not already authenticated and not checking auth
    if (!checkingAuth && !isAuthenticated) {
      handleOAuthRedirect()
    }
  }, [searchParams, checkingAuth, isAuthenticated, login, navigate])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('=== User is already authenticated, redirecting to /chat ===')
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Handle manual login (username/password)
  const handleLogin = (userData) => {
    console.log('=== Manual login successful ===', userData)
    login(userData)
    navigate('/chat', { replace: true })
  }

  // Switch to registration page
  const handleSwitchToRegister = () => {
    navigate('/new-account', { replace: true })
  }

  // Show loading screen while checking auth or processing OAuth
  if (checkingAuth || processingOAuth) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
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
          <p style={{ color: '#2D2D2D', fontSize: '16px', fontWeight: '500' }}>
            {processingOAuth ? 'Completing Google sign in...' : 'Checking authentication...'}
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  // Render login form
  return (
    <>
      {oauthError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff6b6b',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          {oauthError}
        </div>
      )}
      <Login 
        onLogin={handleLogin} 
        onSwitchToRegister={handleSwitchToRegister} 
      />
    </>
  )
}

export default LoginPage