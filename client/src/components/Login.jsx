import { useState } from 'react'
import './Login.css'
import { authAPI } from '../services/api'
import { FcGoogle } from 'react-icons/fc'


const Login = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await authAPI.login(username, password)

      if (data.success) {
        onLogin(data.user)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Network error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const apiBaseUrl = import.meta.env.VITE_API_URL
    window.location.href = `${apiBaseUrl}/auth/google`
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to Multi API Research</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Google login button */}
        <button className="google-btn" onClick={handleGoogleLogin}>
          <FcGoogle size={20} style={{ marginRight: '8px' }} />
          Continue with Google
        </button>

        <div className="switch-form">
          <p>Don't have an account?</p>
          <button type="button" onClick={onSwitchToRegister} className="switch-btn">
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
