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

      const cleanUrl = () => window.history.replaceState({}, '', '/login')

      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error, errorMessage)
        setOauthError(`Authentication failed: ${errorMessage || error}`)
        cleanUrl()
        return
      }

      // Handle successful OAuth with token
      if (token && oauthSuccess === 'success') {
        console.log('=== OAuth token received ===')
        console.log('Token (first 30 chars):', token.substring(0, 30) + '...')
        setProcessingOAuth(true)

        try {
          // Decode JWT payload (middle part only)
          const jwtParts = token.split('.')
          if (jwtParts.length !== 3) throw new Error('Invalid JWT format')
          const payloadBase64 = jwtParts[1].replace(/-/g, '+').replace(/_/g, '/')
          const decodedPayload = JSON.parse(atob(payloadBase64))

          const ts = decodedPayload.timestamp ? new Date(decodedPayload.timestamp) : null
          const timestampISO = ts && !isNaN(ts.getTime()) ? ts.toISOString() : null;

          console.log('=== Decoded JWT payload ===', {
            userId: decodedPayload.userId,
            username: decodedPayload.username,
            email: decodedPayload.email,
            timestamp: timestampISO
          })

          // Exchange token for JWT from backend
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
          console.log('=== Exchanging token for JWT ===', API_BASE_URL)

          const response = await axios.post(
            `${API_BASE_URL}/api/auth/oauth-complete`,
            { token },
            { 
              withCredentials: true,
              headers: { 'Content-Type': 'application/json' }
            }
          )

          console.log('=== Token exchange response ===', response.data)

          if (response.data.success && response.data.user && response.data.token) {
            console.log('=== OAuth JWT received successfully! ===', response.data.user)
            localStorage.setItem('authToken', response.data.token)
            login(response.data.user)
            cleanUrl()
            await new Promise(resolve => setTimeout(resolve, 100))
            navigate('/chat', { replace: true })
          } else {
            console.error('OAuth JWT creation failed:', response.data)
            setOauthError('Failed to establish session. Please try again.')
          }
        } catch (err) {
          console.error('=== OAuth token exchange failed ===', err)
          console.error('Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          })
          setOauthError('Failed to complete sign in. Please try again.')
        } finally {
          setProcessingOAuth(false)
          cleanUrl()
        }
      } else if (oauthSuccess === 'success' && !token) {
        console.error('=== OAuth success but no token received ===')
        setOauthError('Authentication incomplete. Please try again.')
        cleanUrl()
      }
    }

    if (!checkingAuth && !isAuthenticated) handleOAuthRedirect()
  }, [searchParams, checkingAuth, isAuthenticated, login, navigate])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('=== User is already authenticated, redirecting to /chat ===')
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Manual login handler
  const handleLogin = (userData) => {
    console.log('=== Manual login successful ===', userData)
    login(userData)
    navigate('/chat', { replace: true })
  }

  const handleSwitchToRegister = () => navigate('/new-account', { replace: true })

  if (checkingAuth || processingOAuth) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100vh', width: '100%', background: 'linear-gradient(135deg, #F5F5F0 0%, #E6D8C3 50%, #C2A68C 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '4px solid #E6D8C3', borderTop: '4px solid #5D866C',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#2D2D2D', fontSize: '16px', fontWeight: '500' }}>
            {processingOAuth ? 'Completing Google sign in...' : 'Checking authentication...'}
          </p>
        </div>
        <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <>
      {oauthError && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#ff6b6b', color: 'white', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, maxWidth: '90%', textAlign: 'center'
        }}>
          {oauthError}
        </div>
      )}
      <Login onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />
    </>
  )
}

export default LoginPage