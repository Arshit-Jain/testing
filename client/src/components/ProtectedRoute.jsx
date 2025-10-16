import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkingAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, checkingAuth, navigate])

  if (checkingAuth) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return children
}

export default ProtectedRoute
