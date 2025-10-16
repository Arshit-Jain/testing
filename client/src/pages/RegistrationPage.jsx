import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Registration from '../components/Registration'
import { useAuth } from '../hooks/useAuth'

const RegistrationPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  // Redirect to chat if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleRegister = (userData) => {
    login(userData)
    navigate('/chat', { replace: true })
  }

  const handleSwitchToLogin = () => {
    navigate('/login', { replace: true })
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <Registration 
      onRegister={handleRegister} 
      onSwitchToLogin={handleSwitchToLogin} 
    />
  )
}

export default RegistrationPage
