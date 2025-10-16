import Login from './Login'
import Registration from './Registration'

const AuthWrapper = ({ 
  showRegistration, 
  onLogin, 
  onRegister, 
  onSwitchToRegistration, 
  onSwitchToLogin 
}) => {
  if (showRegistration) {
    return (
      <Registration 
        onRegister={onRegister} 
        onSwitchToLogin={onSwitchToLogin} 
      />
    )
  }
  
  return (
    <Login 
      onLogin={onLogin} 
      onSwitchToRegister={onSwitchToRegistration} 
    />
  )
}

export default AuthWrapper
