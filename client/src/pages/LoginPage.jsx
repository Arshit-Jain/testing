import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Login from '../components/Login'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  // Redirect to chat if already authenticated
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
